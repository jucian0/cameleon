# Camel Authoring Planning

## Objective

Make the studio capable of editing real Camel routes without forcing users back into raw YAML for common tasks.

This area focuses on authoring quality:

- dynamic forms
- endpoint modeling
- validation
- code/canvas consistency

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
- configure common EIPs without editing raw JSON
- configure endpoints without assembling fragile strings manually
- receive useful validation before saving

## Area 1: Dynamic Form Architecture

### Problem

A generic metadata renderer can expose fields, but Camel metadata includes structures that are not well represented by plain scalar controls.

Examples:

- expression definitions
- exceptions arrays
- map-like parameter objects
- endpoint parameters
- nested predicate-like objects

### How It Should Work

The form system should be layered:

1. generic metadata renderer
2. type-based renderer selection
3. Camel-specific overrides for high-value fields
4. fallback JSON editor for unsupported complex shapes

### Target Form Architecture

#### Layer 1: Generic Controls

Use for:

- string
- number
- boolean
- enum

#### Layer 2: Structural Controls

Use for:

- expression editor
- primitive arrays
- key/value maps
- nested objects

#### Layer 3: Camel-Specific Controls

Use for:

- endpoint URI builder
- predicate builder
- exception list editor
- language expression editor
- ref/bean/method helper controls

### Functional Requirements

- fields must be grouped by metadata group
- unsupported structural fields must not leak into the generic panel
- field defaults must be visible and predictable
- form state must not mutate unrelated config paths

## Area 2: Expression Editing

### Problem

Camel expressions are core to route authoring, but raw object editing is too low-level for normal use.

### How It Should Work

Expression editing should have:

- a selector for expression language
- a value field matched to the selected language
- optional advanced settings if the expression type supports them

### Minimum Supported Expression Languages

Initial support should target high-usage languages:

- `simple`
- `jsonpath`
- `header`
- `exchangeProperty`
- `constant`
- `xpath`
- `method`
- `ref`

### UX Rules

- default to the first valid language if no value exists
- keep the existing language when editing existing expressions
- do not discard complex expression objects silently
- unsupported expression variants fall back to JSON editor

## Area 3: Arrays and Collections

### Problem

Many Camel fields are collections, but not all collections should be edited the same way.

Examples:

- `exception` arrays
- outputs/steps arrays
- lists of endpoint-related values

### How It Should Work

Collection rendering should be based on meaning, not only type.

#### Primitive Arrays

Use for:

- exception class names
- simple string lists

UI:

- one item per line
- add/remove affordance later if needed

#### Structural Arrays

Use for:

- `steps`
- `outputs`
- nested EIP arrays

Rule:

- do not expose these in the generic side form
- they belong to canvas editing

#### Complex Arrays

Use for:

- arrays of objects not yet modeled in UI

Rule:

- temporary JSON fallback

## Area 4: Object and Map Editing

### Problem

Object fields in Camel metadata vary widely. Some are simple maps; some are full nested definitions.

### How It Should Work

Object rendering should separate:

- flat key/value maps
- known Camel structures
- unknown nested objects

#### Flat Maps

Examples:

- parameter maps
- option bags

UI:

- `key=value` rows

#### Known Structures

Examples:

- expressions
- predicates
- endpoint config

UI:

- custom renderer

#### Unknown Nested Objects

Rule:

- JSON fallback, clearly labeled as advanced editing

## Area 5: Endpoint Modeling

### Problem

Camel components and endpoints are central to authoring, but users do not think in arbitrary component-object shapes. They think in endpoints, URIs, and options.

### How It Should Work

The UI should distinguish:

- EIPs
- consumer endpoints
- producer endpoints

For endpoint-oriented steps, the user should be able to:

- pick a component
- edit path/target parts
- edit query parameters
- preview the generated URI

### Suggested Endpoint Editor Model

Each endpoint editor should expose:

- component name
- path segment or resource target
- common options
- advanced options
- generated URI preview
- raw URI override when necessary

### Requirements

- URI preview must update live
- editing parameters must keep serialization deterministic
- advanced options should be collapsible
- manual URI edits must not silently discard parsed parameters

## Area 6: Validation

### Problem

Without validation, the studio allows incomplete or invalid route state to be saved.

### How It Should Work

Validation should run at three levels:

#### Field-Level Validation

- required field missing
- invalid number
- malformed JSON fallback values
- empty mandatory expression

#### Node-Level Validation

- incomplete endpoint config
- invalid exception list
- invalid branch state

#### Workflow-Level Validation

- structurally broken route
- missing `from`
- invalid YAML serialization

### UX Rules

- blocking errors prevent save
- warnings allow save but explain risk
- validation must indicate which node is affected

### Output Format

Each validation item should include:

- severity
- node id or route id
- field path
- message
- optional remediation hint

## Area 7: Canvas and Code Synchronization

### Problem

Users will move between visual editing and YAML editing. If these modes drift, trust is lost quickly.

### How It Should Work

When editing visually:

- the internal model updates
- code view reflects normalized YAML

When editing in code view:

- the YAML reparses
- the internal model updates
- the canvas rebuilds safely

### Requirements

- failed YAML parse in code view must not destroy the last valid canvas state
- unsaved invalid code should remain local until valid
- switching modes must be deterministic

## Engineering Deliverables

### Must Have

- renderer registry
- dedicated expression editor
- dedicated array and object editors
- endpoint editing strategy
- validation before save

### Should Have

- endpoint URI preview
- specialized editors for common Camel patterns
- advanced mode for raw JSON fallback

### Nice to Have

- inline examples from metadata
- generated docs links for selected field types

## Recommended Execution Order

1. formalize renderer selection rules
2. improve expression editing
3. improve endpoint editing
4. implement validation
5. improve canvas/code synchronization UX

## Definition of Success

This area is successful when:

- most daily editing no longer requires raw YAML
- the side panel feels Camel-aware rather than generic
- users can safely configure real route nodes through the UI
