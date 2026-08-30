# TasteVault Context

TasteVault is a local-first personal UX/design memory system. It captures web
experiences a person has explicitly chosen as good, preserves the evidence and
the human's reasoning behind them, and exposes that corpus for human browsing and
for retrieval by an AI coding agent. This glossary fixes the vocabulary the
project uses.

## Language

**Reference**:
The unit of knowledge in the system: one thing the user saved as a signal about
their taste. By default it is something they like; it is something they want to
**avoid** when its `sentiment` is explicitly `negative` (see **Sentiment**). A
Reference may represent an entire site, a page, a component, a single
interaction, a transition, an animation, a responsive behaviour, or a UX pattern.
It is identified by a human-readable slug. Its `kind` is `page` (a whole page or
site) or `element` (a component or region isolated from its surroundings);
`interaction` and `flow` kinds arrive with later phases.
_Avoid_: Experience (informal prose only), item, entry, capture, sample.
Anti-Reference (a negative Reference is still a Reference).

**Sentiment**:
Which pole of the user's taste a Reference represents: `positive` (the default —
something to emulate) or `negative` (something to steer away from, a guard rail
for the AI agent). Recorded as an optional `sentiment` field; absent or
unparseable means positive. Orthogonal to `rating`, which measures the *strength*
of the feeling on either pole.
_Avoid_: Polarity, sign, disposition, like/dislike flag.

**Surface**:
A freeform hint on a Reference describing the kind of product or screen the
Evidence was taken from — e.g. "dashboard", "marketing site", "editor",
"onboarding". Not a controlled vocabulary and not required.
_Avoid_: Category, section, type (reserve "kind" for the page/element axis).

**Vault**:
The user's private, local collection of References. The application code is
open-source; the Vault is not — it lives on the user's machine and is never
committed.
_Avoid_: Library (reserve for the Portal view), database, corpus (informal only).

**Portal**:
The human-facing web application for browsing, inspecting, and curating the Vault
— "a personal Mobbin". Distinct from the retrieval interface an agent uses.
_Avoid_: Dashboard, UI, app, web client.

**Evidence**:
Raw captured artifacts of a Reference — screenshots, DOM snapshot, computed
styles, accessibility tree, interaction traces, assets. Evidence is preserved as
captured and is never overwritten by derived data.
_Avoid_: Data, capture output, snapshot (reserve "snapshot" for the DOM snapshot
specifically).

**User Note**:
The human's own explanation, in their own words, of why a Reference matters —
what they like about it, or, for a negative Reference, what they want to avoid.
It is first-class, independently searchable data and is never replaced by AI
output.
_Avoid_: Comment, description, caption, rationale, annotation.

**AI Interpretation**:
Derived data produced by analysing a Reference's Evidence — extracted
vocabularies, inferred UX/interaction/motion patterns, design principles, and
searchable representations. Always marked as derived; never ground truth.
_Avoid_: Analysis, metadata, tags (tags are one narrow output), insights.

**Capture**:
The act of collecting Evidence from a running web page into a new Reference. In
Phase 1 this is manual (the user places files by hand); later phases automate it
via a browser extension.
_Avoid_: Ingestion, import, scrape, clip.

**Taste Profile**:
A higher-level summary of the user's taste derived by aggregating across the
whole Vault — tendencies to emulate (from positive References) and tendencies to
avoid (from negative ones). Derived knowledge, not ground truth; individual
References remain the evidence.
_Avoid_: Preferences model, style guide, persona.
