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
            
            // replace i18n/config import
            const i18nRegex = /from\s+["'].*?i18n\/config["']/g;
            if (i18nRegex.test(content)) {
                content = content.replace(i18nRegex, 'from "@/i18n/config"');
                updated = true;
            }

            if (updated) {
                fs.writeFileSync(fullPath, content);
                console.log('Fixed i18n config import in ' + fullPath);
            }
        }
    }
}

processDir(path.join(__dirname, 'src'));
