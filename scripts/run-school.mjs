import fs from "fs";
import path from "path";
import { spawnSync } from "child_process";

function fail(message) {
  console.error(message);
  process.exit(1);
}

function getBin(name) {
  return process.platform === "win32" ? `${name}.cmd` : name;
}

const mode = process.argv[2];
const schoolKey = process.argv[3];

if (!mode || !schoolKey) {
  fail(
    "Usage:\n" +
      "  node scripts/run-school.mjs <dev|build|android|sync> <school-config-key>\n\n" +
      "Examples:\n" +
      "  node scripts/run-school.mjs dev spm-school\n" +
      "  node scripts/run-school.mjs android spm-school\n"
  );
}

const projectRoot = path.resolve(process.cwd());
const configPath = path.join(projectRoot, "configs", `${schoolKey}.json`);

if (!fs.existsSync(configPath)) {
  fail(`Config not found: ${configPath}`);
}

let cfg;
try {
  cfg = JSON.parse(fs.readFileSync(configPath, "utf8"));
} catch (e) {
  fail(`Invalid JSON in ${configPath}`);
}

for (const k of ["appName", "packageName", "themeColor", "logo", "features"]) {
  if (cfg?.[k] == null) fail(`Missing required key '${k}' in ${schoolKey}.json`);
}

const env = {
  ...process.env,
  SCHOOL_CONFIG: schoolKey,
  NEXT_PUBLIC_SCHOOL_CONFIG: schoolKey,
  NEXT_PUBLIC_APP_CONFIG: JSON.stringify(cfg),
};

function run(command, args) {
  console.log(`Running: ${command} ${args.join(" ")}`);
  const result = spawnSync(command, args, {
    stdio: "inherit",
    cwd: projectRoot,
    env,
    shell: true,
  });
  console.log(`Command completed with exit code: ${result.status}`);
  if (result.status !== 0) {
    console.error(`Command failed with exit code: ${result.status}`);
    process.exit(result.status ?? 1);
  }
}

if (mode === "dev") {
  run(getBin("npx"), ["next", "dev"]);
} else if (mode === "build") {
  run(getBin("npx"), ["next", "build"]);
} else if (mode === "sync") {
  run(getBin("npx"), ["next", "build"]);
  run(getBin("npx"), ["cap", "sync"]);
} else if (mode === "android") {
  run(getBin("npx"), ["next", "build"]);
  run(getBin("npx"), ["cap", "sync"]);
  run(getBin("npx"), ["cap", "run", "android"]);
} else {
  fail(`Unknown mode: ${mode}`);
}
