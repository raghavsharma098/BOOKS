const fs = require('fs');
let content = fs.readFileSync('app/dashboard/page.tsx', 'utf8');

// ---- Fix 1: 4,113,458 ratings text
// Context: ...zIndex: 60\r\n                }}>\r\n                  4,113,458 ratings...
const ratingsIdx = content.indexOf('4,113,458 ratings');
if (ratingsIdx !== -1) {
  const lineStart = content.lastIndexOf('\n', ratingsIdx) + 1;
  const lineEnd = content.indexOf('\n', ratingsIdx);
  const oldLine = content.substring(lineStart, lineEnd);
  const newLine = '                  {(recommendations[0]?.totalRatings || 0).toLocaleString()} ratings \u2022 {(recommendations[0]?.totalReviews || 0).toLocaleString()} reviews';
  content = content.substring(0, lineStart) + newLine + content.substring(lineEnd);
  console.log('Fix 1 (ratings): DONE');
} else {
  console.log('Fix 1: 4,113,458 not found');
}

// ---- Fix 2: Replace the entire static authors section (both rows of 3)
// Find start marker
const authorsMarkerStart = content.indexOf('{/* author avatars');
if (authorsMarkerStart === -1) {
  console.log('Fix 2: author avatars marker not found');
} else {
  // Find end: after the second row closes, we're back at the containing <div>'s last </div>
  // The parent div is `<div className="hidden lg:block" style={{ ...backgroundColor:"rgba(96,53,27,0.1)" }}>`
  // which closes before `{/* Left floating panel`
  const endMarker = '\r\n          </div>\r\n\r\n          {/* Left floating panel';
  const endIdx = content.indexOf(endMarker, authorsMarkerStart);
  if (endIdx === -1) {
    // try LF only
    const endMarkerLF = '\n          </div>\n\n          {/* Left floating panel';
    const endIdxLF = content.indexOf(endMarkerLF, authorsMarkerStart);
    console.log('Fix 2: endMarker (CRLF) not found, LF idx:', endIdxLF);
  } else {
    const oldSection = content.substring(authorsMarkerStart, endIdx + 2);
    console.log('Fix 2: found section of length', oldSection.length);
    
    const newSection = `{/* author avatars — dynamic */}
            {[0, 1].map((rowIdx) => (
              <div key={rowIdx} style={{
                position: 'absolute',
                top: rowIdx === 0 ? -15 : 155,
                left: 24,
                width: 532,
                height: 365,
                display: 'flex',
                gap: 120,
                justifyContent: 'center',
                alignItems: 'center',
                opacity: 1
              }}>
                {(authors.length > 0 ? authors : Array.from({length: 3}, (_, i) => ({ name: '', totalBooks: 0 }))).slice(rowIdx * 3, rowIdx * 3 + 3).map((author, idx) => (
                  <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 80, height: 80, borderRadius: 100, overflow: 'hidden', border: '1px solid #210C00' }}>
                      {(author as any).profilePhoto ? (
                        <img src={(author as any).profilePhoto} alt={(author as any).name || 'author'} width={80} height={80} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <Image src={user2} alt={(author as any).name || 'author'} width={80} height={80} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      )}
                    </div>
                    <div style={{
                      fontFamily: 'SF Pro, "SF Pro Text", "SF Pro Display", -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, system-ui, sans-serif',
                      fontWeight: 510,
                      fontSize: '15px',
                      lineHeight: '20px',
                      letterSpacing: '-0.24px',
                      textAlign: 'center',
                      color: '#210C00'
                    }}>{(author as any).name || ''}</div>
                    <div style={{
                      fontFamily: 'SF Pro, "SF Pro Text", "SF Pro Display", -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, system-ui, sans-serif',
                      fontWeight: 400,
                      fontSize: '15px',
                      lineHeight: '20px',
                      letterSpacing: '-0.24px',
                      textAlign: 'center',
                      color: 'rgba(33, 12, 0, 0.6)'
                    }}>{(author as any).totalBooks ? \`\${(author as any).totalBooks} books\` : 'Writer'}</div>
                  </div>
                ))}
              </div>
            ))}`;
    
    content = content.substring(0, authorsMarkerStart) + newSection + content.substring(authorsMarkerStart + oldSection.length);
    console.log('Fix 2 (authors grid): DONE');
  }
}

fs.writeFileSync('app/dashboard/page.tsx', content, 'utf8');
console.log('\nDone! Final check:');
const final = fs.readFileSync('app/dashboard/page.tsx', 'utf8');
console.log('4,113,458 remaining:', final.includes('4,113,458'));
console.log('Author name remaining:', final.split('Author name').length - 1, 'times');
console.log('authors.slice present:', (final.match(/authors.*\.slice/g) || []).length > 0);
