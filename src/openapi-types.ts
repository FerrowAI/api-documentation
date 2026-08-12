import { OpenApiSchema } from './schema';

export interface OpenApiParameter {
  name: string;
  in: 'path' | 'query';
  required: boolean;
  description?: string;
  schema: OpenApiSchema;
}

export interface OpenApiResponse {
  description: string;
  content?: Record<string, { schema: OpenApiSchema }>;
}

export interface OpenApiOperation {
  summary?: string;
  description?: string;
  parameters?: OpenApiParameter[];
  requestBody?: {
    required: boolean;
    content: Record<string, { schema: OpenApiSchema }>;
  };
  responses: Record<string, OpenApiResponse>;
}

export interface OpenApiDocument {
  openapi: '3.0.0';
  info: { title: string; version: string; description?: string };
  servers: Array<{ url: string }>;
  paths: Record<string, Partial<Record<'get' | 'post' | 'put' | 'patch' | 'delete', OpenApiOperation>>>;
  components: { schemas: Record<string, OpenApiSchema> };
}
