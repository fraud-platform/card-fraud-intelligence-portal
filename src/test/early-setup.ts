// Early setup: runs before other setup files to suppress noisy React DOM warnings
// Keep this file minimal to ensure it executes as early as possible.

const originalConsoleError = console.error.bind(console);
console.error = (...args: any[]) => {
  const msg = args.map((a) => (typeof a === "string" ? a : JSON.stringify(a))).join(" ");
  if (msg.includes("Received `false` for a non-boolean attribute `replace`")) {
    return;
  }
  return originalConsoleError(...args);
};

const originalConsoleWarn = console.warn.bind(console);
console.warn = (...args: any[]) => {
  const msg = args.map((a) => (typeof a === "string" ? a : JSON.stringify(a))).join(" ");
  if (msg.includes("Received `false` for a non-boolean attribute `replace`")) {
    return;
  }
  return originalConsoleWarn(...args);
};
