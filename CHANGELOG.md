# Changelog

## 0.3.0

- MCP 配置导入/导出：支持 Codex 的 `config.toml`、Claude/Cursor 的 `mcpServers` JSON，以及本插件导出的 JSON
- 环境变量/请求头支持 `@env:变量名` 写法，生成 `!!js process.env.变量名`，不把密钥写进 patch 文件
- 添加服务器提供模板：filesystem、github、fetch、git、sqlite、brave-search
- 技能支持重命名/移动、复制、删除
- MCP 页工具栏新增导入/导出；`/` 快捷键聚焦搜索

## 0.2.0

- 界面重做：自绘按钮、输入框、下拉选择、开关、弹窗、Toast，跟随 DSH 主题，不依赖原生控件样式
- 弹窗按内容自适应高度，文本域随内容增高；常规场景不出现滚动条
- 技能支持新建、查看、编辑：名称、描述、何时使用、正文、两个调用开关
- 新增文件夹选择器：可手动输入路径、快速位置跳转、进入子目录，技能创建位置与 MCP 工作目录共用
- 宿主新增 `GET /mcp-skills/browse` 与 `skill-read` / `skill-create` / `skill-save` 动作
- 仓库地址更新为 `JasperPengC/dsh-mcp-skills-board`（GitHub 账号更名）

## 0.1.0

- 首个版本：MCP 服务器与技能管理面板，侧栏入口与插件页配置区
- MCP 服务器的状态灯、工具数、逐行启停、增删改
- 技能四态切换、按来源分组、预设技能只读
