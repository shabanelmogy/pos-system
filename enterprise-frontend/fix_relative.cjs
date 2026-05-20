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
            
            // Replace relative shared imports with @/shared
            const sharedRegex = /from\s+["'](\.\.\/)+shared\/(.*?)["']/g;
            if (sharedRegex.test(content)) {
                content = content.replace(sharedRegex, 'from "@/shared/"');
                updated = true;
            }
            
            // Replace relative features imports with @/features
            const featuresRegex = /from\s+["'](\.\.\/)+features\/(.*?)["']/g;
            if (featuresRegex.test(content)) {
                content = content.replace(featuresRegex, 'from "@/features/"');
                updated = true;
            }
            
            // Replace relative app imports with @/app
            const appRegex = /from\s+["'](\.\.\/)+app\/(.*?)["']/g;
            if (appRegex.test(content)) {
                content = content.replace(appRegex, 'from "@/app/"');
                updated = true;
            }

            if (updated) {
                fs.writeFileSync(fullPath, content);
                console.log('Fixed relative imports in ' + fullPath);
            }
        }
    }
}

processDir(path.join(__dirname, 'src'));
