# Stability and Trust Planning

## Objective

Make route loading, parsing, canvas generation, and persistence reliable enough that users can trust the editor with real Camel workflows.

## Scope

This document covers:

- route loading and navigation hardening
- YAML import/export safety
- parser correctness and regression control
- workflow save/reopen reliability

## Desired User Outcomes

Users should be able to:

- open valid workflows without unexplained crashes
- understand why a workflow failed to load
- save without corrupting Camel YAML
- reopen the same workflow and see the same structure in canvas and code

## Areas

### 1. Route Loading and Navigation Hardening

- standardize loader results into `404`, `403`, and `500`
- add route-level error boundaries for workflow detail, studio, and code
- handle malformed stored content with explicit recovery UI

### 2. YAML Round-Trip Safety

- keep the internal editor model separate from exported Camel YAML
- ensure serialization is deterministic
- preserve compatibility with legacy stored content
- verify parse -> canvas -> save -> parse consistency

### 3. Parser Reliability

Highest-risk parsers:

- `choice`
- `doTry`
- `multicast`
- `loadBalance`
- `circuitBreaker`

Each should have fixtures for:

- empty block
- one child step
- multiple branches or nested steps
- block at end of route
- block followed by another step

### 4. Save and Reopen Reliability

- pre-save validation and normalization
- user-visible persistence failures
- post-save parse verification in development mode
- confidence that reopen consumes exactly what save persisted

## Engineering Deliverables

### Must Have

- explicit failure states for route loading
- YAML round-trip tests
- parser regression tests for sensitive EIPs
- no generic crash for expected backend failures

### Should Have

- recovery UX for malformed content
- development diagnostics for save/reopen mismatch

## Definition of Success

This area is successful when:

- route navigation failures are understandable
- save/reopen is trustworthy
- parser regressions are caught before release
- the editor no longer feels fragile during normal use
