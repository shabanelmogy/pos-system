import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const certDir: string = path.join(process.cwd(), '.cert');

if (!fs.existsSync(certDir)) {
    fs.mkdirSync(certDir);
}

console.log('Generating self-signed certificates...');

// We try to use openssl if available
try {
    execSync(`openssl req -x509 -newkey rsa:2048 -keyout "${path.join(certDir, 'server.key')}" -out "${path.join(certDir, 'server.crt')}" -days 365 -nodes -subj "/CN=localhost"`, { stdio: 'inherit' });
    console.log('✅ Certificates generated successfully using openssl.');
} catch (e: any) {
    console.error('❌ openssl failed or not found. Please install openssl or generate certificates manually.');
    console.log('Alternative: You can use mkcert for a better developer experience.');
}
