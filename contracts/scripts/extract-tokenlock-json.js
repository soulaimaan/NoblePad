
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const buildInfoDir = path.join(__dirname, '../artifacts/build-info');

const files = fs.readdirSync(buildInfoDir);

for (const file of files) {
    if (!file.endsWith('.json')) continue;
    const filePath = path.join(buildInfoDir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    if (content.includes('contracts/TokenLock.sol')) {
        console.log(`Found TokenLock in: ${file}`);
        const data = JSON.parse(content);
        const outputPath = path.join(__dirname, '../tokenlock-standard-input.json');
        fs.writeFileSync(outputPath, JSON.stringify(data.input, null, 2));
        console.log(`✅ Saved to ${outputPath}`);
    }
}
