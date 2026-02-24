const fs = require('fs');
let content = fs.readFileSync('app/dashboard/page.tsx', 'utf8');

// ---- Fix 1: 4,113,458 ratings (CRLF line)
// Line is: "                  4,113,458 ratings • 99,449 reviews"
// Find and replace the whole line
const marker = '4,113,458 ratings';
const idx = content.indexOf(marker);
if (idx !== -1) {
  const lineStart = content.lastIndexOf('\r\n', idx) + 2;
  const lineEnd = content.indexOf('\r\n', idx);
  const oldLine = content.substring(lineStart, lineEnd);
  console.log('Old ratings line:', JSON.stringify(oldLine));
  const newLine = '                  {(recommendations[0]?.totalRatings || 0).toLocaleString()} ratings \u2022 {(recommendations[0]?.totalReviews || 0).toLocaleString()} reviews';
  content = content.substring(0, lineStart) + newLine + content.substring(lineEnd);
  console.log('Fix 1 (ratings): DONE');
} else {
  console.log('Fix 1: 4,113,458 not found');
}

// ---- Fix 2: "Author name" in Trending cards mobile section
// These are inside trending cards (color: 'rgba(204, 62, 0, 1)' }}>Author name</div>)
// They should show book.author?.name from the trendingBooks data
// The surrounding context is a mobile trending card - let's find them and replace
let count = 0;
while (content.includes(", color: 'rgba(204, 62, 0, 1)' }}>Author name</div>")) {
  content = content.replace(
    ", color: 'rgba(204, 62, 0, 1)' }}>Author name</div>",
    ", color: 'rgba(204, 62, 0, 1)' }}>{book.author?.name || book.author || ''}</div>"
  );
  count++;
}
if (count > 0) {
  console.log('Fix 2 (Author name in trending cards): DONE,', count, 'replacements');
} else {
  console.log('Fix 2: pattern not found, trying broader search');
  const aIdx = content.indexOf('Author name');
  if (aIdx !== -1) console.log('Context:', JSON.stringify(content.substring(aIdx - 60, aIdx + 60)));
}

fs.writeFileSync('app/dashboard/page.tsx', content, 'utf8');
console.log('\nDone!');

// Final verification
const final = fs.readFileSync('app/dashboard/page.tsx', 'utf8');
console.log('4,113,458 remaining:', final.includes('4,113,458'));
console.log('Author name remaining:', final.split('Author name').length - 1);
