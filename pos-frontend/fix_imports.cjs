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
            
            // Regex to match imports of API files
            // from "../../../features/auth/api/authApi" or similar
            const regex = /from\s+["'].*?\/features\/([^/]+)\/api\/([^"']+)["']/g;
            content = content.replace(regex, (match, feature, apiFile) => {
                updated = true;
                return 'from "@/shared/api/services/' + apiFile + '"';
            });
            
            if (updated) {
                fs.writeFileSync(fullPath, content);
                console.log('Updated imports in ' + fullPath);
            }
        }
    }
}

processDir(path.join(__dirname, 'src'));
