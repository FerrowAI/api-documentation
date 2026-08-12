import { SchemaNode, toOpenApiSchema } from './schema';
import { OpenApiDocument, OpenApiOperation, OpenApiParameter, OpenApiResponse } from './openapi-types';

export type HttpMethod = 'get' | 'post' | 'put' | 'patch' | 'delete';

export interface ParamDef {
  type: 'string' | 'number' | 'boolean';
  description?: string;
  /** query params only; path params are always required */
  required?: boolean;
}

export interface ResponseDef {
  description: string;
  body?: SchemaNode;
}

export interface RouteDef {
  summary?: string;
  description?: string;
  /** overrides/descriptions for path params auto-extracted from the path, e.g. { id: { type: 'number' } } */
  params?: Record<string, ParamDef>;
  query?: Record<string, ParamDef>;
  body?: SchemaNode;
  responses?: Record<number, ResponseDef>;
}

interface Route {
  method: HttpMethod;
  path: string;
  def: RouteDef;
}

export interface ApiInfo {
  title: string;
  version: string;
  description?: string;
}

/** Extracts path parameter names from a route pattern like "/users/{id}/posts/{postId}". */
export function extractPathParams(path: string): string[] {
  const matches = path.match(/\{([^}]+)\}/g) ?? [];
  return matches.map((m) => m.slice(1, -1));
}

export class ApiDocumentation {
  private routes: Route[] = [];

  constructor(
    private readonly info: ApiInfo,
    private readonly servers: string[] = []
  ) {}

  define(method: HttpMethod, path: string, def: RouteDef = {}): void {
    this.routes.push({ method, path, def });
  }

  private buildOperation(path: string, def: RouteDef): OpenApiOperation {
    const parameters: OpenApiParameter[] = [];

    for (const name of extractPathParams(path)) {
      const paramDef = def.params?.[name] ?? { type: 'string' };
      parameters.push({
        name,
        in: 'path',
        required: true,
        description: paramDef.description,
        schema: { type: paramDef.type },
      });
    }

    for (const [name, paramDef] of Object.entries(def.query ?? {})) {
      parameters.push({
        name,
        in: 'query',
        required: paramDef.required ?? false,
        description: paramDef.description,
        schema: { type: paramDef.type },
      });
    }

    const operation: OpenApiOperation = {
      summary: def.summary,
      description: def.description,
      responses: {},
    };
    if (parameters.length > 0) operation.parameters = parameters;

    if (def.body) {
      operation.requestBody = {
        required: true,
        content: { 'application/json': { schema: toOpenApiSchema(def.body) } },
      };
    }

    const responseEntries = def.responses ?? { 200: { description: 'OK' } };
    for (const [code, responseDef] of Object.entries(responseEntries)) {
      const response: OpenApiResponse = { description: responseDef.description };
      if (responseDef.body) {
        response.content = { 'application/json': { schema: toOpenApiSchema(responseDef.body) } };
      }
      operation.responses[code] = response;
    }

    return operation;
  }

  toOpenApi(): OpenApiDocument {
    const doc: OpenApiDocument = {
      openapi: '3.0.0',
      info: this.info,
      servers: this.servers.map((url) => ({ url })),
      paths: {},
      components: { schemas: {} },
    };

    for (const { method, path, def } of this.routes) {
      if (!doc.paths[path]) doc.paths[path] = {};
      doc.paths[path][method] = this.buildOperation(path, def);
    }

    return doc;
  }

  /** @internal exposed for the markdown renderer */
  listRoutes(): Route[] {
    return this.routes;
  }
}
