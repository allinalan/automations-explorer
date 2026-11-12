# automations-explorer

A showcase only: one static page, every agent Alan runs, published two ways from `src/`. No agent code, no data feed,
nothing scheduled. README.md has the URLs and the change steps. Made 2026-11-12 on the pattern of the Events Team Agent
Explorer (`../Events Team Autopilot/events-team-explorer`), with Alan's ten defaults.

Where it lives: `~/automations/All in Automations/automations-explorer` (the path has spaces, so quote it), inside the
private All in Automations workspace (allinalan/all-in-automations-hq), whose `.gitignore` leaves this folder out. This
folder is its own PUBLIC repo, github.com/allinalan/automations-explorer: commit and push here. No job reads it, so
editing in place on either Mac is fine.

- **Public repo, public site.** Never add real rep, customer or mentee names, phones, e-mails (only Alan's), money, or
  screenshots with real people. Run `node build.js`, which refuses to write `docs/` unless `check-public.js` passes; never
  hand-edit `docs/index.html`.
- **One card per agent, not per job.** `src/catalog.js` holds the cards; each card's `jobs` lists the launchd labels it
  runs as. The build fails when `~/ai-system/overseer/jobs.json` has a label no card claims, or a card names a label that
  isn't there. So: a new, renamed or retired job on the mini means a change here in the same session, then build, push
  and republish. Personal projects (robinhood-trader, zelda-switch-bot, 45by35-hq, spotter) stay off the page.
- **Events team agents are described once**, in the events explorer's `AGENTS`. Here a card with `events: '<id>'` takes
  its words from `src/events-catalog.json`, which the build refreshes from `../Events Team Autopilot/events-team-explorer/build/catalog.json`
  when that repo sits next door (commit the refreshed copy). The build fails if an events agent has no card here.
- **Two copies.** Public (`docs/index.html`): picks in the visitor's browser, Email my list to Alan / Copy / Pick a time
  (the events discovery Calendly), links to the public events explorer, no job labels. Claude (`build/claude/automations-explorer.html`):
  no picks, How it runs names the jobs, links to the Claude events explorer. Republish it with `files` for every
  `img/*.jpg` from `docs/img/` (the page builds its images with createElement, never a code-built img tag, for claude.ai's share review).
- Registered in `~/ai-system/REGISTRY.yaml` (projects.automations-explorer, deployments, public_repo_audit). Change those
  entries if the URL or the repo's contents change.
