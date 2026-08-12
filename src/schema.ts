/** A tiny schema notation used for request/response bodies.
 *  - primitives: 'string' | 'number' | 'boolean'
 *  - arrays: { type: 'array', items: SchemaNode }
 *  - nested objects: a plain object of { field: SchemaNode }; keys ending in '?' are optional
 */
export type SchemaNode = 'string' | 'number' | 'boolean' | ArrayNode | ObjectSchema;

export interface ArrayNode {
  type: 'array';
  items: SchemaNode;
}

export interface ObjectSchema {
  [key: string]: SchemaNode;
}

export interface OpenApiSchema {
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  items?: OpenApiSchema;
  properties?: Record<string, OpenApiSchema>;
  required?: string[];
}

function kindOf(node: SchemaNode): 'primitive' | 'array' | 'object' {
  if (typeof node === 'string') return 'primitive';
  if ((node as { type?: unknown }).type === 'array') return 'array';
  return 'object';
}

/** Converts the tiny schema notation into an OpenAPI 3.0 Schema Object. */
export function toOpenApiSchema(node: SchemaNode): OpenApiSchema {
  const kind = kindOf(node);

  if (kind === 'primitive') {
    return { type: node as 'string' | 'number' | 'boolean' };
  }

  if (kind === 'array') {
    const n = node as ArrayNode;
    return { type: 'array', items: toOpenApiSchema(n.items) };
  }

  const schema = node as ObjectSchema;
  const properties: Record<string, OpenApiSchema> = {};
  const required: string[] = [];
  for (const [rawKey, child] of Object.entries(schema)) {
    const optional = rawKey.endsWith('?');
    const key = optional ? rawKey.slice(0, -1) : rawKey;
    properties[key] = toOpenApiSchema(child);
    if (!optional) required.push(key);
  }
  const result: OpenApiSchema = { type: 'object', properties };
  if (required.length > 0) result.required = required;
  return result;
}
