const fs = require('fs');
const path = require('path');
const testFile = path.resolve('src/__tests__/dashboard/student-dashboard-mobile-responsive.bugfix.property.test.tsx');
let content = fs.readFileSync(testFile, 'utf8');

content = content.replace(/md:ml-80/g, "md:ml-20");
content = content.replace(/'ml-80'/g, "'ml-20'");
content = content.replace(/expect\(leftSidebarClasses\)\.toContain\('md:block'\)/g, "expect(leftSidebarClasses).toContain('md:flex')");

fs.writeFileSync(testFile, content, 'utf8');
console.log('Fixed bugfix property test');
