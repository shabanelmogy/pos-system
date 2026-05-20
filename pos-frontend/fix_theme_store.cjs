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
            
            // replace useThemeStore import
            const themeStoreRegex = /from\s+["'].*?useThemeStore["']/g;
            if (themeStoreRegex.test(content)) {
                content = content.replace(themeStoreRegex, 'from "@/features/system/settings/store/useThemeStore"');
                updated = true;
            }
            
            if (updated) {
                fs.writeFileSync(fullPath, content);
                console.log('Fixed useThemeStore import in ' + fullPath);
            }
        }
    }
}

processDir(path.join(__dirname, 'src'));
