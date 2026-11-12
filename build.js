// Builds both copies of the All In Automation Explorer from src/:
//   docs/index.html                       the GitHub Pages copy (public, noindex): "I want this" picks, no job labels
//   build/claude/automations-explorer.html the Claude artifact copy (Alan's map): job labels under How it runs, no picks
// Usage: node build.js. It stops, and writes nothing to docs/, when
//   - a scheduled job in ~/ai-system/overseer/jobs.json has no card, or a card names a job that is not there
//     (so a new agent can't be left off the page without anyone noticing), or
//   - the public check (check-public.js) finds a phone number, an e-mail other than Alan's, a dollar figure, a
//     claude.ai link, an unfilled placeholder, a missing noindex or a missing screenshot.
const fs = require('fs'), path = require('path'), os = require('os'), vm = require('vm');
const { checkPublic } = require('./check-public');

const ROOT = __dirname;
const SITE = 'https://allinalan.github.io/automations-explorer/';
const EVENTS_PUBLIC = 'https://allinalan.github.io/events-team-explorer/';
const EVENTS_CLAUDE = 'https://claude.ai/artifact/3UVCingGLjGF3amYnHuso1';
const CALENDLY = 'https://calendly.com/allincutcoalan/events-team-autopilot-discovery-call';
const JOBS = path.join(os.homedir(), 'ai-system/overseer/jobs.json');
const EVENTS_SRC = path.join(ROOT, '../Events Team Autopilot/events-team-explorer/build/catalog.json');
const fail = (msg) => { console.error('NOT BUILT: ' + msg); process.exit(1); };

// 1. The catalog, plus the events team agents' own words from the events explorer's catalog. When that repo sits next
// door its latest build is copied in first, so an events agent is described in one place only.
if (fs.existsSync(EVENTS_SRC)) fs.copyFileSync(EVENTS_SRC, path.join(ROOT, 'src/events-catalog.json'));
else console.warn('note: the events explorer is not next door; using the committed src/events-catalog.json');
const events = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/events-catalog.json'), 'utf8'));
const evById = Object.fromEntries(events.AGENTS.map((a) => [a.id, a]));
const ctx = {}; vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(ROOT, 'src/catalog.js'), 'utf8'), ctx);
const { BIZ, STATUS, STARTS, RULES } = ctx;
const problems = [];
const AGENTS = ctx.AGENTS.map((a) => {
  if (!a.events) return { ...a };
  const e = evById[a.events];
  if (!e) { problems.push(`${a.id}: no events agent called "${a.events}"`); return { ...a }; }
  return { name: e.name, alias: e.alias, status: e.status, job: e.job, steps: e.steps, result: e.result,
    checks: e.needs, makes: e.result, ...a };
});
const ids = new Set(), bizKeys = new Set(BIZ.map((b) => b[0]));
for (const a of AGENTS) {
  if (ids.has(a.id)) problems.push(`${a.id}: two cards share this id`); ids.add(a.id);
  for (const k of ['name', 'job', 'when', 'gate']) if (!a[k]) problems.push(`${a.id}: "${k}" is missing`);
  if (!Array.isArray(a.steps) || !a.steps.length) problems.push(`${a.id}: no steps`);
  if (!Array.isArray(a.checks) || !a.checks.length) problems.push(`${a.id}: "checks" is empty`);
  if (!a.makes) problems.push(`${a.id}: "makes" is missing`);
  if (!bizKeys.has(a.biz)) problems.push(`${a.id}: unknown biz "${a.biz}"`);
  if (!STATUS[a.status]) problems.push(`${a.id}: unknown status "${a.status}"`);
  if (!STARTS[a.starts]) problems.push(`${a.id}: unknown starts "${a.starts}"`);
  if (!Array.isArray(a.jobs)) problems.push(`${a.id}: "jobs" must be a list (empty when it has no scheduled job)`);
}
if (EVENTS_SRC && fs.existsSync(EVENTS_SRC)) {
  const shown = new Set(AGENTS.map((a) => a.events).filter(Boolean));
  for (const e of events.AGENTS) if (!shown.has(e.id)) problems.push(`events agent "${e.id}" (${e.name}) has no card here`);
}

