import { rmSync, mkdirSync, existsSync } from 'fs';
import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

// Resolve __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Target .cert directory at the project root
const certDir = path.resolve(__dirname, '../.cert');

console.log('Cleaning up existing .cert directory...');
try {
  if (existsSync(certDir)) {
    rmSync(certDir, { recursive: true, force: true });
    console.log('Successfully deleted old .cert directory.');
  }
} catch (error) {
  console.warn('Warning: Could not remove old .cert directory (it may be locked or already deleted):', error.message);
}

console.log('Creating new .cert directory...');
try {
  mkdirSync(certDir, { recursive: true });
} catch (error) {
  console.error('Error creating .cert directory:', error.message);
  process.exit(1);
}

console.log('Generating certificates with mkcert...');
try {
  // Execute mkcert command in the project root
  execSync(
    'mkcert --key-file .cert/key.pem --cert-file .cert/cert.pem localhost 127.0.0.1 ::1',
    {
      stdio: 'inherit',
      cwd: path.resolve(__dirname, '..'),
    }
  );
  console.log('\n✅ Certificates successfully recreated in .cert/ folder!');
} catch (error) {
  console.error('\n❌ Failed to generate certificates with mkcert.');
  console.error('Make sure "mkcert" is installed and available in your PATH.');
  console.error('To install mkcert on Windows, run: choco install mkcert   or   scoop install mkcert');
  process.exit(1);
}
