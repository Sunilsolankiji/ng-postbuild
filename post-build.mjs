#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

console.log('Script started');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectRoot = process.cwd();
const angularJsonPath = path.join(projectRoot, 'angular.json');

console.log('Project root:', projectRoot);
console.log('angular.json path:', angularJsonPath);

if (!fs.existsSync(angularJsonPath)) {
  console.error('❌ angular.json not found in current directory.');
  process.exit(1);
}

console.log('angular.json found, reading it...');

let angularConfig;
try {
  angularConfig = JSON.parse(fs.readFileSync(angularJsonPath, 'utf-8'));
  console.log('angular.json parsed successfully');
} catch (err) {
  console.error('❌ Failed to parse angular.json:', err.message);
  process.exit(1);
}

const defaultProject = angularConfig.defaultProject || Object.keys(angularConfig.projects)[0];
console.log('Default project:', defaultProject);

const outputPath = angularConfig.projects?.[defaultProject]?.architect?.build?.options?.outputPath;
console.log('Output path:', outputPath);

if (!outputPath) {
  console.error('❌ Could not determine outputPath from angular.json.');
  process.exit(1);
}

const distRoot = path.join(projectRoot, outputPath);
const browserPath = path.join(distRoot, 'browser');

console.log('Dist root:', distRoot);
console.log('Browser folder:', browserPath);

if (!fs.existsSync(browserPath)) {
  console.error(`❌ Browser folder not found: ${browserPath}`);
  process.exit(1);
}

fs.readdirSync(browserPath).forEach((file) => {
  const src = path.join(browserPath, file);
  const destFileName = file === 'index.csr.html' ? 'index.html' : file;
  const dest = path.join(distRoot, destFileName);

  try {
    fs.renameSync(src, dest);
    console.log(`Moved ${file} to ${destFileName}`);
  } catch (err) {
    console.error(`❌ Failed to move file "${file}":`, err.message);
  }
});

try {
  fs.rmSync(browserPath, { recursive: true, force: true });
  console.log(`✅ Browser folder removed`);
} catch (err) {
  console.error(`❌ Failed to remove browser folder:`, err.message);
}

console.log('✅ Post-build script finished');
