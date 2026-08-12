# API Documentation

Generate OpenAPI/Swagger docs from code. Ferrow API agents.

```javascript
const docs = new APIDocumentation();
docs.endpoint('GET /users', { response: UserSchema });
```

Features: OpenAPI 3.0, Swagger UI, Ferrow discovery.
License: MIT
