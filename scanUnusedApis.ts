// scan-unused-apis.ts
import fs from "fs";
import path from "path";

const projectRoot: string = process.cwd();
const apiRoot: string = path.join(projectRoot, "app", "api");

const exts: string[] = [".ts", ".tsx", ".js", ".jsx"];
const ignoredDirs: string[] = ["node_modules", ".next", "dist"];

// Recursively find all route.ts files
function findRouteFiles(dir: string): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  let files: string[] = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files = files.concat(findRouteFiles(fullPath));
    } else if (entry.isFile() && entry.name === "route.ts") {
      files.push(fullPath);
    }
  }
  return files;
}

// Build endpoint path from file path
function toEndpoint(filePath: string): string {
  let relative = path.relative(apiRoot, filePath);
  relative = relative.replace(/\\+/g, "/"); // normalize slashes
  relative = relative.replace(/\/route\.ts$/, "");
  return "/api/" + relative;
}

// Search project for usage of endpoint
function isEndpointUsed(endpoint: string): boolean {
  function searchDir(dir: string): boolean {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        if (ignoredDirs.includes(entry.name)) continue;
        if (searchDir(fullPath)) return true;
      } else if (exts.some(ext => entry.name.endsWith(ext))) {
        const content = fs.readFileSync(fullPath, "utf8");
        if (content.includes(endpoint)) return true;
      }
    }

    return false;
  }

  return searchDir(projectRoot);
}

// Run scan
console.log("🔎 Scanning API routes...\n");

const routeFiles: string[] = findRouteFiles(apiRoot);

for (const file of routeFiles) {
  const endpoint: string = toEndpoint(file);
  const used: boolean = isEndpointUsed(endpoint);

  if (used) {
    console.log(`✅ USED:   ${endpoint}`);
  } else {
    console.log(`⚠️ UNUSED: ${endpoint}`);
  }
}
