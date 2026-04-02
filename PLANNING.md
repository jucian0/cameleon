# Cameleon Planning

## Objective

Turn Cameleon into a reliable Apache Camel workflow studio that teams can use to:

- model routes visually
- edit Camel YAML safely
- validate route structure before saving
- reuse templates and patterns
- collaborate on workflows without corrupting the underlying DSL

The current project already has a strong base:

- a visual topology builder
- YAML editing
- parser work for several block EIPs
- workflow persistence
- metadata-driven forms

What is missing is product hardening, Camel-specific UX depth, and operational reliability.

## Detailed Area Documents

The following documents break the plan into functional areas:

- [PLANNING-STABILITY.md](/Users/jucianobarbosa/personal/camelion/PLANNING-STABILITY.md)
- [PLANNING-AUTHORING.md](/Users/jucianobarbosa/personal/camelion/PLANNING-AUTHORING.md)
- [PLANNING-PRODUCTIVITY.md](/Users/jucianobarbosa/personal/camelion/PLANNING-PRODUCTIVITY.md)
- [PLANNING-COLLABORATION.md](/Users/jucianobarbosa/personal/camelion/PLANNING-COLLABORATION.md)
- [PLANNING-OPERATIONS.md](/Users/jucianobarbosa/personal/camelion/PLANNING-OPERATIONS.md)

Important boundary:

- `operations` owns observability, diagnostics, runtime visibility, release safety, and operational feedback loops
- it does not own dashboard/home UX maturity, template product depth, auth UX polish, or parser test infrastructure by itself

## Product Direction

The product needs a tighter primary promise. The most credible direction from the current codebase is:

**A visual-first Camel route studio with safe YAML round-trip and reusable integration templates.**

That is narrower and stronger than trying to be:

- a general integration platform
- a runtime/deployment platform
- a broad workflow automation tool

The near-term goal should be to win on authoring quality, not on breadth.

## Success Criteria

The app is in a strong position when a user can:

1. create a Camel workflow from a template or from scratch
2. edit it visually without breaking the YAML
3. edit it in code view without breaking the canvas
4. validate the workflow before saving
5. save, reopen, clone, and share it reliably
6. trust that common Camel EIPs and endpoint configuration are represented correctly

## Phase 1: Stability and Trust

This is the highest-priority phase. Without this, feature expansion will increase support cost and user distrust.

### 1. Route Loading and Navigation Hardening

Goals:

- eliminate route-load crashes
- make failures visible and actionable
- prevent generic frontend fetch errors from hiding backend problems

Work:

- harden all loaders that assume records exist
- return explicit `404`, `401`, and `500` route responses
- add route-level error boundaries where missing
- ensure navigation from workflow list to workflow detail and studio routes is stable
- verify behavior for:
  - missing workflow id
  - inaccessible workflow
  - malformed stored content
  - empty workflow content

Definition of done:

- no generic `Failed to fetch` navigation errors for known backend/loader failures
- every route failure maps to a visible error state

### 2. YAML Round-Trip Reliability

Goals:

- guarantee that Camel YAML can be loaded, edited, and saved without accidental corruption
- keep internal metadata separate from exported DSL

Work:

- keep `{ data, comments }` internal only
- always export Camel YAML at the root
- support legacy internal-envelope input for backward compatibility
- add fixtures for:
  - basic routes
  - `choice`
  - `doTry`
  - `multicast`
  - `loadBalance`
  - `split`
  - `circuitBreaker`
- verify parse -> canvas -> save -> parse round-trip consistency

Definition of done:

- no internal envelope leaked in exported YAML
- stored YAML can be consumed as Camel YAML directly
- fixture-based round-trip tests pass

### 3. Parser Regression Coverage

Goals:

- stop breaking canvas behavior while improving EIP support
- lock in branch semantics and placeholder behavior

Work:

- add parser fixtures and expected graph assertions for:
  - empty block
  - block with steps
  - block at end of route
  - block followed by another step
- focus first on the sensitive parsers:
  - `choice`
  - `doTry`
  - `multicast`
  - `loadBalance`
  - `circuitBreaker`
- validate:
  - branch exits
  - final placeholder behavior
  - no self-edges
  - no duplicate placeholders

Definition of done:

- parser changes require fixture updates or pass existing assertions
- regressions like disconnected `Add step` nodes are caught automatically

## Phase 2: Camel-Specific Authoring Quality

This phase makes the editor genuinely useful for Camel users rather than just technically functional.

### 4. Dynamic Form System Maturity

Goals:

- make metadata-driven editing practical for real Camel routes
- reduce raw JSON editing

Current status:

- simple scalar fields work
- grouped sections work
- special renderers now exist for:
  - expressions
  - arrays
  - objects

Remaining work:

- add specialized renderers for:
  - endpoint URI + parameters
  - predicates
  - exception class arrays
  - nested expression variants
  - map-like parameter sets
- support validation hints from metadata:
  - required fields
  - defaults
  - enums
  - sensitive fields
- define a field registry:
  - generic renderer fallback
  - Camel-specific renderer overrides

Definition of done:

- most common Camel EIPs/components can be configured without raw JSON
- hidden structural fields do not leak into the editor

### 5. Endpoint and Component Modeling

Goals:

- represent Camel endpoints the way Camel users expect
- reduce confusion between EIPs and components

Problem:

- Camel components are not the same as arbitrary step types
- many user-facing actions should map to endpoint configuration under `from` / `to`

Work:

- define a clear strategy for endpoint editing:
  - URI-first
  - parameters-first
  - or hybrid
- improve form UX for endpoint parameters and URI generation
- ensure component insertion creates valid Camel structures
- distinguish:
  - EIPs
  - expressions
  - endpoint producers/consumers

