const fs = require('fs');
let content = fs.readFileSync('app/dashboard/page.tsx', 'utf8');

// ---- Fix 1: Corrupted JK Rowlings expression on line ~1126
// The script produced: `}}>{recommendations[0]?.author?.name ? ~ \ : ''}</span>`
// We need:            `}}>~ {recommendations[0]?.author?.name || ''}</span>`
const idx1 = content.indexOf("?.author?.name ? ~ ");
if (idx1 !== -1) {
  // find the full span content block - from '}}>...' to '</span>'
  const spanStart = content.lastIndexOf('}}>', idx1);
  const spanEnd = content.indexOf('</span>', idx1) + 7;
  const oldSpan = content.substring(spanStart, spanEnd);
  const newSpan = '}}>~ {recommendations[0]?.author?.name || \'\'}</span>';
  content = content.substring(0, spanStart) + newSpan + content.substring(spanEnd);
  console.log('Fix 1 (JK Rowlings corrupted): DONE');
  console.log('Old:', JSON.stringify(oldSpan));
} else {
  // Check if it was already fixed or has different form
  const jkIdx = content.indexOf('JK Rowlings');
  if (jkIdx !== -1) {
    console.log('JK Rowlings still present:', JSON.stringify(content.substring(jkIdx - 30, jkIdx + 60)));
  } else {
    console.log('Fix 1: No issue found (already fixed or different form)');
    // Check what line 1126 looks like
    const lines = content.split('\n');
    console.log('Line 1125:', lines[1124]);
    console.log('Line 1126:', lines[1125]);
    console.log('Line 1127:', lines[1126]);
  }
}

// ---- Fix 2: The giveaway cover image ternary is broken
// After the fix-dashboard.js script, we have:
// `} : (\n<Image src={bookBundle1}.../>` followed immediately by a <button>
// But the ternary is never closed with `)}` before the button
// We need to: remove the `}: (` and the bookBundle1 Image and close the ternary properly

// Find the broken ternary pattern
const brokenPattern = content.indexOf(') : (\n                <Image src={bookBundle1}');
const brokenPatternCRLF = content.indexOf(') : (\r\n                <Image src={bookBundle1}');
const idx2 = brokenPattern !== -1 ? brokenPattern : brokenPatternCRLF;

if (idx2 !== -1) {
  // Find the end of the Image tag
  const imgEnd = content.indexOf('/>', idx2 + 10);
  if (imgEnd !== -1) {
    const closingImgEnd = imgEnd + 2;
    const oldBlock = content.substring(idx2, closingImgEnd);
    const newBlock = ')}'; // close the ternary
    content = content.substring(0, idx2) + newBlock + content.substring(closingImgEnd);
    console.log('Fix 2 (Bundle ternary): DONE');
  }
} else {
  // Check for the bookBundle1 Image fallback
  const bbIdx = content.indexOf('<Image src={bookBundle1}');
  if (bbIdx !== -1) {
    console.log('bookBundle1 found at:', bbIdx);
    console.log('Context:', JSON.stringify(content.substring(bbIdx - 120, bbIdx + 200)));
  } else {
    console.log('Fix 2: bookBundle1 not found - may already be fixed');
  }
}

// ---- Fix 3: Also check for bookBundle2 same issue
const idx3 = content.indexOf('<Image src={bookBundle2}');
if (idx3 !== -1) {
  console.log('bookBundle2 found - checking context...');
  // If it's inside a ternary else branch preceded by ) : ( -- fix same way
  const before = content.substring(Math.max(0, idx3 - 150), idx3);
  if (before.includes(') : (')) {
    const ternaryStart = before.lastIndexOf(') : (') + (idx3 - Math.max(0, idx3 - 150));
    const imgEnd2 = content.indexOf('/>', idx3) + 2;
    const oldBlock2 = content.substring(ternaryStart, imgEnd2);
    content = content.substring(0, ternaryStart) + ')}' + content.substring(imgEnd2);
    console.log('Fix 3 (bookBundle2): DONE');
  }
}

fs.writeFileSync('app/dashboard/page.tsx', content, 'utf8');
console.log('\nFile written. Running final check...');

// Verify fixes
const finalContent = fs.readFileSync('app/dashboard/page.tsx', 'utf8');
const stillBroken = finalContent.indexOf('?.author?.name ? ~');
const stillHasBundle1 = finalContent.indexOf('<Image src={bookBundle1}');
const stillHasBundle2 = finalContent.indexOf('<Image src={bookBundle2}');
console.log('author?.name ? ~ remaining:', stillBroken !== -1 ? 'YES - STILL BROKEN' : 'OK');
console.log('bookBundle1 remaining:', stillHasBundle1 !== -1 ? 'YES (check if in ternary)' : 'OK - removed');
console.log('bookBundle2 remaining:', stillHasBundle2 !== -1 ? 'YES (check if in ternary)' : 'OK - removed');
