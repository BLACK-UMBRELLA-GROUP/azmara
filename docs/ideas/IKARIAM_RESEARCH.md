---
id: DOC-AZM-0032
type: RESEARCH
status: CURRENT
feature: IDEAS AND PROPOSALS
purpose: Ikariam Okeanos research
links: []
owner: AZMARA chat
---

# Ikariam Okeanos research

Initial tour: 6 October 2026. Follow-up help inspection and Founder screenshots:
7 October 2026. Founder-supplied video transcripts begin on 7 October 2026.
Status: research and discussion only, not an approved game specification.
Scope authority: `DEC-006`, with core-reference direction under `DEC-014`.

Ikariam's appeal comes from connected decisions: population supports income,
production and research; buildings create capacity; transport makes resources
useful elsewhere; neighbours influence trade, cooperation and conflict. An
original phone game could explore that depth while making a short visit much
easier to understand. No particular mechanic or screen is selected for our
game by this research.

## Source and scope

Source: the live [Ikariam Okeanos game](https://s72-en.ikariam.gameforge.com/),
opened in the Founder's Chrome session. The header displayed version 17.5.0.
This was a mature account with multiple towns, not a new-player walkthrough.
Only desktop browser views and unsubmitted forms were inspected.

No resource expenditure, construction, upgrade, purchase, recruitment,
movement, experiment, donation, message or treaty action was submitted.
No account settings were changed. The original selected town was restored.
Opening advisor views may affect notification read status; this was not a
test of notification preservation.

These are paraphrased observations. No proprietary assets, copied interface
text, game datasets, balancing tables, player records, account identifiers or
session tokens are retained here. Ikariam remains a reference, not our product
name or an implementation template.

## Systems inspected

| Area | What the visible interface establishes |
|---|---|
| City navigation | A selected town supplies the context for local resources and buildings. Town, island and world views form a navigable hierarchy. Several owned towns can be selected from the header. |
| Population and income | Housing, satisfaction, growth, workers, scientists and income are connected. Allocation controls preview production or income, with separate confirmation. |
| Consumption and satisfaction | Serving a consumable improves satisfaction at an ongoing resource cost. Supporting buildings can reduce consumption. |
| Research | Assigned researchers generate research points. The advisor groups technologies into branches and shows requirements, affordability and accumulation estimates. An estimate for accumulating points is not necessarily a research completion timer. |
| Construction | Building panels expose costs, duration, capacity or effects. The two vacant lots inspected offered specific building types; they were not a complete construction catalogue. |
| Storage | Capacity, protected goods and lootable goods are separate considerations, rather than just one resource total. |
| Market | Other players' offers are organised by goods, quantity, price and distance. The own-offers form shows reserved funds and editable buy or sell quantities. No offer was posted or fulfilled. |
| Transport | Available vessels differ from total vessels owned. A planning form separates cargo capacity, loading, travel and arrival, and exposes repeat-route controls. No route or shipment was created. |
| Expansion | An administration building connects expansion capacity to an empire overview. Government choices display advantages and disadvantages. No settlement or government change was attempted. |
| Shared island production | Worker allocation has an income trade-off. Donations expand shared production infrastructure used by island inhabitants, making cooperation mechanically relevant. |
| Economy summary | A dedicated overview separates town income, research expense, military upkeep and the resulting overall balance. A negative balance is a game state, not proof of a software defect. |
| Military | The advisor exposes movements and combat-report categories. A town inventory separates land and sea capacity and includes allied or occupying forces. Recruitment and combat resolution were not tested. |
| Diplomacy | Message, agreement and alliance areas exist. Cultural agreements connect relationships to town satisfaction. Alliance navigation includes information, members and a forum; no private forum or message content was opened. |
| Event history | A filterable journal records timestamped transport and other outcomes, helping a returning player understand activity that happened between visits. |
| World map | Islands, nearby settlements, common production sites and geographic navigation provide a larger context for individual towns. Travel-time consequences are visible in transport planning. |

## Interaction checks

The visited city, advisor, market, transport, resource, island and world views
loaded and exposed their expected information. Switching owned towns and
returning to the original town worked. Panels sometimes updated after the
first observation because navigation loaded asynchronously; a stale initial
snapshot was not treated as a broken button.

The browser diagnostic log available at the end of the tour contained no
captured warnings or errors. That is a limited observation, not evidence that
all code, requests or gameplay paths are correct. No reproducible failure was
established in the navigation paths visited.

An empty garrison, unavailable transport vessels, missing materials, a neutral
growth state or a count beside an advisor tab should not automatically be
called a bug. Counts need context: for example, an alliance activity count
does not by itself establish whether the player belongs to an alliance.

## Mobile design questions for our game

The following are proposals for discussion within `IDEA-001` through
`IDEA-006`, not approved requirements.

1. **Give a returning player a useful first screen.** Consider a concise
   cross-town view of shortages, income, arrivals and important queues,
   followed by the town or map when needed. What should a player be able to
   decide in a few minutes?
2. **Explain consequences before commitment.** Resource cost alone is not
   enough when a change also consumes population, increases upkeep or ties up
   transport. Which consequences should be visible together, and which need
   a separate confirmation?
3. **Keep strategic depth without desktop density.** The inspected desktop
   view uses small labels, distant controls and multiple information regions.
   Those are risks when translating the experience to a phone, not verified
   defects in Ikariam's native mobile app. Our layout, interactions and visual
   identity must be designed independently.
4. **Make offline progress understandable.** Consider a readable account of
   what completed, what changed and what now needs attention. Decide later
   which events warrant notifications and how to avoid constant checking.
5. **Give cooperation a purpose.** Shared infrastructure is one example of
   neighbours affecting progression. What original cooperative activity would
   make our world worthwhile even before it has a large population?
6. **Choose the conflict experience deliberately.** Travel, capacity, upkeep,
   defense and diplomacy add decisions beyond simply creating an army. How
   much risk should a casual player face while offline, and how can recovery
   remain enjoyable?

## What this does not verify

This is a first-pass functional research tour, not a full debug or security
audit of a third-party game. It does not verify login, signup, onboarding,
construction completion, recruitment, combat calculations, purchases,
notifications, reconnection, concurrent actions, server persistence or load.
There was no real-phone test or responsive breakpoint test. The existing
account and unsubmitted forms cannot establish all early-game rules or
end-to-end outcomes.

The next discussion concerns the Founder's first draft: what to keep at the
level of player experience, what to reject and what original core loop should
distinguish our game. The subsequent setting update is recorded in the
[current concept](../CONCEPT.md): Abbasid-era Baghdad and its golden
age are the primary inspiration. `DEC-011` subsequently selected a fictional
world inspired by that period, not a strict historical recreation.
The reference observations above do not approve importing its setting or
mechanics. No code, screens, stack or copied game content should be produced
from this note without a further instruction.

## Core strategy understanding

The following separates observed reference evidence, interpretation and
AZMARA proposals. The 6 October recorded walkthrough is available through the
`azmara-ikariam-reference` skill. Its sanitized systems reference complements
the live tour; it does not establish submitted outcomes or universal values.

### Observed reference relationships

The live game's Help was inspected on 7 October: Basic Gameplay, Population
and Satisfaction, Gold and Finances, Building Material, Luxury Goods,
Research, Trade, Warfare, and Towns and Alliances. These are rules described
by the game's own help, not end-to-end tests of the corresponding actions.

| Reference evidence | Interpretation and design implication |
|---|---|
| Town-hall capacity limits population; satisfaction affects growth and can lead to departures. | More people require both room and sustained civic support. A larger building alone does not guarantee growth. |
| Citizens earn income, workers produce goods, and researchers consume income while generating knowledge. | Allocating more people to one activity constrains another. Production and research must be financed. |
| Goods belong to towns, while treasury and transport vessels are shared across the empire. | An empire is not one undifferentiated resource balance. A rich town cannot instantly supply another, and a busy fleet constrains other plans. |
| A region's shared production sites limit employment and grow through player contributions; its specialist deposit supplies one luxury resource type. | Geography creates scarcity, neighbours share infrastructure, and trade or expansion can resolve shortages. |
| Knowledge unlocks capabilities; construction requires goods and time. | Buildings and research are investments that should change what the player can do, rather than only increase a level label. |
| Ship availability, cargo capacity, travel and town action points constrain transport. | Goods promised or in transit are not immediately available. Several attractive actions may compete for the same capacity. |
| Military forces require upkeep; pillaging, occupation and harbour blockades depend on forces and geography. | Warfare is connected to the economy and logistics, not an isolated battle button. This does not establish combat formulas. |
| Production continues while the browser is closed, and advisers explain intervening events. | Returning should reveal completed work, changed balances and the next useful decision. |

Population and allocation relationships also appear in the publisher's
[citizen guide](https://gameforge.com/en-GB/games/ikariam-citizen-satisfaction.html).
The publisher's [game overview](https://play.ikariam.gameforge.com/) confirms
the broader build, research, trade, warfare and alliance experience. The
in-game help is accessible from the [Okeanos game](https://s72-en.ikariam.gameforge.com/).
No player identifiers, balances, formulas or asset copies are stored here.

One source inconsistency matters: the research help introduction describes
four branches, while the visible navigation additionally lists Mythology.
Help prose should not be treated as a complete current feature inventory.
AZMARA excludes deity and miracle systems regardless of their reference role.

### Founder clarification on housing and satisfaction

On 7 October 2026, the Founder explained that upgrading the reference Town Hall
provides population space, while satisfaction determines people coming in.
Wine and the Museum were identified as satisfaction sources. This is the
Founder's reference explanation, not a newly tested gameplay outcome.

`DEC-025` approves the capacity and satisfaction-growth relationship for
AZMARA. Grain retains its previously approved civic satisfaction role; wine,
a Museum and cultural-agreement mechanics are not selected for AZMARA.
Growth formulas and other satisfaction sources remain open.

On 8 October, the Founder supplied an explicitly hypothetical example of
small-town provision keeping up, then the same service falling behind a larger
town. Growth slows and sufficiently unhappy residents leave. `DEC-026` adopts
that qualitative relationship for AZMARA, not the example figures or an
independently verified reference formula. The Founder subsequently accepted
actual residents as AZMARA's demand basis under `DEC-027`, rather than Town
Hall level alone. This is an AZMARA decision, not independent verification of
the reference game's formula.

### Inferred player loop

Ikariam's distinctive appeal appears to be managing a town within an
interdependent world. Population allocation funds production and knowledge;
investments expand capacity; scarcity motivates shipments and new settlements;
neighbours create cooperation, commerce and conflict. Those commitments then
create new demands on the same population, money and transport capacity.

This is a design interpretation, not a claim about measured player preferences.
Capturing that appeal requires meaningful competing choices. Making every town
self-sufficient, making upgrades purely cosmetic or instantly sharing
all goods across towns would remove important reference decisions.

### Current prototype gap

The local draft provides town presentation, selectable buildings and a sample
construction interaction. Resources decrease, but no ongoing production
replenishes them. Upgrades change level labels without changing output,
population, storage or income. Workforce allocation, research unlocks,
geographic scarcity, shipments and a return history are not implemented.
Its ten-second queue is a demonstration, not approved game pacing.

### Proposed next design slice

Keep the first town presentation. Work through one town in a small region:

1. A civic panel shows population, employment capacity and income. Preview
   how assigning people to production or scholarship changes those balances.
   If scholarship is included, give accumulated knowledge one useful unlock;
   otherwise defer it rather than adding a counter without a purpose.
2. Give two investments different useful effects, such as increasing
   productive capacity versus storage, so choosing one constrains the other.
3. Introduce one example trading settlement with a complementary supply. A
   limited timed shipment demonstrates scarcity and committed transport;
   this is not a live player or a multiplayer-server commitment.
4. Show what changed during an absence and the next meaningful choice.

Start by specifying the civic panel and production relationship, then extend
the scenario into logistics. Compare two viable choices after the player
returns. Exact resources, rates, building names, storage rules, travel times
and geography are proposals under `IDEA-002` and `IDEA-004`, not approved balance.
The regional setting may use waterways or caravans, but neither is selected.

Outstanding questions are which scarcity makes trade useful, how absence
affects growth and shortages, and what offline conflict risk is acceptable.
Shop, premium items, piracy, daily incentives and religious systems are not
automatically part of AZMARA merely because the reference has them. Do not
replace excluded temples or miracles with sacred reward mechanics drawn from the community's religion.

## Founder screenshots of the three map views

Source: four screenshots supplied in chat on 7 October 2026. They are reference
evidence, not AZMARA assets or a production rules manual.

### Observed in the screenshots

- Separate World, Island and Town controls are visible.
- The town view shows individual buildings within a settlement.
- The island view shows multiple town locations, a forest and a specialist
  crystal mine. Their displayed levels do not establish universal capacities.
- The world view shows many islands with different specialist-resource icons.

### Interpretation

Town buildings, island resource sites and the wider world are different scales.
A town's buildings should not be confused with its island's resource sites.
The screenshots alone do not establish player ownership, access permissions,
worker allocation, pooled stockpiles, site upgrades or settlement limits.

### AZMARA direction and proposal

The Founder clarified island-level resource placement under `DEC-020`. The
working resource model is timber plus one of clay, silver, grain or iron per
island, using the confirmed resource identities from `DEC-019`. Site counts
remain open; the subsequent `DEC-021` confirms shared access with separate town
output and inventories. World → Island → Town is a navigation proposal;
exact screens and map layouts are not approved by the reference images.

The earlier small-region design slice can be discussed as a town-and-island
scenario. Original fictional Golden Age art and `DEC-007` exclusions still
apply. Do not import the reference's miracles, monuments, encounters, displayed
town-slot counts, private player labels, coordinates or graphics.

## Founder screenshots of production and town allocation

Source: three further screenshots supplied on 7 October 2026, showing sawmill
and specialist-mine panels, with the Founder's explanation of two owned towns
on the same island. No production or contribution action was performed here.

### Observed reference controls

The panels show worker assignment controls, output and income previews, a
shared site's level, contributions towards expansion and a table of towns
with individual worker counts. Rows on the specialist panel display different
worker allocations. Premium and advertising-related boosts are also visible.
These are interface observations, not copied balancing values or verification
of completed allocations, upgrades, boosts or donations.

### Founder clarification and AZMARA direction

The Founder confirmed shared island-site access and explained that each town
produces and stores its own resources, with deliberate shipments between owned
towns. `DEC-021` records those concepts. Sharing an island site is not pooling
the output or the owner's stockpiles.

The subsequent Founder clarification under `DEC-022` confirms independent
worker sliders per town, limited by available population and site capacity,
with unassigned citizens generating hourly income. Exact production and income
rates, whether capacity is shared across towns, other population roles,
and detailed contribution handling remain undecided. `DEC-023` subsequently
confirms timber contributions towards shared-site expansion, with higher levels
supporting more workers. Reference paid boosts and ad rewards are not approved
AZMARA features merely because these panels show them.

### Expansion panel close up and Founder clarification

A further close-up supplied on 7 October 2026 shows the sawmill's current
level, a timber requirement for the next level, an available-amount indicator,
an amount input, a maximum control and an expansion contribution button.
A separate premium-currency contribution option is visible. The image does
not establish which inventory the available figure represents or demonstrate
a completed contribution or upgrade. Its displayed values are not AZMARA
balancing data.

The Founder clarified that timber contributions expand the shared production
site and permit more workers, with the same principle for specialist sites.
This direction is recorded under `DEC-023`. The Founder subsequently approved
"Contribute Timber" as the action label under `DEC-024`, replacing "Donate".
Exact costs, accumulation, upgrade timing and capacity formulas remain
undecided, and the premium route is not approved for AZMARA.

## Video transcript 1 Early town development

Source: [Founder-supplied YouTube transcript](<<LOCAL_HOME>/.codex/attachments/e177b0b8-4c84-41d6-a435-473990063453/Pasted text.txt>),
received 7 October 2026. The video title, creator, publication date and game
version are not supplied. Automatic transcription contains unclear names.
The following are narrator claims and advice, not independently verified
gameplay results or a current rules manual.

### Narrator advice

The creator recommends expanding housing, research and transport together,
keeping satisfaction supplies available, and securing construction resources
through additional towns. Storage is important during absences and when
supplying a newly founded town. The creator favours locating an equipment
workshop near its specialist supply and describes a failed siege against a
strong wall. Preferred building choices and resource rankings reflect that
creator's strategy, with score growth a prominent goal.

### Inferred lessons and proposed AZMARA applications

These extend the earlier connected-economy research; they are proposals, not
additional approved mechanics.

| Inferred design lesson | Proposed AZMARA application |
|---|---|
| Housing, satisfaction, labour, research, income and transport affect one another. | Preview the town's competing uses of population together. More housing alone should not be presented as guaranteeing growth or income. |
| Specialist starting locations can leave beginners struggling to obtain essential supplies. | Test a viable opening for each island type, including understandable access to grain and clay. Starter supplies, early trade or introductory objectives are options to discuss, not selected rules. |
| Production, consumption, incoming goods and storage must work during time away. | Show estimated time until storage fills and civic grain coverage, plus a clear return summary. Decide overflow and shortage effects explicitly; do not assume instant population loss. |
| Geography and transport can make town specialisation useful. | Explore distinct town roles while preserving shared island sites, private town output and deliberate shipments under `DEC-021`. Loading, cargo, travel and costs remain open. |
| Limited building space can create competing investments. | Explain storage, scholarship, efficiency and military building trade-offs if a slot system is selected. Do not adopt the creator's preferred exclusions or an exact slot count. |
| A failed attack needs understandable reasons. | When military rules are designed, make reconnaissance, defensive strength, troop suitability and supply limits legible. The described siege is a research example, not an approved combat formula. |

### Exclusions and unresolved rules

Deities, temples, shrines and miracles are excluded by `DEC-007`; they will not
be renamed into sacred bonuses drawn from the community's religion. AZMARA retains timber, clay, silver,
grain and iron under `DEC-019`, rather than importing the reference's resources.

The transcript does not approve expansion penalties, espionage, PvE targets,
rewarded ads, paid boosts, particular units, research prerequisites or a
compulsory build order. Exact levels, percentages, prices, timings and resource
rankings are not balance specifications. Score growth is the narrator's aim,
not an established AZMARA success measure.

Worker allocation was still pending when this transcript was received. The
Founder subsequently clarified its basic rules in `DEC-022`; that authority
comes from the direct instruction, not the video. Supplying a transcript is
research input, not implementation approval. The prototype stays unchanged
under `DEC-015`.

## Founder screenshots of finances and government

Source: five screenshots supplied on 7 October 2026: two sections of the
Balances panel and three sections of Change Form of Government. These are
visible interface observations; no staffing, government or military action
was performed. Account balances and town names are not retained here as data.

### Observed financial breakdown

The town table separates income, scientist expenses and each town's result,
then totals them. Another section separates troop and fleet upkeep, research
reductions, a government reduction and supply costs. The final summary deducts
military upkeep from the town results after scientist expenses. In this
snapshot, a positive combined town result becomes an overall deficit after
military costs; supply costs are displayed as zero.

Scientist expenses and the research reductions on military upkeep are different
entries. The former is an expense; the latter reduces another expense. Scientist
costs have already been deducted in the town result and must not be subtracted
again from that subtotal. Zero supply costs in one snapshot do not mean supply
costs never apply. Exact modifier stacking and rounding are not established.

### Observed government choices

The selected government is identified above a list of alternatives. The
displayed choices include a neutral baseline and contrasting advantages and
disadvantages affecting construction, satisfaction, espionage, research,
corruption, military upkeep or logistics. Not every government's details are
shown. The switching description states a currency cost and a temporary
transition whose size or duration scales with the number of owned towns.
This establishes what the interface describes, not a completed switch or its
actual consequences. Religious bonuses are visible reference content only.

### Inferred lessons and proposed AZMARA applications

| Inferred design lesson | Proposed AZMARA application |
|---|---|
| A positive town economy can still support an unaffordable military. | Show town contributions and empire commitments together, with one final surplus or deficit. The location and ownership of AZMARA's treasury remain undecided. |
| Resource employment and paid scholarly work create distinct economic pressures. | Keep foregone citizen income separate from any future researcher expense. `DEC-022` approves the former relationship; research staffing and costs need a separate decision. |
| Knowledge can cost money while improving efficiency elsewhere. | Explore research as a long-term investment with clear effects, rather than importing displayed military discounts or guaranteeing a particular research benefit. |
| Policy choices can trade strengths against weaknesses. | Consider original administrative styles with explicit trade-offs. Names, scope, unlocks, costs, switching rules and effects remain proposals. |
| Cost modifiers and subtotals can be confused. | Explain the path from base cost to final cost and avoid counting the same expense twice. Preview consequences before commitment. |

The screenshots do not establish what happens when the treasury reaches zero,
whether forces disband, or whether research stops. Those are separate design
questions. They also do not resolve the pending per-town versus island-wide
worker-capacity limit.

No new AZMARA rule is approved by these images. Exact government forms,
percentages, prices, timings, army costs and premium features are not imported.
Deity, miracle and worship-based bonuses remain excluded under `DEC-007`.
The current prototype is unchanged.

## Founder plot explanation and phone controls — 8 October 2026

Source: the Founder's direct description, not a new live inspection or an
independently verified reference-game rule. He reports 19 ordinary plots,
one wall-only plot, two harbour plots allowing Trading Port or Shipyard,
and one freighter-only plot. He describes Shipyards as building warships.
The dedicated slots do not accept ordinary town buildings.

Inferred design lesson: spatial capacity and designated waterfront/defence
sites constrain town specialisation without treating every empty place as
interchangeable. The reported total is 23 slots; this is not a copied map.

AZMARA direction: explicitly approved as a changeable working structure in
`DEC-031` and `IDEA-010`, with original art, layout and code. Final building
names, catalogue, duplicate limits, unlocks, demolition/replacement, costs
and freighter/transport systems remain open. The current six-place town demo
does not yet implement the complete plot system.

The Founder also asked for up/down finger movement and plus/minus zoom.
`DEC-030` approves that bounded camera improvement for the existing prototype;
it is separate from plot gameplay and from population/economy simulation.

## Complete building screenshots — 10 October 2026

Observed source: Founder-supplied Ikariam building-help screenshots, completed
with the message “thats all of them”. One five-image batch was duplicated; it
does not add five more building types. Static help descriptions are not proof
of live actions or universal costs. Intake covers 31 unique roles, including
the earlier Town Hall, Academy, Warehouse, Tavern and Palace. Tables are cropped.

Inferred lesson: buildings connect storage, satisfaction, knowledge, expansion,
diplomacy, markets, transport, military readiness and material efficiency.
AZMARA's 19 general plots do not imply all building types fit simultaneously.

Proposed original adaptations under DEC-048; names remain working labels:

| Screenshot role | AZMARA draft / purpose |
|---|---|
| Town Hall | Existing civic courtyard / population capacity |
| Academy | Academy / scholars and research |
| Warehouse | Warehouse / protected storage |
| Tavern | Provision House / grain provision and satisfaction |
| Palace | Palace / expansion administration |
| Governor’s Residence | Governor’s Residence / colony administration |
| Museum | Museum / culture and civic collections |
| Trading Port | Trading Port / merchant loading |
| Shipyard | Shipyard / warships |
| Barracks | Barracks / troop training |
| Town Wall | Town Wall / defensive perimeter |
| Embassy | Embassy / treaties and alliances |
| Trading Post | Trading Post / resource market |
| Workshop | Workshop / military equipment |
| Hideout | Intelligence House / spies and information |
| Forester’s House | Forester’s House / timber production support |
| Glassblower | Silver Refinery / silver production support |
| Alchemist’s Tower | Iron Foundry / iron production support |
| Winery | Grain Estate / grain production support |
| Stonemason | Clayworks / clay production support |
| Carpenter’s Workshop | Carpenter’s Workshop / timber efficiency |
| Optician | Precision Workshop / silver efficiency |
| Firework Test Area | Materials Workshop / iron efficiency |
| Wine Press | Grain Store / grain-use efficiency |
| Architect’s Office | Architect’s Office / clay efficiency |
| Temple | Prayer Area / possible satisfaction benefit |
| Depot | Depot / bulk storage |
| Black Market | Military Exchange / military trade |
| Sea Chart Archive | Sea Chart Archive / journey efficiency |
| Dockyard | Dockyard / freighter facilities |
| Chronos’ Forge | Chronos’ Forge / secular construction planning |

No reference sprites, prose, unlock tree, numerical bonuses, training floors,
level costs, timers, tax minima, travel caps or 21-town limit are imported.
Visual cards do not implement those mechanics. Island sites retain the agreed
resource-production location; town support buildings are proposed modifiers,
not replacement mines or new production recipes.

Founder clarification retains both Prayer Area and Chronos’ Forge, superseding
the initial omission proposal. Satisfaction rules remain open; the Forge has
no gods, divine powers or miracles. Trade, war and economics are the overall
emphasis, not approval of every proposed dependency or a production economy.
