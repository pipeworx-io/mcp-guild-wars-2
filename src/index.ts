interface McpToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
}

interface McpToolExport {
  tools: McpToolDefinition[];
  callTool: (name: string, args: Record<string, unknown>) => Promise<unknown>;
  meter?: { credits: number };
  cost?: Record<string, unknown>;
  provider?: string;
}

/**
 * Guild Wars 2 MCP.
 */


const BASE = 'https://api.guildwars2.com/v2';
const UA = 'pipeworx-mcp-guild-wars-2/1.0 (+https://pipeworx.io)';

const tools: McpToolExport['tools'] = [
  { name: 'worlds', description: 'World list.', inputSchema: { type: 'object', properties: { ids: { type: 'string', description: 'Comma-sep ids; omit for index.' } } } },
  {
    name: 'items',
    description: 'Item lookup.',
    inputSchema: { type: 'object', properties: { ids: { type: 'string' }, page: { type: 'number' }, page_size: { type: 'number' }, lang: { type: 'string' } } },
  },
  {
    name: 'achievements',
    description: 'Achievements.',
    inputSchema: { type: 'object', properties: { ids: { type: 'string' }, page: { type: 'number' }, page_size: { type: 'number' }, lang: { type: 'string' } } },
  },
  { name: 'professions', description: 'Professions.', inputSchema: { type: 'object', properties: { ids: { type: 'string' }, lang: { type: 'string' } } } },
  { name: 'currencies', description: 'Currencies.', inputSchema: { type: 'object', properties: { ids: { type: 'string' }, lang: { type: 'string' } } } },
  { name: 'build', description: 'Current build id.', inputSchema: { type: 'object', properties: {} } },
  { name: 'quaggans', description: 'Quaggan images.', inputSchema: { type: 'object', properties: {} } },
  { name: 'wvw_matches', description: 'Current WvW matches.', inputSchema: { type: 'object', properties: { world: { type: 'number' } } } },
  { name: 'commerce_prices', description: 'Trading-post prices.', inputSchema: { type: 'object', properties: { ids: { type: 'string' } } } },
  { name: 'commerce_listings', description: 'Trading-post listings.', inputSchema: { type: 'object', properties: { ids: { type: 'string' } } } },
];

async function callTool(name: string, args: Record<string, unknown>): Promise<unknown> {
  const get = async (path: string, params?: URLSearchParams) => {
    const url = `${BASE}${path}${params && [...params].length ? `?${params}` : ''}`;
    const res = await fetch(url, { headers: { Accept: 'application/json', 'User-Agent': UA } });
    if (!res.ok) throw new Error(`GW2: ${res.status}`);
    return res.json();
  };
  const buildParams = (keys: string[]) => {
    const p = new URLSearchParams();
    for (const k of keys) {
      const v = args[k];
      if (v == null) continue;
      p.set(k, String(v));
    }
    return p;
  };
  switch (name) {
    case 'worlds':
      return get('/worlds', buildParams(['ids']));
    case 'items':
      return get('/items', buildParams(['ids', 'page', 'page_size', 'lang']));
    case 'achievements':
      return get('/achievements', buildParams(['ids', 'page', 'page_size', 'lang']));
    case 'professions':
      return get('/professions', buildParams(['ids', 'lang']));
    case 'currencies':
      return get('/currencies', buildParams(['ids', 'lang']));
    case 'build':
      return get('/build');
    case 'quaggans':
      return get('/quaggans');
    case 'wvw_matches':
      return get('/wvw/matches', buildParams(['world']));
    case 'commerce_prices':
      return get('/commerce/prices', buildParams(['ids']));
    case 'commerce_listings':
      return get('/commerce/listings', buildParams(['ids']));
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

export default { tools, callTool, meter: { credits: 1 } } satisfies McpToolExport;
