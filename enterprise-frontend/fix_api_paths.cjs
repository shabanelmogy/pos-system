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
            
            // replace any relative import of *Api to point to shared
            const apiRegex = /from\s+["'].*?([a-zA-Z]+Api)["']/g;
            content = content.replace(apiRegex, (match, apiFile) => {
                if (match.includes('@/shared/api/services')) return match;
                updated = true;
                return 'from "@/shared/api/services/' + apiFile + '"';
            });
            
            if (updated) {
                fs.writeFileSync(fullPath, content);
                console.log('Fixed API imports in ' + fullPath);
            }
        }
    }
}

processDir(path.join(__dirname, 'src'));
