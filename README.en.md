# dsh-mcp-skills-board

[中文](README.md)

Manage MCP servers and skills in DeepSeek Harness. The page follows the layout of Codex's MCP settings: a search box, Skills and MCP servers tabs, status lights, one switch per row, expandable details, and an Add server form built from the `[mcp_servers.*]` fields.

![Skills tab](assets/screenshot-skills-view.png)

Screenshots use sample data.

## Entries

- Sidebar, "MCP & Skills".
- Plugins, Installed, dsh-mcp-skills-board, the config section on its page.

![Plugin page config](assets/screenshot-plugin-view.png)

## Features

| Area | What it does |
| --- | --- |
| Skills | Scans `.dsh/skills`, `.agents/skills` and custom roots, groups rows by source root with the current project first. Each skill switches between enabled, manual only, model only and off |
| Preset skills | Skills provided by agent presets are listed read only, because their files live in the installed bundle |
| MCP servers | Lists every composed `@deepseek-ai/dsh-mcp-client` row with a status light, tool count and tool names. Each row has an enable switch |
| Add and edit | stdio takes a command, args, env and working directory. Streamable HTTP takes a URL and headers. Tool timeout and enable on create are also here |
| Remove | Only servers added from this page, confirmed with a second click |

A skill switch rewrites the two `SKILL.md` frontmatter keys, and the filesystem provider republishes the catalog on the next step. MCP edits are written to the profile patch file, and a `patchReload: live` profile applies them in place.

## Install

Requires DSH `>= 0.2.0-rc.2 < 0.3.0`. The range is in `peerDependencies`, so the plugin manager's compatibility check rejects a mismatch.

```bash
dsh plugin --profile desktop add dsh-mcp-skills-board
```

You can also use Plugins, Add plugin, and enter the package name.

For local development:

```bash
dsh plugin --profile desktop add link:/absolute/path/to/dsh-mcp-skills-board
```

Refresh the Web page once after installing. After that no restart is needed.

Uninstall:

```bash
dsh plugin --profile desktop remove dsh-mcp-skills-board
```

## Where data lives

- `$DSH_HOME/mcp-skills.json`, default `~/.dsh/mcp-skills.json`, mode 0600. Server definitions added from this page.
- A fenced block in `$DSH_HOME/profiles/<profile>/cordis.patch.yml`:

```yaml
# >>> dsh-mcp-skills-board (managed — edit MCP servers from Settings → MCP & Skills)
- insert:
    - id: "mcp-github"
      name: "@deepseek-ai/dsh-mcp-client"
      config:
        serverName: "github"
        transport: "stdio"
        command: "npx"
        args:
          - "-y"
          - "@modelcontextprotocol/server-github"
        env:
          GITHUB_TOKEN: "..."
        toolCallTimeoutMs: 60000
        failOnStartupError: false
      disabled: false
# <<< dsh-mcp-skills-board
```

Everything outside the block stays as it was. MCP rows declared elsewhere are not rewritten. Toggling one only appends an id targeted `disabled:` override.

## Compared with Codex

| Codex | This plugin |
| --- | --- |
| `[mcp_servers.*]` in `config.toml` | `mcp-skills.json` plus the generated patch block |
| Settings, MCP servers | MCP servers tab |
| Add server form | Add server form |
| `/mcp` | Row status light, tool count, details |
| `enabled = false` | Row switch, definition kept |
| `startup_timeout_sec`, `tool_timeout_sec` | `toolCallTimeoutMs`. The startup timeout belongs to the MCP SDK |
| `bearer_token_env_var`, `env_http_headers` | Not supported. Env and headers are written to the patch file in plain text, mode 0600 |
| `codex mcp login` | Not supported. DSH's MCP client has no OAuth |
| `[[skills.config]] enabled = false` | Four state selector that rewrites the two frontmatter keys |
| Skill locations | Disk scan roots plus preset scopes. Preset skills are read only |

## Limits

- No OAuth login. Servers that require it are rejected by DSH's MCP bridge, and the error appears in the row details.
- Secrets are stored in plain text in `cordis.patch.yml`, mode 0600. To avoid that, export the variable in your shell and edit the row to `!!js process.env.X`. The page then treats it as an external row and only toggles it.
- Preset skills are read only.
- On a profile without `patchReload: live`, changes take effect on the next launch. The page says so.
- Removal only applies to servers added from this page.

## Structure

```
package.json          # dsh.bundle.patch, dsh.client.platform, icon and exports
cordis.patch.yml      # inserts the id=mcp-skills row
lib/index.js          # host: state and action routes, skill scan, frontmatter writes, patch block
lib/client.js         # browser: sidebar panel and plugin page config section
locale/zh.json        # plugin page metadata, meta.title and meta.description
locale/en.json        # English fallback
assets/icon.svg       # plugin list and detail icon
test/                 # host integration tests
```

The plugin page title and description come from `readPluginMeta`. It reads the exported
`locale/en.json` and the `<lang>.json` files next to it, and falls back to `package.json` for
missing fields. The icon comes from the `icon` field in the manifest. Those subpaths must be
listed in `exports`, otherwise Node cannot resolve them.

## Development

```bash
npm test
```

Covers the state and action routes, server add, edit and remove, enable and disable, skill policy writes, and the auth fence.

## License

MIT. The sidebar glyph reuses the path data of `IconSkillOutlineRegular` from
`@deepseek-ai/dsh-client-ui-primitives` (MIT), so it matches DSH's icon weight.
