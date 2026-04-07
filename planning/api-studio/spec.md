# Rest Studio Planning

## Objective

Add a new product surface to Cameleon for designing REST APIs with the same quality bar as Camel Studio, while keeping its domain model separate from Camel route authoring.

## Status

- Overall: `Defined`
- Product spec: `Evolving`
- Foundation and visual studio: `In Progress`
- Next major step: deepen authoring and contract fidelity

## Current State

Already in place:

1. API list and create flow
2. visual Rest Studio canvas
3. JSON/YAML code editor tied to the internal model
4. autosave
5. OpenAPI/Swagger import into the internal `ApiSpec`
6. code view as a modal route over the studio

## Next

The next implementation priorities are:

1. improve `Add operation` so method choice is explicit instead of implied
2. deepen `request body` and `response` authoring in the sheet
3. improve workflow linkage from operations to Camel workflows
4. add version history for REST APIs
5. add templates and “save as template” for REST APIs
6. improve import fidelity for OpenAPI/Swagger details that are still being simplified

## Product Direction

The intended direction is:

**A Rest-first design workspace for resources and operations, with optional handoff into Camel workflows.**

This feature should optimize for:

- API structure clarity
- safe editing
- reuse through templates
- future integration with the existing workflow product

## Boundaries

Rest Studio should own:

- API resources
- REST operations
- parameters
- request and response bodies
- status codes
- security declarations at design level
- examples and descriptions
- API templates
- OpenAPI-style output

It should not initially own:

- runtime execution of APIs
- API gateway concerns
- deployment pipelines
- traffic analytics

## Why It Should Be Separate From Camel Studio

Camel Studio is graph-oriented:

- routes
- steps
- branches
- endpoint chains

Rest Studio is resource-oriented:

- paths
- methods
- request contracts
- responses

It should share product patterns with Camel Studio, but not reuse the same authoring model.

## User Stories

Users should be able to:

1. create a new API from scratch or from a template
2. define resources such as `/orders` and `/orders/{id}`
3. add operations such as `GET`, `POST`, `PUT`, and `DELETE`
4. define summaries, descriptions, parameters, request bodies, and responses
5. inspect generated OpenAPI safely
6. save versions and reopen APIs without corruption
7. optionally map an operation to a Camel workflow

## Information Architecture

Suggested app surfaces:

- `/app/apis`
- `/app/apis/create`
- `/app/apis/:api`
- `/app/apis/:api/studio`
- `/app/apis/:api/studio/code`
- `/app/apis/:api/history`
- `/app/apis/:api/template`

Related library surfaces:

- `/app/api-library/templates`
- `/app/api-library/examples`

## Data Model

Suggested tables:

- `apis`
- `api_versions`
- `api_templates`

The primary API record should store canonical content in base64, following the same persistence pattern already used for workflows.

## Canonical API Model

Suggested internal top-level shape:

```ts
type ApiSpec = {
  info: {
    title: string;
    version: string;
    description?: string;
  };
  servers?: Array<{
    url: string;
    description?: string;
  }>;
  resources: ApiResource[];
  components?: {
    schemas?: Record<string, ApiSchema>;
    securitySchemes?: Record<string, ApiSecurityScheme>;
  };
};
```

The model should be:

- editor-friendly
- easy to validate
- easy to serialize
- easy to convert into OpenAPI later

## Authoring Model

The current direction is a structural canvas, not a flow canvas.

Recommended layout:

1. full-size REST canvas
2. contextual actions on the canvas shell
3. authoring sheet for API, resource, operation, and contract editing
4. code modal route for JSON/YAML source editing

This keeps parity with Camel Studio in product quality while still using the right structural metaphor for REST.

## Feature Areas

### 1. API List and Create Flow

- blank API
- start from template
- clone existing API
- later: import OpenAPI YAML or JSON

### 2. Resource and Operation Authoring

- resources with path editing
- operations with HTTP methods
- summaries and descriptions
- parameter editing
- request body editing
- response editing
- status code editing
- operation creation with explicit method selection
- better inline actions from the canvas

### 3. Schema Authoring

Initial support should focus on:

- object schemas
- primitives
- arrays
- enums
- required fields
- references to shared schemas

### 4. Code View and Round-Trip

Current strategy:

- editable internal source view in `JSON` and `YAML`
- safe parse with last valid state preserved on error
- download/export from the canvas

Still missing:

- clearer distinction between internal `ApiSpec` source and generated OpenAPI output
- stronger round-trip fidelity for large imported specs

### 5. Templates

Suggested defaults:

- CRUD resource
- health/status API
- paginated collection
- webhook receiver
- file upload endpoint
- authenticated API

### 6. Versioning and Draft Safety

- autosave updates `apis.content`
- manual `New version` creates `api_versions`
- restore creates a new version snapshot

Current note:

- autosave foundation exists
- version history UI and persistence still need to be added for Rest Studio

### 7. Integration With Camel Workflows

Phase 1:

- operation can reference a workflow
- API Studio shows whether an operation is linked

Phase 2:

- create workflow from operation
- generate REST starter workflow from API operation

## Suggested Technical Architecture

Frontend modules:

- `app/rest-studio/*`
- `app/api-components/*`
- `app/api-templates/*`

Core modules:

- `core/src/lib/rest/types.ts`
- `core/src/lib/rest/templates.ts`
- `core/src/lib/rest/operations.ts`
- `core/src/lib/rest/store.ts`
- `core/src/lib/rest/canvas.ts`
- `core/src/lib/rest/api-spec.ts`

## Phased Delivery

### Phase 1

- API list
- create flow
- blank API model
- visual Rest Studio
- save and reopen

### Phase 2

- templates
- save as template
- version history
- better request and response editing

### Phase 3

- reusable schemas
- examples
- richer import fidelity
- workflow linkage improvements

### Phase 4

- Camel workflow linkage

### Phase 5

- generated OpenAPI view
- export
- later safe import/edit round-trip

## Definition of Success

This feature is successful when a user can:

1. create an API from scratch or template
2. define resources and HTTP operations safely
3. define request and response contracts without raw JSON pain
4. save and reopen without losing structure
5. create explicit versions
6. optionally link an API operation to a Camel workflow
7. export or inspect a stable API artifact
