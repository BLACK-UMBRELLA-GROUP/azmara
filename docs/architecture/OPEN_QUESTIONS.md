---
id: DOC-AZM-0042
type: PLAN
status: CURRENT
feature: OPEN QUESTIONS
purpose: Open questions — production architecture unresolved
links: []
owner: AZMARA chat
---

# Open questions — production architecture unresolved

Status: **DEFERRED / EXPLORATORY**, except the bounded iPhone prototype
packaging choice under `DEC-039`. A question is not a requirement.

The [current concept](../CONCEPT.md) records the approved Abbasid-era Baghdad
and Islamic Golden Age inspiration. These questions concern unresolved choices
within that direction, not whether to return to the reference game's setting.

## Define the game before selecting the stack

1. Within the approved fictional inspired world and player-owned town, what
   geography, chronology and original lore should be developed?
2. Who is the intended player, and how much attention should a typical day need?
3. What decisions make the smallest core loop enjoyable?
4. What happens offline, and how forgiving should long absences be?
5. Which multiplayer interaction is essential to prove the concept, rather
   than merely expected of a large MMO?
6. How should the chosen inspiration shape player decisions and distinguish
   this game beyond its appearance and terminology?

## Technical choices deliberately deferred

- Client technology and game engine; 2D/3D approach and rendering needs.
- Delivery order and supported versions for the approved iOS, Android and
  browser targets; phone, tablet and desktop-browser layouts and input.
- Shared accounts, cross-play and progress continuity between platforms.
- Server architecture, simulation authority and time reconciliation.
- Data model, database, realtime delivery and hosting/provider selection.
- Scale targets, cost budget, operational support and backup/recovery design.
- Accounts, moderation, abuse prevention and anti-cheat approach.
- Push notifications, accessibility, localisation and offline behaviour.
- Build/test tooling, environment configuration and release pipeline.

These will need evidence and an approved concept. No option is selected merely
because it was used in another project.

## Commercial and identity choices deliberately deferred

- Final name and branding, handle acquisition and name clearance;
  AZMARA is the approved provisional name under `DEC-009`. The Founder has
  purchased `azmara.app`; private web routing is confirmed under `DEC-041`.
- Monetisation, payments, competitive fairness and launch territories.
- Audience/age boundaries, privacy obligations and terms.
- Artwork production, asset licensing and redistribution licence for our code.

No new production accounts or services, purchases or public registrations
are authorised by this exploratory checklist. The existing owner-private Site
preview is the narrow `DEC-029` exception, with source updates authorised by
later visual decisions; `DEC-039` permits the separate local iPhone prototype,
and `DEC-041` connects the purchased domain without public access. The
first local town-screen design is approved under `DEC-012` and `DEC-013`;
review that design before selecting production systems or server architecture.

## Downloadable prototype assessment — 9 October 2026

The initial research below was authorised under `DEC-038`. The later direct
Founder instruction `DEC-039` supersedes its local packaging pause: use the
already-installed Flutter/Xcode process to install a separate bundled iPhone
prototype. Current outcomes belong in `../implemented/STATUS.md`; earlier
research recommendations are not the current build instructions.

The Founder directly authorised contacting **ZYRA ADMIN**. Its completed
read-only reply establishes Flutter/Dart for ZYRA, paired-iPhone PROFILE installs
for quick changes, and internal TestFlight delivery for remote updates.
External build 5's last established state was Waiting for Review, not approval.
Android APK builds do not establish successful phone runtime or Play delivery;
its debug signing must not be copied as a production configuration.
No ZYRA files, accounts, settings or builds were changed by this consultation.

