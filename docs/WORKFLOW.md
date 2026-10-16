# Project workflow

Established: 6 October 2026. Scope: this independent game project only.

## Three separate records

| Record | Meaning | What moves it forward |
|---|---|---|
| IDEAS | Possibilities or questions; not requirements | An explicit Founder decision |
| APPROVED | A specific scope or constraint the Founder accepted | Authorised implementation and recorded evidence |
| IMPLEMENTED | Something that actually exists | Verification, then separate Founder acceptance where needed |

An approved idea may remain unimplemented. An implementation may be partial,
unverified or awaiting Founder acceptance. Record those distinctions plainly.
Rejecting or superseding a proposal does not erase its history.

## Recording changes

1. Capture proposals in `ideas/BACKLOG.md` with an `IDEA-NNN` identifier,
   purpose, open questions and status. Supporting research can be added later;
   include sources, access dates and originality concerns.
2. Record explicit approval in `approved/DECISIONS.md` as `DEC-NNN`, with the
   date, Founder instruction, exact scope, exclusions and related idea IDs.
   Allocate the next unused number; do not record anticipated approval.
3. Before building, define the approved scope and a proportionate verification
   plan. A discussion of architecture alone does not authorise a prototype.
4. Update `implemented/STATUS.md` with changed files, decision references,
   checks actually run, results, limitations and delivery/acceptance status.
5. Report what changed and what still needs a decision. If scope materially
   changes, return to the Founder rather than silently expanding it.

For now these are small Markdown records, not a new administration system.
Do not introduce a separate ticket platform, automations or governance register
without a real need and the Founder's direction.

## Reference transcript intake

Read each supplied transcript fully and record useful lessons in
`ideas/IKARIAM_RESEARCH.md`, with a source link and any supplied video details.
Keep narrator claims separate from verified reference behaviour, inferred
design lessons and proposed AZMARA rules. Consolidate repeated lessons and flag
conflicts with the current concept rather than replacing agreed decisions.
Reference advice is not a Founder approval or permission to implement narrated
actions. Discuss selected proposals before changing the game.

## Documentation hygiene

- The README is the entry point, not a duplicate specification.
- Each subject has one canonical live document. Revise it in place and keep
  history in version control; record decision supersession explicitly.
- Link to authoritative decisions instead of repeating slightly different
  versions of a rule throughout the project.
- Mark hypothetical numbers, features and designs as exploratory.
- Keep verification evidence separate from approval and acceptance.
- Never put secrets, real player data or another project's credentials here.

## Development boundaries

No production stack, hosting, database, engine, business model or release
pipeline is selected. `DEC-029` approves only the owner-private browser
prototype's ChatGPT Site delivery and dedicated source repository.
`DEC-039` additionally authorises an independent bundled Flutter iPhone prototype,
development signing and paired-device installation, not store distribution.
`DEC-041` permits the purchased `azmara.app` custom domain on that same private
web prototype, with scoped AZMARA DNS routing/validation; it does not widen
the audience, authorise mail setup or select production-game hosting.
`DEC-043` prioritises the reference-style desktop web view while pausing native
changes. Use original art/code and keep actual gameplay, save identities and
private access unchanged. Desktop HUD is a scoped exception to the earlier
two-control-only presentation, not an authorisation to rebuild the whole game.
Future client and backend environments must be project-specific;
production operations and irreversible changes require their own approval.
Ignore files help prevent accidental tracking but do not replace secret review.

Local Git setup is housekeeping, not an app implementation. No commit,
publication, remote or automatic publishing was part of the foundation task.
The later private Site exception does not authorise publishing the full project.

## Later stages — tentative sequence only

Concept → game systems → design/specification → technical architecture →
prototype → core gameplay loop → MVP → testing → expansion.

This is the Founder's proposed direction, not approval to start those stages.
Begin small and prove the loop before adding large multiplayer/economic systems.
