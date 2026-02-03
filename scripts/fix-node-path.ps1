<#
PowerShell helper: fix-node-path.ps1

Usage:
  # Dry run: print diagnostics
  powershell -ExecutionPolicy Bypass -File .\scripts\fix-node-path.ps1

  # Attempt to add "C:\Program Files\nodejs" to User PATH if missing
  powershell -ExecutionPolicy Bypass -File .\scripts\fix-node-path.ps1 -Fix

What it does:
 - Shows Machine and User PATH entries
 - Lists files in C:\Program Files\nodejs
 - Tries to run node/npm/pnpm from full paths
 - If -Fix is provided, appends C:\Program Files\nodejs to User PATH
 - Prints guidance to restart shells

Note: This script modifies your User environment when -Fix is given. No admin rights required.
#>

param(
  [switch]$Fix
)

function Write-Note($s) { Write-Host $s -ForegroundColor Cyan }
function Write-Warn($s) { Write-Host $s -ForegroundColor Yellow }
function Write-Err($s) { Write-Host $s -ForegroundColor Red }

Write-Note "=== Node.js / npm / pnpm PATH Diagnostic ==="

Write-Note "\n-- Machine PATH (excerpt) --"
$machine = [Environment]::GetEnvironmentVariable('Path','Machine')
$machine -split ';' | ForEach-Object { $_.Trim() } | Where-Object { $_ -ne '' } | Select-Object -First 30 | ForEach-Object { Write-Host "  $_" }

Write-Note "\n-- User PATH (excerpt) --"
$user = [Environment]::GetEnvironmentVariable('Path','User')
if (-not $user) { Write-Host '  (no user PATH defined)' } else { $user -split ';' | ForEach-Object { $_.Trim() } | Where-Object { $_ -ne '' } | Select-Object -First 30 | ForEach-Object { Write-Host "  $_" } }

Write-Note "\n-- Check nodejs folder contents (C:\Program Files\nodejs) --"
$nodeFolder = 'C:\Program Files\nodejs'
if (Test-Path $nodeFolder) {
  Get-ChildItem $nodeFolder | Select-Object Name,Length,LastWriteTime | ForEach-Object { Write-Host "  $($_.Name)  $($_.Length) bytes  $($_.LastWriteTime)" }
} else {
  Write-Err "  Folder not found: $nodeFolder"
}

Write-Note "\n-- Which executables exist (where.exe) --"
try {
  where.exe node 2>&1 | ForEach-Object { Write-Host "  $_" }
} catch { Write-Warn "  where.exe node did not find anything" }
try {
  where.exe npm 2>&1 | ForEach-Object { Write-Host "  $_" }
} catch { Write-Warn "  where.exe npm did not find anything" }
try {
  where.exe pnpm 2>&1 | ForEach-Object { Write-Host "  $_" }
} catch { Write-Warn "  where.exe pnpm did not find anything" }

Write-Note "\n-- Try invoking node/npm/pnpm by full path (quick test) --"
$nodePath = Join-Path $nodeFolder 'node.exe'
$npmCmd = Join-Path $nodeFolder 'npm.cmd'
$pnpmCmd = Join-Path $env:APPDATA 'npm\pnpm.cmd'

if (Test-Path $nodePath) {
  try { Write-Host "  node.exe ->"; & $nodePath -v } catch { $err = $_; Write-Err ("  Failed to run {0}: {1}" -f $nodePath, $err) }
} else { Write-Warn "  node.exe not found at $nodePath" }

if (Test-Path $npmCmd) {
  try { Write-Host "  npm.cmd ->"; & $npmCmd -v } catch { $err = $_; Write-Err ("  Failed to run {0}: {1}" -f $npmCmd, $err) }
} else { Write-Warn "  npm.cmd not found at $npmCmd" }

if (Test-Path $pnpmCmd) {
  try { Write-Host "  pnpm.cmd ->"; & $pnpmCmd -v } catch { $err = $_; Write-Err ("  Failed to run {0}: {1}" -f $pnpmCmd, $err) }
} else { Write-Warn "  pnpm.cmd not found at $pnpmCmd (may be installed elsewhere)" }

# Show current PowerShell command resolution for node/npm
Write-Note "\n-- PowerShell command resolution --"
try { Get-Command node -All | ForEach-Object { Write-Host "  node -> $($_.Source)" } } catch { Write-Warn "  node command not resolved" }
try { Get-Command npm -All | ForEach-Object { Write-Host "  npm -> $($_.Source)" } } catch { Write-Warn "  npm command not resolved" }
try { Get-Command pnpm -All | ForEach-Object { Write-Host "  pnpm -> $($_.Source)" } } catch { Write-Warn "  pnpm command not resolved" }

if ($Fix) {
  Write-Note "\n-- Fix mode: adding $nodeFolder to User PATH if missing --"
  $userPath = [Environment]::GetEnvironmentVariable('Path','User')
  if (-not $userPath) { $userPath = '' }
  if ($userPath -notlike "*$nodeFolder*") {
    if ($userPath) { $new = $userPath + ';' + $nodeFolder } else { $new = $nodeFolder }
    [Environment]::SetEnvironmentVariable('Path', $new, 'User')
    Write-Host "  Added $nodeFolder to User PATH."
    Write-Note "  Please close all PowerShell/Terminal windows and re-open a new session to pick up the change."
  } else {
    Write-Note "  $nodeFolder already in User PATH. No change made."
  }
}

Write-Note "\n=== Diagnostic complete ==="
Write-Note "If node/npm still not found after ensuring node.exe exists and PATH contains C:\\Program Files\\nodejs, try logging out or restarting your machine."