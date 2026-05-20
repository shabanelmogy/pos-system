import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT_DIR = path.resolve(__dirname, "..");
const MODULES_DIR = path.join(ROOT_DIR, "src", "modules");
const SCRIPTS_DIR = path.join(ROOT_DIR, "scripts");

const MODULE_DOMAINS: Record<string, string> = {
  user: "system",
  branch: "system",
  upload: "system",
  notification: "system",
  order: "pos",
  shift: "pos",
  table: "pos",
  kitchenStation: "pos",
  posPoint: "pos",
  posSettings: "pos",
  payment: "pos",
  bill: "pos",
  item: "catalog",
  category: "catalog",
  coupon: "catalog",
  customer: "crm"
};

function walkDir(dir: string, callback: (filePath: string) => void) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      walkDir(filePath, callback);
    } else if (stat.isFile() && (filePath.endsWith(".ts") || filePath.endsWith(".js"))) {
      callback(filePath);
    }
  }
}

console.log("Running comprehensive import repairs...");

// 1. Repair deep files in src/modules
walkDir(MODULES_DIR, (filePath) => {
  let content = fs.readFileSync(filePath, "utf-8");
  let modified = false;

  // Detect depth of the file relative to src/modules
  const relPath = path.relative(MODULES_DIR, filePath);
  const segments = relPath.split(path.sep);

  if (segments.length >= 4) {
    // This is a deeply nested file inside services (e.g. pos/order/services/order-base.service.ts)
    // Relative depth has increased by 1 layer.
    const nestedReplacements = [
      { from: "../../../utils/pricingService.js", to: "../../../../utils/pricingService.js" },
      { from: "../../item/item.repository.js", to: "../../../catalog/item/item.repository.js" },
      { from: "../../coupon/coupon.repository.js", to: "../../../catalog/coupon/coupon.repository.js" },
      { from: "../../branch/branch.schema.js", to: "../../../system/branch/branch.schema.js" },
      { from: "../../item/item.schema.js", to: "../../../catalog/item/item.schema.js" },
      { from: "../../customer/customer.service.js", to: "../../../crm/customer/customer.service.js" }
    ];

    for (const rep of nestedReplacements) {
      if (content.includes(rep.from)) {
        content = content.replaceAll(rep.from, rep.to);
        modified = true;
      }
    }
  }

  // General cross-module import adjustments
  const relativeImportRegex = /(from\s+["'])(\.\.\/)([a-zA-Z0-9_-]+)(\/[^"']+["'])/g;
  content = content.replace(relativeImportRegex, (match, prefix, dots, moduleName, suffix) => {
    const domain = MODULE_DOMAINS[moduleName];
    if (domain) {
      modified = true;
      return `${prefix}../../${domain}/${moduleName}${suffix}`;
    }
    return match;
  });

  if (modified) {
    fs.writeFileSync(filePath, content, "utf-8");
    console.log(`✅ Repaired deep imports in ${path.relative(ROOT_DIR, filePath)}`);
  }
});

// 2. Repair files inside scripts/
walkDir(SCRIPTS_DIR, (filePath) => {
  let content = fs.readFileSync(filePath, "utf-8");
  let modified = false;

  // Replace old flat paths like '../src/modules/user/...' with '../src/modules/system/user/...'
  const scriptRegex = /(from\s+["']\.\.\/src\/modules\/)([a-zA-Z0-9_-]+)(\/[^"']+["'])/g;
  content = content.replace(scriptRegex, (match, prefix, moduleName, suffix) => {
    const domain = MODULE_DOMAINS[moduleName];
    if (domain) {
      modified = true;
      return `${prefix}${domain}/${moduleName}${suffix}`;
    }
    return match;
  });

  if (modified) {
    fs.writeFileSync(filePath, content, "utf-8");
    console.log(`✅ Repaired script imports in ${path.relative(ROOT_DIR, filePath)}`);
  }
});

console.log("Comprehensive repair completed!");
