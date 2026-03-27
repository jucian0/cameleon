# Observability and Operational Readiness Planning

## Objective

Give the team enough runtime visibility and feedback loops to operate the app reliably, debug failures quickly, and prioritize work based on actual usage.

## Scope

This document covers:

- frontend error monitoring
- workflow action diagnostics
- parser and YAML error telemetry
- product usage metrics

## Desired Outcomes

The team should be able to:

- identify why users fail to open or save workflows
- trace parser and serialization failures
- detect regressions in route loading and saving
- make roadmap decisions from real usage data

## Area 1: Error Monitoring

### Problem

Without centralized error visibility, debugging depends on reproducing issues locally or waiting for manual reports.

### How It Should Work

The app should capture:

- uncaught frontend errors
- route loader failures
- route action failures
- YAML parse failures
- canvas/parser failures

### Required Error Context

Each captured error should include, when available:

- route path
- workflow id
- selected route id
- node type
- action being performed
- visibility mode
- user id or owner id if allowed

### Priority Error Sources

- workflow page loader
- studio save action
- code editor parse path
- metadata fetch failures
- parser graph build failures

## Area 2: Save and Parse Diagnostics

### Problem

When save or parse fails, the team needs to know whether the issue came from:

- invalid form state
- invalid YAML
- serializer bug
- backend persistence failure

### How It Should Work

Diagnostic events should be emitted for:

- parse start
- parse failure
- save start
- save success
- save failure
- reopen validation failure in development or debug mode

### Recommended Event Fields

- workflow id
- content size
- parser stage
- error message
- stack trace if available
- node type involved

## Area 3: Product Metrics

### Problem

Roadmap decisions are weak without usage data.

### Core Metrics

Track at minimum:

- workflow create success rate
- workflow open success rate
- workflow save success rate
- YAML parse failure rate
- average time from create to first save
- template usage rate
- clone usage rate
- restore/version usage rate once implemented

### Why These Matter

- open success rate measures route reliability
- save success rate measures authoring trust
- parse failure rate exposes DSL/editor mismatch
- template usage measures onboarding effectiveness

## Area 4: Operational Dashboards

### Problem

Raw logs are not enough for day-to-day operational clarity.

### How It Should Work

The team should have dashboards for:

- error rate by route
- error rate by workflow action
- save failures over time
- parse failures by EIP or node type
- navigation failures for workflow pages

### Alert Candidates

Alert when:

- workflow open failure rate spikes
- save failure rate spikes
- parser failure for a specific EIP increases
- metadata fetch failures increase

## Area 5: Release Safety

### Problem

Changes to parsers and forms are high-risk, but without operational safety nets regressions are found too late.

### How It Should Work

Before release:

- parser fixtures pass
- route load smoke tests pass
- save/reopen verification passes for key workflows

After release:

- monitor error rates
- compare failure trends to prior baseline

### Recommended Release Checks

- list page opens
- workflow detail opens
- studio opens
- code editor opens
- workflow saves
- workflow reopens correctly

## Area 6: Debuggability for Development

### Problem

The current app benefits from local knowledge of internal state. That does not scale well.

### How It Should Work

Development mode should expose lightweight debugging aids:

- parse error detail panel
- workflow id and selected route context
- optional graph inspection tools
- easier access to serialized YAML preview

### Requirements

- debug tools must not leak into production by default
- logs should be structured enough for comparison

## Engineering Deliverables

### Must Have

- frontend error capture
- route loader/action diagnostics
- parse and save telemetry
- baseline operational dashboard definitions

### Should Have

- alerts for open/save regressions
- parser error grouping by EIP
- development debug panel

### Nice to Have

- release health dashboard
- workflow-level diagnostic timeline

## Recommended Execution Order

1. add error capture around route loading and saving
2. add parse/save diagnostic events
3. define dashboards and baseline metrics
4. add alerts for major regressions
5. improve development debug tooling

## Definition of Success

This area is successful when:

- the team can explain production failures quickly
- regressions are detected early
- roadmap priorities are informed by real behavior data
