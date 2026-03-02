const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, '..', 'src');

const bgReplacements = [
    // These are the common hardcoded background colors/gradients we mapped.
    // The user asked to make backgrounds "all even with some solid background",
    // which generally means using Tailwind's `bg-background` class instead.
    { regex: /bg-\[#1A2238\]/gi, replacement: 'bg-background' },
    { regex: /bg-gradient-to-b from-background via-\[#1a1a2e\] to-background/gi, replacement: 'bg-background' },
    { regex: /bg-gradient-to-b from-background via-\[#1A2238\] to-background/gi, replacement: 'bg-background' },
    { regex: /bg-\[#023047\]/gi, replacement: 'bg-background' },
    { regex: /bg-\[#0a0e1a\]/gi, replacement: 'bg-background' },
    { regex: /bg-gradient-to-br from-\[#1a2332\] via-\[#0f1419\] to-\[#1a2332\]/gi, replacement: 'bg-background' },
    { regex: /bg-\[#F8FAFC\]/gi, replacement: 'bg-background' },
    { regex: /bg-gradient-to-br from-\[#1A2238\] via-\[#141A2B\] to-\[#1A2238\]/gi, replacement: 'bg-background' },
];

function walkDir(dir) {
    fs.readdirSync(dir).forEach(file => {
        let fullPath = path.join(dir, file);
        if (fs.lstatSync(fullPath).isDirectory()) {
            walkDir(fullPath);
        } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let originalContent = content;
            for (let rule of bgReplacements) {
                content = content.replace(rule.regex, rule.replacement);
            }
            if (content !== originalContent) {
                fs.writeFileSync(fullPath, content, 'utf8');
                console.log(`Updated backgrounds: ${fullPath}`);
            }
        }
    });
}

console.log('Starting global background replacement...');
walkDir(directoryPath);
console.log('Done!');
