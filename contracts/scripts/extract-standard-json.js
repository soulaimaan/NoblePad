
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const buildInfoDir = path.join(__dirname, '../artifacts/build-info');

const files = fs.readdirSync(buildInfoDir).map(file => {
    const filePath = path.join(buildInfoDir, file);
    return {
        name: file,
        time: fs.statSync(filePath).mtime.getTime()
    };
}).sort((a, b) => b.time - a.time);

if (files.length === 0) {
    console.error("No build info found");
    process.exit(1);
}

const latestFile = files[0].name;
console.log(`Reading latest build info: ${latestFile}`);

const content = JSON.parse(fs.readFileSync(path.join(buildInfoDir, latestFile), 'utf8'));

// The Standard JSON Input is under the 'input' key
if (!content.input) {
    console.error("No input field in build info");
    process.exit(1);
}

const outputPath = path.join(__dirname, '../standard-input.json');
fs.writeFileSync(outputPath, JSON.stringify(content.input, null, 2));

console.log(`✅ Standard JSON Input saved to: ${outputPath}`);
