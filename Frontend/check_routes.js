const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

function scanFileForImports(filePath) {
    if (!fs.existsSync(filePath)) return [];
    const content = fs.readFileSync(filePath, 'utf8');
    const regex = /import\s+(?:.*?\s+from\s+)?['"](.*?)['"]|import\(['"](.*?)['"]\)/g;
    let match;
    const imports = [];
    while ((match = regex.exec(content)) !== null) {
        const importPath = match[1] || match[2];
        if (importPath && importPath.startsWith('.')) {
            imports.push({
                sourceFile: filePath,
                importPath: importPath
            });
        }
    }
    return imports;
}

function resolvePath(basePath, relativePath) {
    let resolved = path.resolve(path.dirname(basePath), relativePath);
    if (fs.existsSync(resolved)) {
        if (fs.statSync(resolved).isDirectory()) {
            // Check for index.js, index.jsx, etc.
            if (fs.existsSync(path.join(resolved, 'index.js'))) return true;
            if (fs.existsSync(path.join(resolved, 'index.jsx'))) return true;
            return false;
        }
        return true;
    }
    // Check with extensions
    if (fs.existsSync(resolved + '.js')) return true;
    if (fs.existsSync(resolved + '.jsx')) return true;
    if (fs.existsSync(resolved + '.ts')) return true;
    if (fs.existsSync(resolved + '.tsx')) return true;
    if (fs.existsSync(resolved + '.css')) return true;
    
    return false;
}

const filesToCheck = [
    path.join(srcDir, 'App.js'),
    path.join(srcDir, 'routes', 'DashboardRoutes.jsx'),
    path.join(srcDir, 'routes', 'JobRoutes.jsx'),
    path.join(srcDir, 'routes', 'GigRoutes.jsx'),
    path.join(srcDir, 'routes', 'AiRoutes.jsx'),
    path.join(srcDir, 'routes', 'CommonRoutes.jsx'),
    path.join(srcDir, 'components', 'common', 'Header.jsx')
];

let missing = 0;

for (const file of filesToCheck) {
    const imports = scanFileForImports(file);
    for (const imp of imports) {
        if (!resolvePath(file, imp.importPath)) {
            console.log(`Missing import: ${imp.importPath} in ${path.relative(__dirname, file)}`);
            missing++;
        }
    }
}

if (missing === 0) {
    console.log("All routes and imports in checked files exist!");
} else {
    console.log(`Total missing: ${missing}`);
}
