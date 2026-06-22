/**
 * @file postinstall.js
 * @description Cross-platform postinstall fixes for packages that expect optional source-map aliases.
 * @author OpenCode
 * @date 2026-06-22
 * @last-modified-by OpenCode
 * @last-modified-date 2026-06-22
 */

const fs = require('fs');
const path = require('path');

const visionDir = path.join(__dirname, '..', 'node_modules', '@mediapipe', 'tasks-vision');
const sourceMap = path.join(visionDir, 'vision_bundle.mjs.map');
const aliasMap = path.join(visionDir, 'vision_bundle_mjs.js.map');

try {
  if (fs.existsSync(sourceMap) && !fs.existsSync(aliasMap)) {
    fs.copyFileSync(sourceMap, aliasMap);
  }
} catch (error) {
  console.warn(`Optional MediaPipe postinstall step skipped: ${error.message}`);
}
