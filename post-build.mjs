#!/usr/bin/env node

import fs from "fs";
import path from "path";
import * as tar from "tar";

// CLI args parsing
const args = process.argv.slice(2);

// Show help and exit if --help is passed
if (args.includes("--help")) {
  console.log(`
🛠️ ng-postbuild CLI Help

Usage:
  ng-postbuild [options]

Options:
  --out <filename>         Output tar file name (default: <project>.tar)
  --rename <foldername>    Rename project folder inside the archive
  --no-compress            Skip tar compression
  --help                   Show this help message

Examples:
  ng-postbuild
  ng-postbuild --out build.tar
  ng-postbuild --rename my-app
  ng-postbuild --no-compress
  ng-postbuild --rename my-app --out app
`);
  process.exit(0);
}

const outFlagIndex = args.indexOf("--out");
const renameFlagIndex = args.indexOf("--rename");

const shouldCompress = !args.includes("--no-compress");
const outFileName =
  outFlagIndex !== -1 && args[outFlagIndex + 1] ? args[outFlagIndex + 1] : null;
const renamedFolder =
  renameFlagIndex !== -1 && args[renameFlagIndex + 1]
    ? args[renameFlagIndex + 1]
    : null;

// Log CLI options
console.log("🛠️ CLI Options:");
console.log(
  `   ➤ Compression:       ${
    shouldCompress ? "Enabled" : "Disabled"
  } (--no-compress to disable)`
);
console.log(
  `   ➤ Output Tar Name:   ${
    outFileName || "[default: <project>.tar]"
  } (--out <filename>)`
);
console.log(
  `   ➤ Rename Folder To:  ${
    renamedFolder || "[unchanged]"
  } (--rename <foldername>)`
);
console.log("");

console.log("✅ Post-build script started");

const projectRoot = process.cwd();
const angularJsonPath = path.join(projectRoot, "angular.json");

if (!fs.existsSync(angularJsonPath)) {
  console.error("❌ angular.json not found in current directory.");
  process.exit(1);
}

let angularConfig;
try {
  angularConfig = JSON.parse(fs.readFileSync(angularJsonPath, "utf-8"));
  console.log("angular.json parsed successfully");
} catch (err) {
  console.error("❌ Failed to parse angular.json:", err.message);
  process.exit(1);
}

const defaultProject =
  angularConfig.defaultProject || Object.keys(angularConfig.projects)[0];

const outputPath =
  angularConfig.projects?.[defaultProject]?.architect?.build?.options
    ?.outputPath;

if (!outputPath) {
  console.error("❌ Could not determine outputPath from angular.json.");
  process.exit(1);
}

const distRoot = path.join(projectRoot, outputPath);
const browserPath = path.join(distRoot, "browser");

if (!fs.existsSync(browserPath)) {
  console.error(`❌ Browser folder not found: ${browserPath}`);
  process.exit(1);
}

// Move files from /browser to dist root
fs.readdirSync(browserPath).forEach((file) => {
  const src = path.join(browserPath, file);
  const destFileName = file === "index.csr.html" ? "index.html" : file;
  const dest = path.join(distRoot, destFileName);

  try {
    fs.renameSync(src, dest);
    console.log(`Moved ${file} → ${destFileName}`);
  } catch (err) {
    console.error(`\x1b[31m❌ Failed to move file "${file}":\x1b[0m`, `\x1b[31m${err.message}\x1b[0m`);
    console.error(`\x1b[31m❌ Please check and test your build folder\x1b[0m`);
    process.exit(1); // Exit the process on error
  }
});

// Remove browser folder
try {
  fs.rmSync(browserPath, { recursive: true, force: true });
  console.log(`✅ Removed browser folder`);
} catch (err) {
  console.error(`❌ Failed to remove browser folder:`, err.message);
}

if (shouldCompress) {
  const archiveName = `${outFileName || defaultProject}.tar`;
  const archivePath = path.join(projectRoot, archiveName);
  const distFolderName = path.basename(distRoot);

  console.log(`📦 Creating archive: ${archivePath}`);

  // Temporarily copy to a virtual structure like dist/renamedFolder/
  const sourcePath = path.join("dist", distFolderName); // relative

  tar
    .c(
      {
        gzip: false,
        file: archivePath,
        cwd: projectRoot,
        portable: true,
        noMtime: true,
        // Rename dist/project to dist/renamed if needed
        transform: (entry) => {
          if (renamedFolder) {
            const updatedPath = entry.path.replace(
              new RegExp(`^dist/${distFolderName}`),
              `dist/${renamedFolder}`
            );
            entry.path = updatedPath;
          }
          return entry;
        },
      },
      [sourcePath]
    )
    .then(() => {
      console.log(`✅ Archive created: ${archivePath}`);
    })
    .catch((err) => {
      console.error(`❌ Failed to create archive:`, err.message);
    });
} else {
  console.log("⚠️ Compression skipped (use --no-compress to disable)");
}

console.log("✅ Post-build script finished");
