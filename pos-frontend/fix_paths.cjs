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
            
            // Replace pos/* with pos/terminal/* unless it's pos/terminal, pos/order, etc.
            // Wait, using a simple string replace is safer. 
            // e.g. "features/pos/components" -> "features/pos/terminal/components"
            const replacements = {
                'features/pos/components': 'features/pos/terminal/components',
                'features/pos/pages': 'features/pos/terminal/pages',
                'features/pos/store': 'features/pos/terminal/store',
                'features/pos/hooks': 'features/pos/terminal/hooks',
                'features/pos/i18n': 'features/pos/terminal/i18n',
                
                'features/orders': 'features/pos/order',
                'features/tables': 'features/pos/table',
                'features/kds': 'features/pos/kds',
                'features/customers': 'features/crm/customer',
                'features/dashboard': 'features/reporting/dashboard'
            };

            for (const [oldPath, newPath] of Object.entries(replacements)) {
                if (content.includes(oldPath)) {
                    content = content.split(oldPath).join(newPath);
                    updated = true;
                }
            }
            
            if (updated) {
                fs.writeFileSync(fullPath, content);
                console.log('Fixed imports in ' + fullPath);
            }
        }
    }
}

processDir(path.join(__dirname, 'src'));
