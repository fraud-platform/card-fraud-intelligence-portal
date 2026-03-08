import fs from "node:fs";

const [, , domain, action] = process.argv;
const startedAt = new Date().toISOString();

function emit(status, summary, details = [], error = null) {
  const payload = {
    service: "intelligence-portal",
    domain,
    action,
    target: "service",
    status,
    summary,
    details,
    destructive: false,
    started_at: startedAt,
    completed_at: new Date().toISOString(),
    artifacts: [],
    next_steps: [],
    error,
  };
  process.stdout.write(`${JSON.stringify(payload)}\n`);
}

async function probe(url) {
  try {
    const response = await fetch(url, { method: "GET" });
    return [response.ok, `Health endpoint ${url} returned ${response.status}`];
  } catch (error) {
    return [false, `Health endpoint ${url} unreachable: ${String(error)}`];
  }
}

if (!domain || !action) {
  emit("error", "Missing required arguments: <domain> <action>");
  process.exit(2);
}

if ((domain === "service" && action === "status") || (domain === "service" && action === "health")) {
  const [ok, summary] = await probe("http://localhost:5173/health");
  emit(ok ? "ok" : "error", summary);
  process.exit(ok ? 0 : 1);
}

if (domain === "service" && action === "logs") {
  emit("ok", "Use docker compose logs for intelligence-portal logs", [
    "docker compose -f docker-compose.yml -f docker-compose.apps.yml logs intelligence-portal",
  ]);
  process.exit(0);
}

if (domain === "auth" && action === "verify") {
  const keys = ["VITE_AUTH0_DOMAIN", "VITE_AUTH0_CLIENT_ID", "VITE_AUTH0_AUDIENCE"];
  const missing = keys.filter((key) => !process.env[key]);
  const details = keys.map((key) => `${key}=${process.env[key] ? "set" : "missing"}`);
  if (missing.length > 0) {
    emit("error", "Missing required Auth0 environment keys", [
      ...details,
      `missing_keys=${missing.join(",")}`,
    ]);
    process.exit(1);
  }
  emit("ok", "All required Auth0 environment keys are present", details);
  process.exit(0);
}

if (domain === "verify" && action === "preflight") {
  try {
    const pkg = JSON.parse(fs.readFileSync(new URL("../package.json", import.meta.url), "utf8"));
    const requiredScripts = ["dev", "build", "test:unit:fast", "platform-adapter"];
    const missing = requiredScripts.filter((name) => !pkg.scripts?.[name]);
    if (missing.length > 0) {
      emit("error", "Missing required npm scripts for portal preflight", missing);
      process.exit(1);
    }
    emit("ok", "Portal preflight script checks passed", requiredScripts);
    process.exit(0);
  } catch (error) {
    emit("error", `Failed to validate portal scripts: ${String(error)}`);
    process.exit(1);
  }
}

emit("error", `Unsupported action: ${domain}:${action}`);
process.exit(2);
