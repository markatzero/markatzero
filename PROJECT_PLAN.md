# MARK AT ZERO — MASTER PROJECT PLAN

## Project Identity

Name: MARK AT ZERO

Domain: markatzero.com

Tagline:
ONE MILLION PEOPLE. ONE MOMENT.

Core visual:
00:00:00

Main CTA:
LEAVE YOUR MARK — €1

MARK AT ZERO is a global interactive experience where people leave a permanent visual Mark that becomes part of a worldwide visual moment at 00:00:00.

One million Marks is the first campaign milestone, not a technical limit.

The platform architecture must support multiple millions of Marks.


## Core User Flow

1. User clicks LEAVE YOUR MARK.
2. Uploads an image, logo, symbol, artwork, flag, or other visual Mark.
3. Selects country.
4. Adds an optional short message.
5. Reviews the Mark.
6. Proceeds to payment.
7. Payment provider confirms successful payment.
8. Webhook updates the Mark to paid.
9. A permanent Mark number is assigned.
10. The Mark appears on the world experience.
11. The Mark receives its own page.
12. User can share the Mark.


## Payment Rule

The browser success URL is NOT proof of payment.

The database state updated by a verified payment webhook is the source of truth.

Only successfully paid Marks count toward public statistics.


## Final Visual Target

The main experience uses a very dark space/navy visual style with cyan, blue, and purple lighting.

The world map is the central experience.

The continents must eventually appear to be composed of thousands or millions of tiny user Mark images.

At far zoom:
the Marks visually merge into a dense mosaic forming the continents.

As the user zooms closer:
more detailed Mark imagery becomes visible.

At close zoom:
individual Marks become clear and interactive.

Users must eventually be able to:

- drag the world map
- zoom deeply
- explore countries and regions
- click individual Marks
- open Mark information
- use Random Mark
- view Top Countries
- view individual Mark pages
- share Marks

Search is NOT part of the product.

The reference design previously supplied is the official visual specification.


## Map Architecture

The final system must NOT render millions of HTML or SVG markers simultaneously.

Architecture:

WORLD VIEW
→ MOSAIC TILES
→ COUNTRY / REGION DETAIL
→ INDIVIDUAL INTERACTIVE MARKS

Use progressive loading / Level of Detail (LOD).

Far zoom:
precomputed mosaic tiles.

Medium zoom:
higher-detail mosaic tiles.

Close zoom:
actual interactive Marks for the visible area only.

The geographic interaction layer and the mosaic rendering layer must remain separate.


## Stable Mark Coordinates

Marks must NOT receive new random positions every time the browser loads.

Each paid Mark will eventually store permanent coordinates in the database.

Target Mark data model:

id
mark_number
image_url
country_code
country_name
message
status
payment_id
created_at
longitude
latitude
visual_weight

longitude and latitude are assigned once and stored permanently.

visual_weight allows future paid map footprint tiers if adopted.


## Technical Stack

Frontend:
Next.js
TypeScript
Tailwind CSS
App Router

Current stable map baseline:
react-simple-maps
local countries.geojson

Database / storage:
Supabase

Payments:
Stripe Checkout currently implemented.

Payment architecture should remain capable of supporting additional payment methods later.

MapLibre experiments were unsuccessful and are NOT the current renderer.

Do not switch map technology again without a proven architectural reason.


## Current Project Structure

src/
├── app/
│   ├── page.tsx
│   ├── api/
│   │   ├── marks/
│   │   ├── checkout/
│   │   └── webhook/
│   └── lib/
│       └── supabase.ts
│
├── components/
│   ├── LeaveMarkModal.tsx
│   └── map/
│       └── WorldMap.tsx
│
├── lib/
│
└── types/
    └── mark.ts


## Current Completed Work

- Next.js project running locally.
- Supabase connected.
- Public Mark image storage configured.
- Mark upload flow implemented.
- Stripe Checkout implemented.
- Stripe webhook payment confirmation implemented.
- Paid Marks load from the database.
- Permanent mark_number currently assigned after successful payment.
- Working geographic SVG world map restored.
- User Marks are geographically attached to countries in current baseline.
- WorldMap extracted from the old giant page.tsx.
- LeaveMarkModal extracted from page.tsx.
- Shared PaidMark type moved to src/types/mark.ts.
- page.tsx reduced from approximately 884 lines to approximately 249 lines.
- Current site runs with VS Code PROBLEMS = 0.


## Known Technical Work Before Production

Current mark numbering uses MAX(mark_number) + 1.

Before production launch this must be replaced with an atomic database sequence/function to prevent duplicate numbers under concurrent payments.

Current statistics are based on the Marks returned by the existing API and are not scalable.

Before launch, statistics must use database aggregation / dedicated stats endpoint or RPC.

Pending abandoned uploads require cleanup.

Production also requires:

- security review
- Supabase policy review
- rate limiting
- image validation
- image compression
- caching / CDN strategy
- production Stripe configuration
- domain configuration
- responsive testing
- performance testing
- payment success/failure testing


## Development Rules

1. Architecture first.
2. Do not switch core technologies without a proven blocker.
3. Core product before decoration.
4. One clear goal per development step.
5. Git commit after coherent milestones.
6. Do not experiment inside the stable working version.
7. Fix blockers for the current phase first.
8. Do not rebuild giant page.tsx.
9. Do not create temporary visual hacks that will soon be discarded.
10. The reference screenshot is the visual specification.
11. Do not fake premium or user data.
12. Preserve a working Git checkpoint before risky architectural work.


## Development Phases

### Phase A — Architecture Cleanup

Status: nearly complete.

Completed:

- WorldMap component extraction
- LeaveMarkModal component extraction
- shared PaidMark type
- major page.tsx reduction
- stable Git checkpoints

Remaining:
final small architecture review only if necessary.


### Phase B — Map Interaction and Stable Marks

Next major phase.

Goals:

- deep zoom
- smooth drag / pan
- sensible zoom limits
- permanent Mark coordinates
- Marks remain geographically stable
- close-view Mark interaction
- clicking a Mark


### Phase C — Mosaic and Scale

Goals:

- mosaic rendering architecture
- LOD system
- tile strategy
- progressive loading
- simulate large Mark counts
- performance/load testing
- prepare architecture for millions of Marks


### Phase D — Complete Purchase Flow

Goals:

- production-quality checkout flow
- payment method abstraction
- webhook reliability
- payment success/failure UX


### Phase E — Product Features

Goals:

- individual Mark page
- sharing
- Random Mark
- Top Countries
- Explore experience


### Phase F — Data and Backend Hardening

Goals:

- scalable statistics
- country counts
- atomic Mark numbering
- pending upload cleanup
- database improvements


### Phase G — Final Visual Match

Goals:

- match official reference design
- responsive behavior
- animations
- lighting / space atmosphere
- loading states
- error states
- final polish


### Phase H — Production

Goals:

- markatzero.com
- production environment variables
- Stripe live mode
- Supabase production security
- rate limits
- validation
- compression
- caching / CDN
- SEO


### Phase I — Final Testing and Launch

Test:

- desktop
- mobile
- payment success
- payment failure
- refresh behavior
- uploads
- zoom
- map interaction
- large simulated datasets
- performance

Then launch.


## CURRENT NEXT STEP

Finish Phase A without unnecessary component splitting.

Then begin Phase B:

DEEP ZOOM + PAN + PERMANENT/STABLE MARK COORDINATES + CLICKABLE MARK FOUNDATION.

Do not start the mosaic layer until the map interaction and permanent coordinate foundation are stable.