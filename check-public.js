// The guard for the public copy. This repo and its Pages site are public, so a page that carries a phone number, someone
// else's e-mail, a dollar figure (no customer, mentee or rep money on this page, made up or not), a claude.ai link (a
// sign-in wall for anyone without Claude), an unfilled placeholder, a missing noindex or a missing screenshot is stopped
// here. Used by build.js before it writes docs/; run alone (node check-public.js) to check what is in docs/ now.
const fs = require('fs'), path = require('path');

const ALLOWED_EMAILS = new Set(['ahernandez@allinknifeguy.com']);

function checkPublic(pages, docsDir) {
  const problems = [];
  for (const [file, html] of Object.entries(pages)) {
    const text = html.replace(/data:image\/[^"')]+/g, '');   // inline icons are not text
    for (const m of text.matchAll(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g)) {
      if (!ALLOWED_EMAILS.has(m[0].toLowerCase())) problems.push(`${file}: e-mail address ${m[0]} is not on the allowed list`);
    }
    for (const m of text.matchAll(/\(?\b\d{3}\)?[-. ]\d{3}[-. ]\d{4}\b/g)) problems.push(`${file}: looks like a phone number: ${m[0]}`);
    // "$0" alone is a rule ("unreported shifts count as $0"), never an amount anyone earned or paid.
    for (const m of text.matchAll(/\$\s?\d[\d,.]*/g)) if (m[0] !== '$0') problems.push(`${file}: a dollar figure: ${m[0]}`);
    if (/claude\.ai\/artifact/.test(text)) problems.push(`${file}: links to a claude.ai artifact (visitors without Claude hit a sign-in screen)`);
    if (/\{\{[A-Z_]+\}\}/.test(text)) problems.push(`${file}: an unfilled {{PLACEHOLDER}}`);
    if (/\bcom\.(allinalan|rsd|sharpninja)\./.test(text)) problems.push(`${file}: a job label from the mini (those belong in the Claude copy only)`);
    if (!/<meta name="robots" content="noindex, nofollow">/.test(text)) problems.push(`${file}: the noindex tag is missing`);
    for (const m of text.matchAll(/"(img\/[^"]+)"/g)) {
      if (!fs.existsSync(path.join(docsDir, m[1]))) problems.push(`${file}: ${m[1]} is not in docs/`);
    }
  }
  return problems;
}

module.exports = { checkPublic };

if (require.main === module) {
  const docs = path.join(__dirname, 'docs');
  const pages = Object.fromEntries(fs.readdirSync(docs).filter((f) => f.endsWith('.html')).map((f) => [f, fs.readFileSync(path.join(docs, f), 'utf8')]));
  const problems = checkPublic(pages, docs);
  if (problems.length) { console.error('PUBLIC CHECK FAILED\n- ' + problems.join('\n- ')); process.exit(1); }
  console.log('public check passed:', Object.keys(pages).join(', '));
}
