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
            
            // replace useUserStore
            const userStoreRegex = /from\s+["'].*?useUserStore["']/g;
            if (userStoreRegex.test(content)) {
                content = content.replace(userStoreRegex, 'from "@/features/system/auth/store/useUserStore"');
                updated = true;
            }
            
            // replace useCustomerStore
            const customerStoreRegex = /from\s+["'].*?useCustomerStore["']/g;
            if (customerStoreRegex.test(content)) {
                content = content.replace(customerStoreRegex, 'from "@/features/crm/customer/store/useCustomerStore"');
                updated = true;
            }
            
            // replace useKdsStore
            const kdsStoreRegex = /from\s+["'].*?useKdsStore["']/g;
            if (kdsStoreRegex.test(content)) {
                content = content.replace(kdsStoreRegex, 'from "@/features/pos/kds/store/useKdsStore"');
                updated = true;
            }
            
            // replace usePOSStore
            const posStoreRegex = /from\s+["'].*?usePOSStore["']/g;
            if (posStoreRegex.test(content)) {
                content = content.replace(posStoreRegex, 'from "@/features/pos/terminal/store/usePOSStore"');
                updated = true;
            }

            if (updated) {
                fs.writeFileSync(fullPath, content);
                console.log('Fixed store import in ' + fullPath);
            }
        }
    }
}

processDir(path.join(__dirname, 'src'));