// 2. Every scheduled job on the mini has a card, and every card's jobs are real.
if (!fs.existsSync(JOBS)) fail(`${JOBS} is missing, so the page can't be checked against the jobs on the mini`);
const jobsList = JSON.parse(fs.readFileSync(JOBS, 'utf8'));
const labels = new Set((Array.isArray(jobsList) ? jobsList : jobsList.jobs).map((j) => j.label));
const owner = {};
for (const a of AGENTS) for (const j of a.jobs || []) {
  if (owner[j]) problems.push(`${j} is on two cards: ${owner[j]} and ${a.id}`);
  owner[j] = a.id;
  if (!labels.has(j)) problems.push(`${a.id}: ${j} is not in the Overseer's jobs.json (renamed or retired?)`);
}
for (const l of labels) if (!owner[l]) problems.push(`${l} runs on the mini but has no card (add it to a card's jobs in src/catalog.js)`);
if (problems.length) fail('the catalog has problems:\n- ' + problems.join('\n- '));
for (const a of AGENTS) a.jobCount = a.jobs.length;

// 3. Fill the page for each copy.
const page = fs.readFileSync(path.join(ROOT, 'src/explorer.html'), 'utf8');
const fill = (html, links) => {
  let out = html;
  for (const [k, v] of Object.entries(links)) out = out.split(`{{${k}}}`).join(v);
  const left = out.match(/\{\{[A-Z_]+\}\}/);
  if (left) fail('unfilled placeholder ' + left[0]);
  return out;
};
const json = (o) => JSON.stringify(o).replace(/</g, '\\u003c');
const publicAgents = AGENTS.map(({ jobs, repo, ...a }) => a);   // job labels stay out of the public copy
const claude = fill(page, { CATALOG: json({ BIZ, STATUS, STARTS, RULES, AGENTS }), PICKS: 'false', HOOD: 'true',
  EVENTS_URL: EVENTS_CLAUDE, CALENDLY });
fs.mkdirSync(path.join(ROOT, 'build/claude'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'build/claude/automations-explorer.html'), claude);

const RESET = ':root{color-scheme:light;box-sizing:border-box}body{margin:0;padding:0;font:14px -apple-system,BlinkMacSystemFont,sans-serif;background:#fff;color:#000}img{max-width:100%}[hidden]:not([hidden=until-found i]){display:none!important}';
const ICON = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#16213A"/><path d="M14 44a18 18 0 0 1 36 0z" fill="#DD6B1A"/><rect x="10" y="46" width="44" height="4" rx="2" fill="#EEF1F6"/></svg>');
function pagesDoc(html, description) {
  const start = html.indexOf('<style>');
  const lead = html.slice(0, start).split('\n').filter((l) => l.trim() && !l.includes('name="claude:'));
  const title = (lead.join('\n').match(/<title>([^<]*)<\/title>/) || [])[1];
  if (!title) fail('src/explorer.html has no <title>');
  const head = ['<meta charset="utf-8">', '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">',
    '<meta name="robots" content="noindex, nofollow">', `<meta name="description" content="${description}">`,
    `<meta property="og:title" content="${title}">`, `<meta property="og:description" content="${description}">`,
    `<meta property="og:image" content="${SITE}img/board.jpg">`, `<meta property="og:url" content="${SITE}">`,
    `<link rel="icon" href="${ICON}">`, `<style>${RESET}</style>`, ...lead].join('\n');
  return `<!doctype html>\n<html lang="en">\n<head>\n${head}\n</head>\n<body>\n${html.slice(start)}\n</body>\n</html>\n`;
}
const pages = {
  'index.html': pagesDoc(fill(page, { CATALOG: json({ BIZ, STATUS, STARTS, RULES, AGENTS: publicAgents }), PICKS: 'true', HOOD: 'false',
    EVENTS_URL: EVENTS_PUBLIC, CALENDLY }), 'Every agent Alan Hernandez runs across his Cutco sales, the Rising Sun Events Team and Sharp Ninja Academy: what each does, how it runs and what it looks like.'),
};

// 4. Fail closed: check the GitHub copy before it replaces docs/.
const pub = checkPublic(pages, path.join(ROOT, 'docs'));
if (pub.length) fail('the public check failed. docs/ is unchanged.\n- ' + pub.join('\n- '));
for (const [f, html] of Object.entries(pages)) fs.writeFileSync(path.join(ROOT, 'docs', f), html);
const n = (b) => AGENTS.filter((a) => a.biz === b).length;
console.log(`docs/index.html ${pages['index.html'].length} bytes; build/claude/automations-explorer.html ${claude.length} bytes`);
console.log(`${AGENTS.length} agents (${BIZ.map(([k, name]) => `${name} ${n(k)}`).join(', ')}), ${AGENTS.filter((a) => a.status === 'live').length} live; all ${labels.size} jobs on the mini have a card`);
