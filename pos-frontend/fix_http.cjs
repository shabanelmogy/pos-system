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
            
            // replace axiosWrapper with httpClient
            if (content.includes('axiosWrapper')) {
                content = content.replace(/axiosWrapper/g, 'httpClient');
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
