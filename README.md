# All In Automation Explorer

Every agent Alan runs, by business (Cutco sales, the Rising Sun Events Team, Sharp Ninja Academy, and what runs behind
the scenes). Each card opens to What it does, How it runs, What it looks like, and Status. Built from one source in two copies:

| Copy | URL | Who it's for | Extra |
|---|---|---|---|
| GitHub Pages (public, noindex) | https://allinalan.github.io/automations-explorer/ | anyone, no account needed | "I want this" on every card, then Email my list to Alan, Copy my list, Pick a time |
| Claude artifact (private until shared) | https://claude.ai/artifact/{{set after the first publish, see CLAUDE.md}} | Alan | How it runs names the jobs each agent runs as on the Mac mini |

The public copy keeps a visitor's picks in their own browser only. Email my list opens their mail app; nothing is sent until they press Send.

## Changing an agent

1. Edit `src/catalog.js`. An events team agent (a card with `events: '<id>'`) takes its name, status, job, steps and
   result from the Events Team Agent Explorer's catalog, so change those words there, build that repo, then build this one.
2. `node build.js` writes `docs/index.html` (GitHub) and `build/claude/automations-explorer.html` (Claude). It writes nothing to `docs/` when:
   - a scheduled job in `~/ai-system/overseer/jobs.json` has no card, or a card names a job that isn't there (add or rename the label in that card's `jobs`);
   - an events team agent has no card here;
   - the public check fails (below).
3. Commit and push. Pages republishes `docs/` from `main` in a minute or two.
4. Republish the Claude copy with the Artifact tool: `build/claude/automations-explorer.html` to its URL, with
   `files` mapping each `img/<name>.jpg` to `docs/img/<name>.jpg`.

A new scheduled job on the mini fails this build until it has a card. That is on purpose: the page can't quietly fall behind.

## The public check (`check-public.js`)

Stops the build on any of these in the public copy: a phone number, an e-mail other than Alan's, a dollar figure (a bare
"$0" rule is allowed), a claude.ai artifact link, a job label from the mini, an unfilled placeholder, a missing noindex,
or a screenshot not in `docs/img/`.

Every name and number in the mock screens is made up (sample people: Jordan, Casey, Taylor Reese, Sam, Riley, Morgan,
Avery). The screenshots in `docs/img/` are the Events Team Agent Explorer's, already public; the Event Analyzer screen
shows Rising Sun's real team totals and is labeled that way. Keep it that way: no real reps, customers, mentees, phones,
or money in `src/` or `docs/img/`.
