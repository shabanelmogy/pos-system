const fs = require('fs');
const path = require('path');

function processDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processDir(fullPath);
        } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let updated = false;
            
            // Fix auth and settings paths
            // from "../../../features/auth" -> from "../../../features/system/auth"
            // Wait, using a simple string replace is safer for features/auth and features/settings
            if (content.includes('features/auth')) {
                content = content.replace(/features\/auth/g, 'features/system/auth');
                updated = true;
            }
            if (content.includes('features/settings')) {
                content = content.replace(/features\/settings/g, 'features/system/settings');
                updated = true;
            }
            
            if (updated) {
                fs.writeFileSync(fullPath, content);
                console.log('Updated imports in ' + fullPath);
            }
        }
    }
}

processDir(path.join(__dirname, 'src'));