Recommendation: **Capacitor with bundled local AZMARA assets**, retaining the
current browser game. This packages the visual prototype, not the final
production game engine. Flutter WebView is an alternative if the Founder
specifically prefers that toolchain; equivalent phone delivery does not require
ZYRA's framework, backend or credentials.
[Capacitor](https://capacitorjs.com/docs),
[Flutter WebView](https://pub.dev/packages/webview_flutter).

| Stage | Intended experience | Current AZMARA state |
| --- | --- | --- |
| Private web | Open the existing phone/desktop preview | Available; browser-local progress |
| Paired iPhone | Install/update an AZMARA icon from the Mac | Not built or installed |
| Internal TestFlight | Install/update away from the Mac | App record, signing and authorised upload needed |
| Android testing | Install a signed test build, then Play testing updates | Toolchain, signing and real-device checks needed |
| Public stores | Separately approved production release | Not authorised or release-ready |

The first native package would include only the existing 23-plot demonstration:
fresh/reset Hall 1, original artwork, full-screen camera, four-dot menu, rename
and illustrative 10-second Hall queue. No new economy, accounts, multiplayer,
purchases or cloud saves are implied.
The current sanitised browser delivery is seven files, 7,957,656 bytes in total
(including the review page). This is an asset inventory, not an IPA/APK or its
predicted installed size; native tooling adds its own payload.

Native assets should be bundled; do not use the private hosted Site as a
production `server.url`. A Site update will not automatically update an
installed bundled app. Native builds require their own release numbering.
[Capacitor configuration](https://capacitorjs.com/docs/config).

Keep validated v3 state semantics and the untouched legacy key. The native app
has a separate storage container: browser/Site progress will not automatically
appear there. Define a durable save adapter and test update retention, reset,
corruption and suspend/resume before claiming continuity. Importing browser
progress would require a deliberate feature. Uninstalling can erase app-local
data. [Capacitor Preferences](https://capacitorjs.com/docs/apis/preferences).

Device acceptance must cover offline cold launch, notch/home-indicator safe
areas, all plots at Fit, Close and two-axis touch/pinch, menu/dialog behaviour,
Android Back, rename keyboard, background/resume queue completion and in-place
updates with saved progress. Chromium emulation is not native acceptance.

Read-only toolchain evidence: selected Xcode 27.0 and bundled Node 24.19.0.
No Java runtime or Android Studio/adb was found at the usual checked locations;
absence elsewhere was not proven. Nothing was installed.
[Environment requirements](https://capacitorjs.com/docs/getting-started/environment-setup).

Founder decisions identified during that earlier research:

1. Capacitor or explicitly preferred Flutter; the question is presented in this chat.
2. Authorised legal publisher/developer team, with independent AZMARA bundle and
   package IDs; do not infer a registered entity from the private Site address.
3. Keep the first installed prototype Founder-only, or define another audience.
4. Separately approve account creation, charges, signing/account mutations,
   uploads and external/public release.

Internal TestFlight users must be eligible App Store Connect users; external
testing is a different invitation/review route. Play has its own internal test
track. Store approval is not promised for this limited town demonstration.
[Apple TestFlight](https://developer.apple.com/help/app-store-connect/test-a-beta-version/testflight-overview/),
[Google testing](https://support.google.com/googleplay/android-developer/answer/9845334?hl=en),
[Apple minimum functionality](https://developer.apple.com/app-store/review/guidelines/#minimum-functionality).

## AZMARA domain and business baseline — 9 October 2026

`DEC-039` authorises preparation and explicit ZYRA ADMIN coordination, not a
purchase or live-provider change. ZYRA ADMIN's read-only handover establishes
its pattern: Cloudflare Registrar/DNS, a separate Pages website, and Google
Workspace with one real mailbox plus aliases. Fresh public checks confirm its
Google mail authentication, monitored DMARC and DNSSEC. They do not freshly
prove account ownership/recovery, both hardware keys, auto-renew, all aliases,
company registration or the deployment of recent local website changes.

Subsequent confirmed state under `DEC-041`: the Founder purchased `azmara.app`.
Cloudflare Registrar shows Active, expiry 9 October 2027, auto-renew enabled
for 9 September 2027, and displayed renewal price $14.20/year. It is in the
existing account named Zyra Connect, account ID
`f2c1a6060e5ca076b42bb379db235bc9`, with its own AZMARA zone ID
`227315e0f0ab385900af348b17331eae`. This verifies the current arrangement, not
the recommended separate organisation account or a registered publisher.
Only this new zone's four web-routing/validation records were added. The
existing private Sites project now accepts `https://azmara.app/`, with active
hostname and HTTPS certificate. Existing Site audience is preserved; the
business-mail, recovery/security, legal and production-release checklist remains
unfinished. See the implementation status for verification and limitations.

Remaining business-baseline checklist for the confirmed `azmara.app` domain
(registration and private routing are already verified; not all items below
have been reviewed or authorised):

1. Confirm AZMARA spelling/TLD, real person or entity as registrant, destination
   Cloudflare account, reachable existing verification email, exact registration
   and renewal prices. The Founder buys it; do not invent a registered company.
2. Verify receipt, expiry, payment/auto-renew, registrar contact verification,
   primary and spare security keys plus recovery, and DNSSEC activation. Registrar
   requires Cloudflare nameservers, not necessarily Cloudflare website hosting.
3. Decide email ownership: separate Workspace tenant/user versus consciously
   authorised shared tenant/domain. Aliases route to a mailbox and are not a
   separate Google login or isolation boundary. Proposed addresses: admin,
   hello, support, social, billing, security and dmarc at the confirmed domain.
4. Configure only AZMARA MX/SPF and its own DKIM; prove inbound/outbound delivery
   and From identity. Inventory any future transactional senders before SPF.
   Start monitored DMARC after authentication is working, then review evidence
   before progressively enforcing policy. Do not copy ZYRA's DKIM material or
   overwrite its records; do not mix Gmail MX with Cloudflare Email Routing.
5. Separately approve a public website/access plan. The existing private game
   stays private, and the local bundled iPhone game needs neither a domain nor
   a running Mac. Establish independent expense, ownership, renewal and recovery
   records. Legal operator, privacy/support documents, name/trademark clearance
   and public/store release remain separate work.

Domain acquisition is neither incorporation nor name/trademark clearance.
The purchased domain and private custom-domain web delivery are confirmed;
AZMARA mail, public launch and completed business baseline are not claimed.

### Founder login, business accounts and plugin connections

Advice requested on 9 October, checked against official documentation and
ZYRA ADMIN's scoped reply; this is not an approved account migration.

Recommended structure: one securely protected, Founder-controlled Cloudflare
human login with membership in **two separate organisation accounts**, ZYRA
and AZMARA. The login email identifies the human; account and zone IDs identify
the project's resources. Cloudflare users may belong to multiple accounts,
each with separate billing, members and settings. Do not move ZYRA merely to
set up AZMARA. Before AZMARA email exists, an existing independent personal/
Founder mailbox is a reasonable login/verification channel; keep recovery
independent of the new domain. Registrant information must identify the real
owner now, not an unregistered company. Aliases do not create security isolation.
[Cloudflare account model](https://developers.cloudflare.com/fundamentals/concepts/accounts-and-zones/),
[recovery best practices](https://developers.cloudflare.com/fundamentals/reference/best-practices/).

One ChatGPT/Codex account does not require all external provider identities
to use the same email. OpenAI's plugin platform supports multiple connected
accounts. Cloudflare OAuth consent can authorize selected account(s) and
permissions. Neither establishes that a particular connector is configured
correctly here: the current plugin-directory search returned no Cloudflare
result, and no actual Cloudflare connection/account selector was inspected.
Verify the exact integration, chosen account/zone IDs and least-privilege
permissions before writes; do not promise automatic safe selection or expose
API tokens in chat. Separate connections/scopes may be used where supported,
but do not create them without explicit setup authority.
[OpenAI plugin account support](https://developers.openai.com/plugins/build/auth),
[Cloudflare OAuth account selection](https://developers.cloudflare.com/fundamentals/oauth/authorizing-an-application/),
[official Cloudflare MCP servers](https://developers.cloudflare.com/agents/model-context-protocol/cloudflare/servers-for-cloudflare/).

Primary references checked 9 October 2026:
[Cloudflare registration](https://developers.cloudflare.com/registrar/get-started/register-domain/),
[renewals](https://developers.cloudflare.com/registrar/account-options/renew-domains/),
[MFA](https://developers.cloudflare.com/fundamentals/user-profiles/2fa/),
[DNSSEC](https://developers.cloudflare.com/registrar/get-started/enable-dnssec/),
[Google domain choices](https://knowledge.workspace.google.com/admin/domains/add-a-user-alias-domain-or-secondary-domain),
[SPF](https://knowledge.workspace.google.com/admin/security/set-up-spf),
[DKIM](https://knowledge.workspace.google.com/admin/security/set-up-dkim),
[DMARC rollout](https://knowledge.workspace.google.com/admin/security/recommended-dmarc-rollout).
