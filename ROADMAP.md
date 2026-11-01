# AZMARA roadmap

AZMARA is in prototype and product-definition work. Feature development is paused until ZYRA launches. The hosted preview is owner-private. The repository stays private until the Founder explicitly authorises `PUBLISH`. The production engine, backend, accounts and release plan remain open.

This is a proposed sequence of review and specification work drawn from existing project questions and ideas. It is not an approved build queue, a delivery commitment or permission to implement held work. Future building requires the Founder's written freeze lift, the relevant explicit `LOCK` and a recorded build brief.

## Planning estimate

The following work represents **25–38 hours** of review and specification effort. These estimates exclude implementation, new artwork, deployment, account setup and time waiting for decisions. They are planning estimates rather than historical time records.

| Work area | Estimate | Concrete review output | Existing source |
|---|---:|---|---|
| Reconcile the prototype baseline and holds | 3–5 h | A concise inventory of demonstrated behaviour, remaining verification and held visual work. Preserve the existing saves, plot identities and approved artwork. Keep neighbouring-level scenery and alternative wall proposals at their recorded approval states. | [Prototype guide](prototype/README.md), [existing ideas and holds](docs/ideas/BACKLOG.md) |
| Define the smallest strategic loop | 6–8 h | A decision-ready brief for the design lead covering the intended player, typical session, meaningful settlement choices, offline progression and the smallest multiplayer interaction worth proving. Record unanswered choices explicitly. | [Product questions](docs/architecture/OPEN_QUESTIONS.md), [production and progression ideas](docs/ideas/BACKLOG.md) |
| Specify economy and population boundaries | 4–6 h | A design-lead specification checklist for resource production, shared sites, resident-based provision, satisfaction and growth. Identify the missing rates, capacity rules, shortages and timing without inventing balance values or treating demo quantities as rules. | [Current concept](docs/CONCEPT.md), [provision proposals](docs/ideas/BACKLOG.md) |
| Resolve production architecture options | 5–8 h | A comparison for approval covering client/rendering needs, platform order, simulation authority, time reconciliation, persistence, accounts, progress continuity and operational constraints. Keep the browser prototype and Flutter shell distinct from any eventual production choice. | [Technical questions](docs/architecture/OPEN_QUESTIONS.md), [mobile preview guide](mobile/README.md) |
| Prepare a verification and accessibility plan | 4–6 h | Acceptance criteria for phone, tablet and desktop input; readable resources and queues; loading, empty and error states; local/native save preservation; offline behaviour; and accessibility/localisation questions. Separate planned checks from checks actually completed. | [Mobile-interaction ideas](docs/ideas/BACKLOG.md), [technical questions](docs/architecture/OPEN_QUESTIONS.md), [prototype limits](prototype/README.md) |
| Review identity and public-release readiness | 3–5 h | An open-item list for final name and branding, asset rights, audience/age boundaries, privacy/support needs, release pipeline and the distinction between a public repository, private preview and public game. Record owners and required approvals without creating accounts, changing access or publishing. | [Commercial and identity questions](docs/architecture/OPEN_QUESTIONS.md), [standing rules](AGENTS.md) |

The order is intended to reduce uncertainty before choosing a production stack. The design lead owns game-rule, UX, layout, wording and art specifications. Reviews may identify options; only the Founder's recorded decisions select them.

## Gates before implementation

1. Recheck the active freeze and all narrower holds in the canonical documents.
2. Resolve the relevant product and technical questions; keep proposals separate from approved requirements.
3. Have the design lead record the Founder's explicit `LOCK` with complete screens, states, numbers and wording under `docs/approved/`.
4. Add the corresponding brief to [docs/approved/BUILD_QUEUE.md](docs/approved/BUILD_QUEUE.md).
5. Implement only the released scope, verify it proportionately and record what exists, what was checked and what still awaits acceptance.

No dates are assigned to multiplayer, native expansion, store delivery or a public launch. Those depend on the choices above and separate authorisation. See [docs/WORKFLOW.md](docs/WORKFLOW.md), [AGENTS.md](AGENTS.md) and [MAP.md](MAP.md) for the governing process.
