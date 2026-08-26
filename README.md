# @pipeworx/guild-wars-2

[Guild Wars 2 API v2](https://wiki.guildwars2.com/wiki/API:Main) MCP — keyless public endpoints (worlds, items, achievements, build, etc.).

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 1476+ live data sources.

## Tools

- `worlds(ids?)` — world list
- `items(ids?, page?, page_size?, lang?)` — item lookup
- `achievements(ids?, page?, page_size?, lang?)` — achievements
- `professions(ids?, lang?)` — professions
- `currencies(ids?, lang?)` — currencies
- `build()` — current game build id
- `quaggans()` — Quaggan images (gag endpoint)
- `wvw_matches(world?)` — current WvW matches
- `commerce_prices(ids?)` — bulk trading-post quotes for numeric item IDs (raw copper)
- `commerce_listings(ids?)` — trading-post order-book depth for numeric item IDs
- `guild_wars_2_item_price(name?, item_id?, include_listings?)` — live Trading Post price for a
  single item **looked up by name** ("Mystic Coin") or by `item_id`. Returns highest buy order,
  lowest sell offer, quantity on each side and the spread, each as raw copper **and** a readable
  gold/silver/copper string, plus item name, rarity, type and icon.

Pass `ids` as a comma-sep string ("1,2,3"); omit for index.

## Money

Trading Post `unit_price` values are in **copper**. 100 copper = 1 silver, 100 silver = 1 gold, so
`19944` copper renders as `1g 99s 44c`. `guild_wars_2_item_price` returns both forms.

## Item name → ID resolution

The official API has **no item-name search**: `/v2/items/search` returns 404, and `/v2/items` with
no `ids` returns ~70k bare IDs — far too heavy to scan per call. So `guild_wars_2_item_price`
resolves a name in three steps:

1. A **curated name → ID map** built into the pack (83 commonly traded items — Mystic Coin, Glob of
   Ectoplasm, T5/T6 fine materials, ores, ingots, wood, leather, cloth, ascended crafting mats,
   popular runes/sigils, charms/symbols, precursors, agony infusions). Case-insensitive, no extra
   request. Every ID in it was verified against `/v2/items` and confirmed to carry a live Trading
   Post quote.
2. **Fallback:** `api.datawars2.ie` — a keyless third-party GW2 item index. This is an added
   dependency outside ArenaNet's control; its name filter is exact and case-sensitive, so the pack
   retries with title-cased variants, and the call is bounded by an 8s timeout.
3. If neither resolves, the tool returns `{found:false, reason:'item_name_not_resolved', hint}`
   telling the caller to pass `item_id` — it never guesses a different item.

Account-bound items (Pile of Bloodstone Dust, Charged Quartz Crystal, Mystic Forge Stone, …) have
no Trading Post quote and return `{found:false, reason:'item_not_traded'}`.

## Data source

`https://api.guildwars2.com/v2` — plus `https://api.datawars2.ie` for item-name fallback only.

## Quick Start

Add to your MCP client (Claude Desktop, Cursor, Windsurf, etc.):

```json
{
  "mcpServers": {
    "guild-wars-2": {
      "url": "https://gateway.pipeworx.io/guild-wars-2/mcp"
    }
  }
}
```

### What this endpoint actually serves

`tools/list` at `https://gateway.pipeworx.io/guild-wars-2/mcp` returns the tools in the table
above **plus the shared Pipeworx meta-tools** — `ask_pipeworx`,
`discover_tools`, `search_within`, `remember`/`recall` and the rest of the
gateway-wide set. So the tool count you see is larger than this table: a
single-pack endpoint currently lists roughly 30 shared tools alongside the
pack's own. The connection's `initialize` response states its exact scope, and
is the authoritative answer for a given day.

This is deliberate, not multiplexing by accident. The meta-tools are what let a
scoped connection answer a question this pack does not cover — via
`ask_pipeworx`, which routes across the whole catalog — without you adding a
second MCP server. There is currently no way to mount a pack endpoint without
them; if the extra schemas cost you more context than the routing is worth,
connect to the full gateway once rather than to several pack endpoints.

Or connect to the full Pipeworx gateway to get every pack's tools listed
directly, instead of just this one's:

```json
{
  "mcpServers": {
    "pipeworx": {
      "url": "https://gateway.pipeworx.io/mcp"
    }
  }
}
```

Both URLs reach the same gateway and the same 1476+ data sources. The
only difference is which pack's tools are listed **directly**; `ask_pipeworx`
reaches all of them from either one.

## Using with ask_pipeworx

Instead of calling tools directly, you can ask questions in plain English —
this works on the pack endpoint above as well as on the full gateway:

```
ask_pipeworx({ question: "your question about Guild Wars 2 data" })
```

The gateway picks the right tool and fills the arguments automatically.

## More

- [Docs and guides](https://pipeworx.io/docs)
- [pipeworx.io](https://pipeworx.io)

## License

MIT
