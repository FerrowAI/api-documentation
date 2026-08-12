# api-documentation

An OpenAPI 3.0 generator driven from code-defined routes, not YAML. Call
`define(method, path, {...})` with a tiny schema notation, get back a
structurally valid `openapi.json` plus a markdown reference page.

## What this is
- `ApiDocumentation.define(method, path, routeDef)` — path params (`{id}`)
  are auto-extracted from the path string; `params`/`query`/`body`/
  `responses` are declared with a tiny notation: `'string' | 'number' |
  'boolean'`, `{ type: 'array', items: SchemaNode }`, nested objects as
  plain `{ field: SchemaNode }` with `'field?'` for optional.
- `.toOpenApi()` — emits a spec with `openapi` / `info` / `servers` /
  `paths` / `components` keys, each operation carrying correctly-typed
  `parameters` (`in: 'path'` vs `'query'`), `requestBody`, and `responses`.
- `toMarkdown(docs)` — an endpoints table followed by a per-route section
  (params, request body, responses) rendered from the same route
  definitions — the two outputs can't drift apart.

## What this is NOT
- Not a request router / server framework — it documents routes, it doesn't
  serve them. Call `define()` next to your actual route handlers.
- Not a full JSON Schema implementation — the body/response notation is
  intentionally small (primitives, arrays, nested objects, optional keys).
- Not a Swagger UI server — it emits the JSON; point any OpenAPI viewer at it.

## Quickstart

```bash
npm install
npm run build
node dist/examples/demo.js
```

## API

```ts
import { ApiDocumentation, toMarkdown } from 'api-documentation';

const docs = new ApiDocumentation({ title: 'Users API', version: '1.0.0' }, ['https://api.example.com']);

docs.define('get', '/users/{id}', {
  summary: 'Get a user',
  params: { id: { type: 'number', description: 'user id' } },
  responses: {
    200: { description: 'OK', body: { id: 'number', name: 'string', 'email?': 'string' } },
    404: { description: 'Not found' },
  },
});

const openapi = docs.toOpenApi(); // { openapi: '3.0.0', info, servers, paths, components }
const markdown = toMarkdown(docs);
```

### Demo: 4 routes → openapi.json + markdown

```
$ node dist/examples/demo.js
--- structural checks ---
has openapi key: true 3.0.0
has info key: true
has paths key: true
path count: 2
/users/{id} GET param: {"name":"id","in":"path","required":true,"description":"user id","schema":{"type":"number"}}
...
## GET /users/{id}
**Path parameters**
- `id` (number, required) — user id
**Responses**
- `200` — OK
- `404` — Not found
```

## License
MIT

---
Sponsored by [Ferrow](https://ferrow.ai)

---
Part of the [ferrow-toolkit](https://github.com/FerrowAI/ferrow-toolkit) collection · Sponsored by [Ferrow](https://ferrow.ai)
