import { ApiDocumentation, toMarkdown } from '../src/index';

const docs = new ApiDocumentation(
  { title: 'Users API', version: '1.0.0', description: 'A tiny demo API' },
  ['https://api.example.com']
);

docs.define('get', '/users', {
  summary: 'List users',
  query: { page: { type: 'number', required: false, description: 'page number' } },
  responses: {
    200: { description: 'OK', body: { type: 'array', items: { id: 'number', name: 'string' } } },
  },
});

docs.define('get', '/users/{id}', {
  summary: 'Get a user',
  params: { id: { type: 'number', description: 'user id' } },
  responses: {
    200: { description: 'OK', body: { id: 'number', name: 'string', 'email?': 'string' } },
    404: { description: 'Not found' },
  },
});

docs.define('post', '/users', {
  summary: 'Create a user',
  body: { name: 'string', email: 'string' },
  responses: {
    201: { description: 'Created', body: { id: 'number', name: 'string', email: 'string' } },
  },
});

docs.define('delete', '/users/{id}', {
  summary: 'Delete a user',
  params: { id: { type: 'number' } },
  responses: {
    204: { description: 'Deleted' },
    404: { description: 'Not found' },
  },
});

const openapi = docs.toOpenApi();

console.log('--- structural checks ---');
console.log('has openapi key:', 'openapi' in openapi, openapi.openapi);
console.log('has info key:', 'info' in openapi);
console.log('has paths key:', 'paths' in openapi);
console.log('path count:', Object.keys(openapi.paths).length);
console.log(
  '/users/{id} GET param:',
  JSON.stringify(openapi.paths['/users/{id}'].get?.parameters?.[0])
);

console.log('\n--- openapi.json (excerpt) ---');
console.log(JSON.stringify(openapi, null, 2).slice(0, 600) + '\n...');

console.log('\n--- markdown ---');
console.log(toMarkdown(docs));
