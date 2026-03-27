# Collaboration and Distribution Planning

## Objective

Make workflows shareable, reviewable, and reusable across people and environments without losing control over editing rights or DSL integrity.

## Scope

This document covers:

- visibility and access modes
- sharing behavior
- import and export
- public and clone flows

## Desired User Outcomes

Users should be able to:

- share a workflow safely
- open workflows in read-only or editable modes as appropriate
- clone public workflows
- import Camel YAML from outside the app
- export Camel YAML for use outside the app

## Area 1: Visibility Model

### Problem

If visibility and edit permissions are unclear, collaboration becomes risky and users lose confidence in sharing.

### How It Should Work

A workflow should have an explicit visibility state:

- private
- public

Optionally later:

- shared with specific collaborators

### Access Rules

#### Private

- visible only to owner or authorized users
- fully editable by authorized users

#### Public

- visible to anyone with access to the public library
- read-only by default
- cloneable into a private editable copy

### UX Requirements

- visibility must be visible on list cards and workflow page
- edit restrictions must be clear before the user attempts an edit
- public workflows should communicate clone-first behavior

## Area 2: Read-Only and Editable Modes

### Problem

The app currently needs a clearer distinction between viewing and editing workflows based on permissions and visibility.

### How It Should Work

Modes:

- editable mode
- read-only mode

In read-only mode:

- the canvas is visible
- forms can be inspected but not edited
- code view can be read but not saved
- destructive actions are hidden or disabled

### Functional Requirements

- the mode must be derived from real access state, not only UI flags
- disabled actions must explain why they are disabled
- clone should be available from read-only public workflows

## Area 3: Sharing Workflow Links

### Problem

Sharing needs to be practical and predictable.

### How It Should Work

Users should be able to share:

- a workflow page link
- optionally a studio/code subview link
- optionally a specific route selection in the future

### Requirements

- shared links must resolve to the correct access mode
- unauthorized users must see a clear response
- sharing should not rely on hidden internal ids exposed without context

## Area 4: Clone Flows

### Problem

Public workflows are only useful if users can derive new work from them safely.

### How It Should Work

Cloning should:

- create a new workflow id
- copy content
- preserve useful metadata where appropriate
- reset ownership and editability correctly

### Requirements

- cloning a public workflow must never mutate the original
- the cloned workflow should open directly in editable mode
- the clone flow should allow naming before or after creation

## Area 5: Import Camel YAML

### Problem

A Camel studio is much more useful if existing routes can be brought into it.

### How It Should Work

Users should be able to:

- upload a Camel YAML file
- paste Camel YAML
- create a workflow from imported YAML

### Functional Requirements

- import must validate that the YAML is parseable
- unsupported structures must produce explicit messages
- imported content must become a normal workflow in the app

### Failure Handling

If import fails, the user should see:

- parse error
- unsupported structure warning
- line/context if available

## Area 6: Export Camel YAML

### Problem

The workflow must be useful outside the app.

### How It Should Work

Users should be able to:

- export the whole workflow as Camel YAML
- copy YAML directly
- trust that the exported result is Camel-compatible

### Functional Requirements

- export must use Camel YAML root format
- internal metadata must not leak
- comments should be preserved when technically possible

## Area 7: Public Library Experience

### Problem

Once public workflows exist, users need a clean browse-and-clone experience.

### How It Should Work

The public library should support:

- browsing public workflows
- searching by name or tags
- previewing summary info
- opening in read-only mode
- cloning into private space

### Requirements

- public items should be visually distinct from private items
- actions should reflect access mode clearly

## Engineering Deliverables

### Must Have

- stable visibility model
- read-only public workflow mode
- clone flow
- import/export of Camel YAML

### Should Have

- share link UX
- public library filtering
- better unauthorized/not-found states

### Nice to Have

- collaborator-specific sharing
- comment/review workflows

## Recommended Execution Order

1. finish visibility and editable/read-only behavior
2. implement clone flow solidly
3. add import/export UX
4. improve public library browsing
5. expand sharing options

## Definition of Success

This area is successful when:

- public and private workflows behave predictably
- users can safely share and clone workflows
- the app fits into a real Camel workflow outside its own UI
