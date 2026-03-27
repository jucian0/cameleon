# Stability and Trust Planning

## Objective

Make route loading, parsing, canvas generation, and persistence reliable enough that users can trust the editor with real Camel workflows.

This area is the foundation. If the app can lose data, crash on navigation, or generate inconsistent graph state, every other improvement becomes lower value.

## Scope

This document covers:

- route loading and navigation hardening
- YAML import/export safety
- parser correctness and regression control
- workflow save/reopen reliability

## Desired User Outcomes

Users should be able to:

- open any valid workflow without unexplained route crashes
- understand why a workflow failed to load
- edit a workflow and save it without corrupting Camel YAML
- reopen the same workflow and see the same route structure in canvas and code view

## Area 1: Route Loading and Navigation Hardening

### Problem

The current app can surface generic client-side navigation failures when a route loader or route module fails. This is especially damaging because users cannot tell whether the problem is:

- a missing workflow
- an authorization issue
- malformed stored content
- a runtime bug in the route module

### How It Should Work

When a user navigates from the workflow list to a workflow page:

1. the loader resolves the workflow id
2. the backend fetch returns one clear result:
   - workflow found
   - workflow not found
   - access denied
   - backend failure
3. the route renders the correct state for that result
4. malformed workflow content is handled explicitly, not through a crash

### Functional Requirements

- workflow detail loaders must use single-record fetch patterns
- no loader may assume the record exists before checking it
- all workflow routes must have explicit error handling
- malformed content must produce a visible recovery state
- the list page must not navigate to dead routes silently

### Recommended Implementation

- standardize loader return behavior
  - `404` for missing workflows
  - `403` for forbidden workflows
  - `500` for backend failures
- add route-level error boundaries for:
  - workflow detail
  - studio
  - code editor
- add a content parse guard
  - if YAML decode or parse fails, show a recovery screen with:
    - workflow id
    - error summary
    - option to open raw content if possible

### UX States

Required states:

- loading
- workflow not found
- no access
- invalid workflow content
- generic backend failure

Each state should say:

- what happened
- whether the workflow still exists
- what the user can do next

## Area 2: YAML Round-Trip Safety

### Problem

The app has an internal model that is richer than Camel YAML. That is valid internally, but dangerous if internal structures leak into exported YAML or if parsing loses essential route information.

### How It Should Work

There should be a strict boundary:

- internal model: editor-specific
- external representation: Camel YAML

Flow:

1. import Camel YAML
2. parse into internal state
3. edit visually or in code
4. serialize back to Camel YAML
5. save and reopen without structural drift

### Functional Requirements

- internal envelopes like `{ data, comments }` must never be persisted as Camel DSL output
- legacy stored data must remain loadable
- comments should be preserved where possible without changing the DSL root shape
- serialization must be deterministic

### Recommended Test Matrix

Test round-trip behavior for:

- one-route linear workflow
- multi-route workflow
- `choice`
- `doTry/doCatch/doFinally`
- `multicast`
- `loadBalance`
- `split`
- `filter`
- `aggregate`
- `circuitBreaker`

For each fixture:

1. parse to internal state
2. build canvas
3. serialize to YAML
4. parse again
5. compare normalized structure

### Success Criteria

- no internal-only keys leak into exported YAML
- no supported EIP changes meaning after save/reopen
- no unsupported structure fails silently

## Area 3: Parser Reliability

### Problem

Some Camel EIPs are not linear and require custom graph semantics. These parsers are sensitive because they do more than convert data. They also define:

- edit placeholder behavior
- branch exits
- join points
- parent parser return values

### How It Should Work

Every parser must have a stable contract:

- input:
  - step config
  - position in sequence
  - next node or placeholder id
- output:
  - created nodes
  - created edges
  - last node id to continue from

### Risky Parsers

Highest risk:

- `choice`
- `doTry`
- `multicast`
- `loadBalance`
- `circuitBreaker`

Medium risk:

- `recipientList`
- `split`
- `loop`
- `aggregate`
- `filter`

### Expected Parser Behaviors

#### `choice`

- each `when` must be represented as a branch
- `otherwise` must be optional
- empty branches must still support insertion
- the block must rejoin correctly

#### `doTry`

- main `try` flow must remain primary
- `doCatch` paths must represent exception handling
- `doFinally` must always execute after try/catch
- the visual graph must not imply invalid parallel semantics

#### `multicast` and `loadBalance`

- empty block must show a branch insertion point
- non-empty block must support multiple branches
- final route placeholder must not be duplicated
- next-step reconnection must be correct

### Required Test Fixtures

For each sensitive parser, add tests for:

- empty block
- one child step
- multiple branches or multiple nested steps
- block at route end
- block followed by another step

### Graph Assertions

Assert at minimum:

- no self-edges
- no duplicate placeholders
- no disconnected placeholders
- join target exists when expected
- returned last node id is consistent

## Area 4: Save and Reopen Reliability

### Problem

A workflow editor fails if saving appears successful but reopening changes or breaks the route.

### How It Should Work

When a user saves:

1. current editor state is validated
2. YAML serialization succeeds
3. persistence succeeds
4. a success state is shown
5. reopening the workflow produces the same model and graph

### Functional Requirements

- save must fail loudly on invalid YAML generation
- persistence errors must be user-visible
- saved content must be exactly what reopen consumes
- studio and code mode must stay in sync

### Recommended Improvements

- add a pre-save normalization step
- add a post-save parse verification in development mode
- store useful save diagnostics in logs

## Engineering Deliverables

### Must Have

- stable route loaders with explicit failure states
- YAML round-trip tests
- parser regression tests for sensitive EIPs
- no generic route crash for expected backend failures

### Should Have

- route error boundaries with recovery UX
- development diagnostics for save/reopen mismatch
- normalized parser contracts documented in code

### Nice to Have

- parser visualization snapshots for debugging
- debug mode to inspect graph output directly

## Recommended Execution Order

1. finish loader and error-boundary hardening
2. add YAML round-trip fixtures
3. add parser graph assertions
4. verify save/reopen consistency
5. add development diagnostics

## Definition of Success

This area is successful when:

- route navigation failures are understandable
- save/reopen is trustworthy
- parser regressions are caught before release
- the editor no longer feels fragile during normal use
