# Collaboration and Distribution Planning

## Objective

Make workflows shareable, reviewable, and reusable across people and environments without losing control over editing rights or DSL integrity.

## Status

- Overall: `Partially Done`
- Public starter and clone behavior: `Done`
- True team collaboration: `Later`

## Current State

The current product direction is narrower than full collaboration:

- personal workflows
- public starter workflows
- clone and reuse
- import and export

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

## Areas

### 1. Visibility Model

Support an explicit visibility state:

- private
- public

Later, collaborator-specific sharing can be added if needed.

### 2. Read-Only and Editable Modes

In read-only mode:

- canvas is visible
- forms can be inspected but not edited
- code view can be read but not saved
- destructive actions are hidden or disabled

### 3. Sharing Workflow Links

Shared links should resolve to the correct access mode and show a clear unauthorized state when needed.

### 4. Clone Flows

Cloning must:

- create a new workflow id
- copy content safely
- preserve useful metadata where appropriate
- reset ownership and editability correctly

### 5. Import Camel YAML

Users should be able to:

- upload Camel YAML
- paste Camel YAML
- create a workflow from imported YAML

### 6. Export Camel YAML

Users should be able to:

- export the whole workflow as Camel YAML
- copy YAML directly
- trust that the exported result is Camel-compatible

### 7. Public Library Experience

The public library should support:

- browsing public workflows
- searching and previewing them
- opening them in read-only mode
- cloning them into private space

## Engineering Deliverables

### Must Have

- stable visibility model
- read-only public workflow mode
- clone flow
- import/export of Camel YAML

### Should Have

- share link UX
- public library filtering
- better unauthorized and not-found states

## Definition of Success

This area is successful when:

- public and private workflows behave predictably
- users can safely share and clone workflows
- the app fits into a real Camel workflow outside its own UI

## Next

- keep only the starter/public reuse path active unless true multi-user collaboration becomes a product priority again
