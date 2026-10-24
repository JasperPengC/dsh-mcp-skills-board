<div align="center">

<img src="assets/icon.svg" width="76" height="76" alt="dsh-mcp-skills-board">

# dsh-mcp-skills-board

<p><b>DeepSeek Harness 的 MCP 服务器与技能管理面板</b></p>

[![npm](https://img.shields.io/npm/v/dsh-mcp-skills-board?color=4f7cff&label=npm)](https://www.npmjs.com/package/dsh-mcp-skills-board)
[![license](https://img.shields.io/badge/license-MIT-4f7cff)](LICENSE)
[![dsh](https://img.shields.io/badge/dsh-%3E%3D0.2.0--rc.2%20%3C0.3.0-4f7cff)](#安装)
[English](README.en.md)

</div>

侧栏一个入口、插件页一个配置区。MCP 服务器的状态与启停、技能的四态切换与新建编辑，都在界面里完成。

![技能管理](assets/screenshot-skills.png)

## 功能

| 模块 | 能力 |
| --- | --- |
| MCP | 列出组合里所有 `@deepseek-ai/dsh-mcp-client` 行，状态灯、工具数、工具名，逐行启停；支持 stdio 与 streamable-http 的添加、编辑、删除 |
| 技能 | 扫描 `.dsh/skills`、`.agents/skills` 和自定义根，按来源目录分组、当前项目置顶；每个技能四态切换，并支持重命名/移动、复制、删除 |
| 新建/编辑 | 表单填写名称、描述、何时使用、正文，选择调用方式与创建位置；内置文件夹选择器，可直接跳转、进入子目录 |
| 导入/导出 | 读取 Codex 的 `config.toml`、Claude/Cursor 的 `mcpServers` JSON，或本插件导出的 JSON；导出可复制、可下载 |
| 模板 | 添加服务器时可选 filesystem、github、fetch、git、sqlite、brave-search，自动填好命令与参数 |
| 密钥 | env / headers 支持 `@env:变量名`，生成 `!!js process.env.变量名`，密钥不写进 patch 文件 |
| 预设 | Agent 预设自带的技能以只读方式列出，因为它们位于安装包内 |
| 边界 | 只改写本插件管理的配置块和技能根内的文件；MCP 删除仅针对本页添加的服务器，需二次确认 |

## 界面

![MCP 服务器](assets/screenshot-mcp.png)

| 新建技能 | 文件夹选择 |
| --- | --- |
| ![新建技能](assets/screenshot-skill-create.png) | ![文件夹选择](assets/screenshot-folder-picker.png) |

![技能详情](assets/screenshot-skill-detail.png)

界面组件全部自绘：按钮、输入框、下拉选择、开关、弹窗与提示条都跟随 DSH 主题，不依赖原生控件样式。弹窗按内容自适应高度，常规场景不出现滚动条；文本域随内容自动增高，超长内容只在自己的区域内滚动。`/` 可以快速聚焦搜索框。

## 安装

要求 DSH `>= 0.2.0-rc.2 < 0.3.0`，范围写在 `peerDependencies` 中，插件管理器的兼容性检查会拦住版本不匹配。

```bash
dsh plugin --profile desktop add dsh-mcp-skills-board
```

也可以在「插件 → 添加插件」里填写包名，安装后刷新一次页面。

本地开发使用 link 安装：

```bash
dsh plugin --profile desktop add link:/absolute/path/to/dsh-mcp-skills-board
```

## 数据位置

- `$DSH_HOME/mcp-skills.json`（默认 `~/.dsh/mcp-skills.json`，权限 0600）：本页管理的 MCP 服务器定义，是这部分配置的唯一事实源；
- `$DSH_HOME/profiles/<profile>/cordis.patch.yml` 中一个带围栏的块，由上面的 JSON 生成：

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
        toolCallTimeoutMs: 60000
        failOnStartupError: false
      disabled: false
# <<< dsh-mcp-skills-board
```

块外的内容保持原样；别处声明的 MCP 行不会被改写，启停只追加一条按 id 定向的 `disabled:` 覆盖。

技能文件写在所选技能根内（默认 `~/.dsh/skills`），一个技能一个目录：

```
~/.dsh/skills/release-notes/SKILL.md
```

保存时只重写受管的前置字段（名称、描述、何时使用、两个调用开关）和正文，文件里的其它自定义 frontmatter 键会保留。

## 与 Codex 的对应

| Codex | 本插件 |
| --- | --- |
| `config.toml` 的 `[mcp_servers.*]` | `mcp-skills.json` + 生成的 patch 块 |
| Settings → MCP servers | MCP 服务分页 |
| Add server 表单 | 添加服务器表单 |
| `/mcp` 查看连接与工具 | 行状态灯、工具数、详情 |
| `enabled = false` | 行开关，定义保留 |
| `startup_timeout_sec` / `tool_timeout_sec` | `toolCallTimeoutMs`；启动超时由 MCP SDK 控制 |
| `bearer_token_env_var` / `env_http_headers` | 不支持；env 与 headers 明文写入 patch 文件（0600） |
| `codex mcp login`（OAuth） | 不支持，DSH 的 MCP 客户端没有 OAuth |
| `[[skills.config]] enabled = false` | 四态选择器，改写两个 frontmatter 键 |
| 技能位置（repo/user/admin/system） | 磁盘扫描根 + 预设作用域（只读） |

## 已知限制

- **OAuth**：没有实现，需要 OAuth 的远程服务器会被 MCP 桥拒绝，错误显示在行详情里；
- **敏感信息**：`env` / `headers` 的值默认会写进 `cordis.patch.yml`（0600）。表单里把值写成 `@env:变量名` 就会生成 `!!js process.env.变量名`，密钥留在环境变量里，不落盘；
- **预设技能只读**：文件在安装包内，没有可写开关；
- **热重载**：profile 没有 `patchReload: live` 时，MCP 改动需要下次启动才生效，页面会提示；
- **删除范围**：只删除本页添加的服务器，外部声明的行请修改其所在的配置层。

## 目录

```text
package.json                  # dsh.bundle.patch、dsh.client.platform、icon、exports
cordis.patch.yml              # 插入 id=mcp-skills 一行
lib/index.js                  # 宿主：state/action/browse 路由、技能扫描与写入、MCP patch 块
lib/client.js                 # 浏览器：面板、插件页配置区、自绘组件与弹窗
locale/zh.json                # 插件页展示信息（meta.title / meta.description）
locale/en.json                # 英文回退
assets/icon.svg               # 插件列表与详情页图标
assets/screenshot-*.png       # 本文档使用的界面截图
assets/social-preview.png     # GitHub 社交预览图（1280×640）
test/                         # 宿主集成测试
```

插件页的标题与描述由 `readPluginMeta` 读取：包导出的 `locale/en.json` 与同目录的 `<lang>.json`，缺失字段回退到 `package.json`；图标取清单里的 `icon` 字段。这些子路径需要写进 `exports`，否则 Node 解析不到。

## 开发

```bash
npm test
```

覆盖 state/action 路由、服务器增删改与启停、技能策略写入、技能新建/读取/保存、目录浏览与越界校验、认证栅栏。

## 社区

本项目在 [LINUX DO](https://linux.do) 社区推广。

## 许可证

MIT。侧栏图标复用了 `@deepseek-ai/dsh-client-ui-primitives`（MIT）中 `IconSkillOutlineRegular` 的路径数据，以便与 DSH 自身的图标粗细一致。
