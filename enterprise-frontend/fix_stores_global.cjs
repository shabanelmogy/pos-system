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
            
            // replace any relative/absolute imports for stores
            const map = {
                'usePOSStore': 'features/pos/terminal/store/usePOSStore',
                'useUserStore': 'features/system/auth/store/useUserStore',
                'useCustomerStore': 'features/crm/customer/store/useCustomerStore',
                'useCartStore': 'features/pos/terminal/store/useCartStore',
                'useKdsStore': 'features/pos/kds/store/useKdsStore',
                'useAuth': 'features/system/auth/hooks/useAuth',
                'useSettingsSync': 'features/pos/terminal/hooks/useSettingsSync',
                'useAddTable': 'features/reporting/dashboard/hooks/useAddTable',
                'Invoice': 'features/pos/order/components/invoice/Invoice'
            };

            for (const [name, dest] of Object.entries(map)) {
                const regex = new RegExp('from\\\\s+["\'].*?/' + name + '["\']', 'g');
                content = content.replace(regex, (match) => {
                    if (match.includes('@/' + dest)) return match;
                    updated = true;
                    return 'from "@/' + dest + '"';
                });
            }

            if (updated) {
                fs.writeFileSync(fullPath, content);
                console.log('Fixed any store/hook import in ' + fullPath);
            }
        }
    }
}

processDir(path.join(__dirname, 'src'));
