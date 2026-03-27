# Workflow Productivity Planning

## Objective

Reduce the time and effort required to create, understand, and evolve workflows in the studio.

This area is about making the editor useful in day-to-day work, not just technically capable.

## Scope

This document covers:

- onboarding and first-use experience
- starter templates
- reuse mechanisms
- workflow organization
- autosave and version history

## Desired User Outcomes

Users should be able to:

- create a useful route quickly
- avoid repetitive setup work
- recover from mistakes
- find and reuse previous work

## Area 1: Workflow Creation Experience

### Problem

Creating a workflow from an empty state is too expensive for many users, especially those who know Camel conceptually but do not know the editor’s specific conventions.

### How It Should Work

The create flow should offer:

- blank workflow
- template-based workflow
- clone existing workflow

### Recommended Creation Flow

1. user clicks `New Workflow`
2. choose:
   - blank
   - from template
   - clone existing
3. enter:
   - name
   - description
   - visibility
   - optional tags
4. open directly in studio

### Requirements

- template descriptions must be concrete
- the route should open in an editable state immediately
- the user should not need to fix basic structure after creation

## Area 2: Starter Templates

### Problem

Templates are the fastest path to first success and also a way to teach route structure.

### How It Should Work

Templates should be:

- valid Camel workflows
- minimal but realistic
- categorized by use case

### Recommended Template Categories

#### Basics

- timer -> log
- direct -> bean
- file -> log

#### API and Integration

- REST -> bean -> response
- Kafka consumer -> processor -> Kafka producer
- HTTP call -> transform -> response

#### Flow Patterns

- `choice`
- `split`
- `multicast`
- `recipientList`
- `loop`

#### Error Handling

- `doTry/doCatch`
- `circuitBreaker`
- dead-letter style route

### Template Requirements

- each template must open cleanly in canvas and code views
- each template must include minimal metadata
- each template should include a brief explanation of what it demonstrates

## Area 3: Reuse and Composition

### Problem

If users cannot reuse prior work, the editor becomes a repetitive route-building tool instead of a productivity tool.

### How It Should Work

Reuse should exist at three levels:

#### Workflow-Level Reuse

- clone entire workflow
- derive new workflow from existing one

#### Template-Level Reuse

- save workflow as reusable template
- organize templates by team or project

#### Snippet-Level Reuse

- reusable route fragments
- common error-handling blocks
- common endpoint setups

### Requirements

- cloned workflows must get new ids
- reusable fragments must not break the route graph when inserted
- snippet insertion should preserve valid Camel structure

## Area 4: Workflow Library and Discovery

### Problem

As the number of workflows grows, the list page becomes less useful without better filtering and metadata quality.

### How It Should Work

The workflow library should support:

- search by name
- filter by visibility
- filter by tag
- sort by recent activity
- sort by name
- filter by owner in collaborative environments

### Metadata to Support

- name
- description
- tags
- owner
- visibility
- updated date
- template origin

### UX Requirements

- list and card views should remain useful
- search should be fast and forgiving
- empty states should suggest next actions

## Area 5: Autosave

### Problem

Workflow editing is high-friction if users worry about losing work.

### How It Should Work

Autosave should:

- trigger after meaningful changes
- debounce updates
- clearly show save state

### Recommended Save States

- unsaved changes
- saving
- saved
- save failed

### Requirements

- autosave must not spam the backend
- failed autosave must preserve local state
- users must still be able to perform explicit saves when needed

## Area 6: Version History and Recovery

### Problem

Users need a way to inspect and restore earlier states after mistakes or failed experiments.

### How It Should Work

Each workflow should keep version history for content changes.

Users should be able to:

- view recent versions
- compare versions
- restore an older version into the current draft

### Version Model

At minimum, each version should capture:

- workflow id
- saved content
- timestamp
- optional description or message
- status such as draft/published if introduced

### UX Requirements

- restoring a version must be explicit
- previewing a version should not overwrite current work automatically
- version history should be accessible from studio and list page

## Area 7: Time-to-First-Success

### Problem

A product can be technically good but still fail if users do not reach a meaningful result quickly.

### How It Should Work

A first-time user should be able to:

1. create from a template
2. change 1 or 2 fields
3. save successfully
4. reopen the workflow

### Success Benchmark

The team should target:

- a new user can produce a valid starter workflow in minutes, not tens of minutes

## Engineering Deliverables

### Must Have

- template catalog
- clone workflow
- better workflow metadata
- autosave state handling
- version history foundation

### Should Have

- snippet insertion
- template explanations
- restore flow

### Nice to Have

- favorite templates
- recent workflows
- quick-start onboarding tours

## Recommended Execution Order

1. improve workflow creation flow
2. ship starter templates
3. add autosave
4. add version history
5. improve library filters and reuse tools

## Definition of Success

This area is successful when:

- users can get started quickly
- repeated tasks become faster over time
- workflow editing feels safe and recoverable
