const fs = require('fs');
const path = 'd:/book/app/dashboard/page.tsx';
const s = fs.readFileSync(path, 'utf8');
const lines = s.split('\n');
let depth = 0;
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const opens = (line.match(/<div\b/g) || []).length;
  const closes = (line.match(/<\/div>/g) || []).length;
  if (opens || closes) console.log(`${i+1}: opens=${opens} closes=${closes} depthBefore=${depth}`);
  depth += opens;
  depth -= closes;
}
console.log('final depth', depth);
console.log('Unclosed opening lines (stack simulation):');
// simple stack to show unclosed opening line numbers
let stack = [];
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const opens = (line.match(/<div\b/g) || []).length;
  const closes = (line.match(/<\/div>/g) || []).length;
  for (let j = 0; j < opens; j++) stack.push(i+1);
  for (let j = 0; j < closes; j++) stack.pop();
}
console.log(stack);
