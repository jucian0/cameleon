# Camel Authoring Planning

## Objective

Make the studio capable of editing real Camel routes without forcing users back into raw YAML for common tasks.

## Status

- Overall: `Mostly Done`
- Foundation and major renderers: `Done`
- Long-tail Camel-specific refinements: `Next`

## Current State

Already established:

- renderer registry
- grouped metadata-driven forms
- endpoint-aware editing
- inline validation
- structural branch rules for sensitive operators

## Scope

This document covers:

- metadata-driven form design
- Camel-specific field renderers
- endpoint and component configuration
- validation before save
- editor interaction rules

## Desired User Outcomes

Users should be able to:

- click a node and understand its editable properties
- configure common EIPs without raw JSON
- configure endpoints without assembling fragile strings manually
- receive useful validation before saving

## Areas

### 1. Dynamic Form Architecture

Layer the form system into:

1. generic controls
2. structural controls
3. Camel-specific controls
4. fallback JSON editor

### 2. Expression Editing

Prioritize common languages:

- `simple`
- `jsonpath`
- `header`
- `exchangeProperty`
- `constant`
- `xpath`
- `method`
- `ref`

### 3. Arrays and Collections

Differentiate:

- primitive arrays
- structural arrays like `steps` and `outputs`
- complex arrays that need advanced fallback editing

### 4. Object and Map Editing

Separate:

- flat key/value maps
- known Camel structures
- unknown nested objects

### 5. Endpoint Modeling

Support:

- component selection
- path or target editing
- query parameter editing
- URI preview
- raw URI override when necessary

### 6. Validation

Validation should exist at:

- field level
- node level
- workflow level

Blocking errors prevent save. Warnings explain risk without blocking.

### 7. Canvas and Code Synchronization

- visual editing should produce normalized YAML
- code editing should rebuild the internal model safely
- invalid YAML in code view must not destroy the last valid canvas state

## Engineering Deliverables

### Must Have

- renderer registry
- dedicated expression editor
- array and object editors
- endpoint editing strategy
- validation before save

### Should Have

- URI preview
- specialized renderers for common Camel patterns
- advanced fallback mode

## Definition of Success

This area is successful when:

- most daily editing no longer requires raw YAML
- the side panel feels Camel-aware rather than generic
- users can safely configure real route nodes through the UI

## Next

- extend specialized renderers only where common Camel patterns still fall back too early
- keep avoiding generic UI where a structural Camel-specific control is clearer
