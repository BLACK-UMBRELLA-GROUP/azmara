# Exploratory ideas

Status: **IDEAS ONLY**. These possibilities come from the initial Founder brief
and the setting update of 6 October 2026. The primary thematic inspiration is
approved in `DEC-008`; the possibilities below and the
[concept's illustrative systems](../CONCEPT.md) are not approved gameplay
requirements or implementation. No balancing, terminology, feature count or
delivery date is selected.

| ID | Exploration area | Possibilities from the brief | Questions before specification |
|---|---|---|---|
| IDEA-001 | World and settlements | Persistent world, cities, exploration, expansion | Which historical, fictional or alternative-history approach fits the approved inspiration, and what decisions make a settlement interesting? |
| IDEA-002 | Production and progression | Resources, population, buildings, upgrades, construction timers, research | What is the smallest enjoyable loop? What should progress mean when offline? |
| IDEA-003 | Conflict | Units, army management, battles, wars | How much conflict belongs in the initial experience? How do we avoid excessive punishment or constant checking? |
| IDEA-004 | Economy and relationships | Trading, marketplace, alliances, diplomacy | Which interaction creates useful choices without requiring a large player population immediately? |
| IDEA-005 | Long-term play | Rankings, account progression | How could newer and established players both have meaningful opportunities? |
| IDEA-006 | Mobile interactions | Touch navigation, dashboards, maps, resource visibility, queues, communication, notifications | What can a player comfortably understand and do during a short phone session? |

Keep possibilities here until the Founder chooses a direction. `DEC-012` and
`DEC-013` authorise the separate local town-screen design, not implementation
of this feature backlog. `DEC-014` calls for deeper core-loop research.

## Supporting research

[Ikariam Okeanos research](IKARIAM_RESEARCH.md), inspected 6 October 2026,
records a live browser tour and discussion questions across the existing
exploration areas. It does not promote any feature into an approved requirement.
The 7 October follow-up connects that evidence to a proposed town-and-region
design slice under `IDEA-002` and `IDEA-004`; it is not a selected feature list.

## IDEA-007 — Player controlled grain provision

Status: **PROPOSED**, pending the Founder's next decision.

Let the player choose how much grain the town's civic food service consumes,
creating a choice between using stock for satisfaction and conserving supplies.
This follows the approved grain role and satisfaction-growth relationship;
player control itself is not yet approved. The building name, control type,
consumption units and rates, satisfaction effects, limits and shortage handling
remain open. Extra grain must not be assumed to guarantee unlimited growth.

## IDEA-008 — Resident based provision demand

Status: **APPROVED DIRECTION** under `DEC-027`, 8 October 2026; not implemented.

Base civic provision demand on the town's actual residents rather than Town
Hall level alone. More empty housing would not immediately upset existing
citizens; arrivals would increase the demand that provision must support.
This selects the demand basis, not a numerical formula or claim about the
reference game's exact behaviour. Service-level limits, satisfaction
calculations and growth/departure rates still need specification. Do not assume
that any negative satisfaction value automatically triggers departures.

## IDEA-009 — Food service upgrades increase provision capacity

Status: **PROPOSED**, pending the Founder's next decision.

Let upgrades increase the maximum amount of Grain the town's food-service
building can distribute. This would let the player expand provision capacity
as resident demand rises. It does not select automatic consumption, a slider,
capacity values, satisfaction gains, growth rates or a final building name.
Actual provision would still need its own controls and rules.

## IDEA-010 — General and dedicated town plots

Status: **APPROVED WORKING STRUCTURE** under `DEC-031`, 8 October 2026;
full visual layout authorised under `DEC-032` and delivered as private Site
version 3. Building and production gameplay remains unimplemented.

Use 19 general plots plus one wall plot, two harbour plots and one freighter
facility plot. Wall and freighter plots accept only their dedicated building;
each harbour plot accepts Trading Port or Shipyard. The original AZMARA
visual layout is implemented, while building catalogue, unlocks, costs and limits
remain to be designed. Town Hall occupies one general plot at level 1; the
remaining 22 plots begin empty.
The Founder accepted the counts for now, not a permanent ban on improvement.

## IDEA-011 — Outward roads to the player's other towns

Status: **PROPOSED**, 9 October 2026; not implemented.

As a settlement develops, roads might extend into the surrounding forest and
link visually to the player's other towns; selecting one could navigate to
that town. The Founder offered this as a future possibility while requesting
the desktop overview. Unlocks, location, appearance, transport meaning and
navigation remain undecided. No extra town or playable road is added now.

## IDEA-012 — Mountain-ended wall route and depth-separated artwork

Status: **APPROVED FOR BUILD**, 11 October 2026 under DEC-069;
implementation and final visual acceptance remain separate.

The [Step 4 wall proposal](TOWN_WALL_PROPOSAL.md) specifies two registered
world-unit routes, rear rock tie-ins, a foreground gate and six tower anchors,
with back/front PNG layers. It compares modular PNG and SVG alternatives and
records the current phone Fit limitation. DEC-068 approved preparation only;
the later “step 5 continue” approves its route, art, depth and phone-framing
implementation under DEC-069, not final artwork acceptance.

## IDEA-013 — Carry accepted middle-ground scenery across neighbouring24/26

Status: **APPROVED BUT HELD** under DEC-080, 12 October 2026; no runtime changes.

Reuse the accepted local25 ground/shade/fountain family for desktop/Staggered
24 and26 only, preserving every accepted0/1/25/50 mixed/review output.24 Caravan
art20 needs its own source-specific entrance calibration, gated away from the
accepted25 branch; no new art generation is planned. This removes the immediate
24↔25↔26 scenery switch, not all progression discontinuities. Keep other levels,
layouts, compact, saves, queues, fixed roles and wall/native/hosting pauses.
Scope, current-source comparisons, risks, checks and rollback are in the
[neighbouring-level proposal](OASIS_LEVEL_24_26_PROPOSAL.md). Owner has explicitly
held implementation pending sidebar/valley review; recheck new play-area limits.

## IDEA-014 — One valley gate wall instead of side returns around the town

Status: **MOCK-UPS ONLY** under DEC-082, 12 October 2026; no route approval.

Extend the top mountain band down the sides into a valley. Compare a wall across
a narrower pass with a broad valley containing the town and one wall closing
its open front. Use the newly approved sidebar and original Oasis scenery for
desktop/phone start/50 paint-overs; preserve plot identities/anchors and keep
ring-wall art/code for rollback. The composition stays in ideas until Owner
approves a mock-up. No wall runtime or native/hosting change is permitted now.

Next unused idea identifier: `IDEA-015`.
