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
            
            // store mapping
            const map = {
                'usePOSStore': 'features/pos/terminal/store/usePOSStore',
                'useUserStore': 'features/system/auth/store/useUserStore',
                'useCustomerStore': 'features/crm/customer/store/useCustomerStore',
                'useCartStore': 'features/pos/terminal/store/useCartStore',
                'useAuth': 'features/system/auth/hooks/useAuth',
                'Invoice': 'features/pos/order/components/invoice/Invoice'
            };

            for (const [name, dest] of Object.entries(map)) {
                const regex = new RegExp('import\\\\s+' + name + '\\\\s+from\\\\s+["\']@/features/["\']', 'g');
                if (regex.test(content)) {
                    content = content.replace(regex, 'import ' + name + ' from "@/' + dest + '"');
                    updated = true;
                }
                const regex2 = new RegExp('import\\\\s+\\\\{\\\\s*' + name + '\\\\s*\\\\}\\\\s+from\\\\s+["\']@/features/["\']', 'g');
                if (regex2.test(content)) {
                    content = content.replace(regex2, 'import { ' + name + ' } from "@/' + dest + '"');
                    updated = true;
                }
                
                // Without curly braces exact string replace
                const plainImport = 'import ' + name + ' from "@/features/"';
                if (content.includes(plainImport)) {
                    content = content.split(plainImport).join('import ' + name + ' from "@/' + dest + '"');
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
