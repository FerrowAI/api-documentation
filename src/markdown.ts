import { ApiDocumentation, extractPathParams } from './documentation';

/** Renders an endpoints table plus a per-route section (params, body, responses). */
export function toMarkdown(docs: ApiDocumentation): string {
  const routes = docs.listRoutes();
  const lines: string[] = [];

  lines.push('# API Reference', '');
  lines.push('| Method | Path | Summary |');
  lines.push('| --- | --- | --- |');
  for (const { method, path, def } of routes) {
    lines.push(`| ${method.toUpperCase()} | \`${path}\` | ${def.summary ?? ''} |`);
  }
  lines.push('');

  for (const { method, path, def } of routes) {
    lines.push(`## ${method.toUpperCase()} ${path}`, '');
    if (def.summary) lines.push(def.summary, '');
    if (def.description) lines.push(def.description, '');

    const pathParams = extractPathParams(path);
    if (pathParams.length > 0) {
      lines.push('**Path parameters**', '');
      for (const name of pathParams) {
        const p = def.params?.[name] ?? { type: 'string' };
        lines.push(`- \`${name}\` (${p.type}, required)${p.description ? ` — ${p.description}` : ''}`);
      }
      lines.push('');
    }

    const queryEntries = Object.entries(def.query ?? {});
    if (queryEntries.length > 0) {
      lines.push('**Query parameters**', '');
      for (const [name, q] of queryEntries) {
        lines.push(`- \`${name}\` (${q.type}${q.required ? ', required' : ', optional'})${q.description ? ` — ${q.description}` : ''}`);
      }
      lines.push('');
    }

    if (def.body) {
      lines.push('**Request body**', '', '```json', JSON.stringify(def.body, null, 2), '```', '');
    }

    const responses = def.responses ?? { 200: { description: 'OK' } };
    lines.push('**Responses**', '');
    for (const [code, r] of Object.entries(responses)) {
      lines.push(`- \`${code}\` — ${r.description}`);
    }
    lines.push('');
  }

  return lines.join('\n');
}
