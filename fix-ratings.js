const fs = require('fs');
let content = fs.readFileSync('app/dashboard/page.tsx', 'utf8');

// The ratings line uses non-breaking spaces (U+00A0, char 160) around the bullet
// "4,113,458\u00A0ratings\u00A0\u2022\u00A099,449\u00A0reviews"
const idx = content.indexOf('4,113');
if (idx !== -1) {
  // Find full line boundaries
  const lineStart = content.lastIndexOf('\n', idx) + 1;
  const lineEnd = content.indexOf('\n', idx);
  const oldLine = content.substring(lineStart, lineEnd);
  console.log('Old line length:', oldLine.length, 'codes:', [...oldLine].map(c => c.charCodeAt(0)));
  
  // New dynamic line
  const newLine = '                  {(recommendations[0]?.totalRatings || 0).toLocaleString()} ratings \u2022 {(recommendations[0]?.totalReviews || 0).toLocaleString()} reviews';
  content = content.substring(0, lineStart) + newLine + content.substring(lineEnd);
  console.log('Ratings fixed!');
} else {
  console.log('4,113 not found at all!');
}

fs.writeFileSync('app/dashboard/page.tsx', content, 'utf8');
console.log('Done!');
console.log('4,113 remaining:', fs.readFileSync('app/dashboard/page.tsx','utf8').includes('4,113'));
