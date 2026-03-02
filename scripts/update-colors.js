const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, '..', 'src');

const replacements = [
    // Primary Elements (Buttons, Icons, Borders, Highlights)
    { regex: /#219EBC/gi, replacement: '#FFB703' }, // Teal to Amber Gold
    { regex: /#1a7a94/gi, replacement: '#E5A400' }, // Dark Teal to Dark Amber
    { regex: /#E9C46A/gi, replacement: '#FFB703' }, // Yellow to Amber Gold
    // Secondary/Gradients
    { regex: /#FF6B6B/gi, replacement: '#FFB703' }, // Coral to Amber Gold
    { regex: /#FF8E53/gi, replacement: '#FFB703' }, // Orange to Amber Gold
    // Dark Backgrounds
    { regex: /#1a1a2e/gi, replacement: '#1A2238' }, // Dark Blue to Deep Navy
    { regex: /#0a0e1a/gi, replacement: '#1A2238' }, // Darker Blue to Deep Navy
    { regex: /#1a2332/gi, replacement: '#1A2238' }, // Dark Slate to Deep Navy
    { regex: /#0f1419/gi, replacement: '#141A2B' }, // Secondary Dark Background
    // Misc Blues
    { regex: /#0f2c59/gi, replacement: '#1A2238' }, // Deep Blue to Deep Navy
    { regex: /#1e40af/gi, replacement: '#1A2238' }, // Blue 800 to Deep Navy
    { regex: /#023047/gi, replacement: '#1A2238' }, // Brand Navy to Deep Navy
    { regex: /#4FC3F7/gi, replacement: '#8E9AAF' }, // Bright Teal to Cool Slate
];

function walkDir(dir) {
    fs.readdirSync(dir).forEach(file => {
        let fullPath = path.join(dir, file);
        if (fs.lstatSync(fullPath).isDirectory()) {
            walkDir(fullPath);
        } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx') || fullPath.endsWith('.css')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let originalContent = content;
            for (let rule of replacements) {
                content = content.replace(rule.regex, rule.replacement);
            }
            if (content !== originalContent) {
                fs.writeFileSync(fullPath, content, 'utf8');
                console.log(`Updated: ${fullPath}`);
            }
        }
    });
}

console.log('Starting global color replacement...');
walkDir(directoryPath);
console.log('Done!');