Definition of done:

- a user can configure common endpoints without hand-writing raw YAML
- generated output is Camel-compatible and predictable

### 6. Validation Before Save

Goals:

- catch invalid or incomplete configurations before they hit persistence
- increase user confidence in the studio

Work:

- add client-side validation for:
  - required metadata fields
  - malformed expressions
  - invalid arrays/objects from the dynamic form
  - structurally incomplete blocks
- add route-level validation messages near the edited node
- define error severity:
  - blocking errors
  - warnings
  - informational hints

Definition of done:

- save can be blocked for structurally invalid workflows
- the user sees what is wrong and where

## Phase 3: Workflow Productivity

This phase improves adoption and daily usability.

### 7. Starter Templates and Guided Creation

Goals:

- reduce time-to-first-success
- help users who know Camel conceptually but do not want to build every route from zero

Work:

- add curated templates for:
  - timer -> log
  - file -> transform -> file
  - REST -> bean -> response
  - Kafka consumer -> processor -> Kafka producer
  - splitter
  - multicast
  - error handling with `doTry/doCatch`
- expose templates in workflow creation flow
- allow users to clone examples directly into a new workflow

Definition of done:

- a new user can create a meaningful workflow in under a few minutes

### 8. Versioning, Autosave, and Recovery

Goals:

- reduce data loss
- make experimentation safe

Work:

- implement autosave with clear status:
  - saving
  - saved
  - failed
- keep version history for workflow content
- add restore / compare flow
- support draft vs published workflow states if relevant

Definition of done:

- accidental navigation or refresh does not silently lose edits
- users can inspect and restore previous versions

### 9. Search, Organization, and Reuse

Goals:

- make the workflow library usable as the number of workflows grows

Work:

- improve workflow metadata:
  - tags
  - ownership
  - description quality
- better list page filtering and sorting
- duplicate/clone and template reuse flows
- saved snippets or reusable route fragments

Definition of done:

- users can find and reuse existing workflows efficiently

## Phase 4: Collaboration and Distribution

This phase matters once authoring is reliable.

### 10. Sharing and Access Modes

Goals:

- make workflows easy to review and reuse

Work:

- clean public/private behavior
- read-only shared mode
- clone-from-public flow
- explicit permission states in UI

Definition of done:

- users understand what can be edited, shared, and copied

### 11. Import and Export

Goals:

- make the tool fit into real Camel workflows outside the app

Work:

- import Camel YAML directly
- export Camel YAML directly
- preserve comments where possible
- provide failure messages for unsupported/ambiguous structures

Definition of done:

- import/export works as a first-class capability, not just internal persistence

## Phase 5: Observability and Operational Readiness

This phase supports scale and debugging.

### 12. Error Monitoring

Goals:

- understand where users fail
- shorten debugging time

Work:

- add frontend error logging
- capture route loader/action failures
- capture YAML parse failures
- capture canvas/parser failures

Definition of done:

- production issues can be traced to a route, node type, or workflow action

### 13. Metrics

Goals:

- know whether the product is actually becoming useful

Suggested metrics:

- workflow create success rate
- route open success rate
- save success rate
- parse failure rate
- average time from create to first save
- percentage of workflows created from templates

Definition of done:

- the team can prioritize using real usage data, not only intuition

## Technical Priorities

If engineering bandwidth is limited, prioritize in this order:

1. route/load/save reliability
2. parser regression tests
3. YAML round-trip safety
4. validation before save
5. Camel-specific form renderers
6. endpoint modeling improvements
7. templates and onboarding
8. version history and autosave
9. sharing/import/export
10. observability

## Short-Term Milestones

### Milestone 1

Stabilize the editor.

Deliverables:

- hardened loaders and error states
- parser fixtures for sensitive EIPs
- verified Camel YAML export

### Milestone 2

Make Camel editing practical.

Deliverables:

- stronger dynamic forms
- endpoint editing improvements
- pre-save validation

### Milestone 3

Improve first-use success.

Deliverables:

- starter templates
- template-based workflow creation
- workflow list improvements

### Milestone 4

Make editing safe over time.

Deliverables:

- autosave
- versions
- recovery

## Main Risks

### 1. Internal Model Drift

Risk:

- the internal editor model diverges from Camel DSL semantics

Impact:

- broken exports
- confusing UI behavior
- hard-to-fix compatibility issues

Mitigation:

- fixture-driven tests
- explicit import/export adapters
- avoid leaking internal structures into persisted YAML

### 2. Parser Complexity

Risk:

- branch EIPs become harder to maintain as support grows

Impact:

- repeated regressions in placeholders, joins, and graph consistency

Mitigation:

- standardized parser expectations
- graph assertions
- fixtures for empty/non-empty/end-of-route cases

### 3. Metadata-Driven UI Limits

Risk:

- a generic form system cannot adequately represent Camel semantics alone

Impact:

- users fall back to raw YAML for too many tasks

Mitigation:

- field renderer registry
- Camel-specific renderers for high-value cases
- explicit fallback to code view when needed

## Recommended Next Actions

The next concrete steps should be:

1. add parser fixture tests for `choice`, `doTry`, `multicast`, and `loadBalance`
2. add route-level error boundaries and clean loader failure states
3. extend dynamic forms with endpoint-specific renderers
4. implement pre-save validation
5. create a small template catalog for common Camel patterns

## Final Note

This app already has a meaningful foundation. The main challenge is no longer proving that a Camel studio can exist. The challenge is making it reliable enough that users trust it with real workflows.

That means the next wins should come from:

- correctness
- validation
- usability for real Camel structures
- safe persistence and recovery
