/**
 * MCP & Skills board — browser half.
 *
 * Hand-written in the client module system's lazy-CJS factory form: executing
 * this file only REGISTERS the factory; the body runs on first materialization.
 * The only module-table word it uses is `react` (for createElement).
 *
 * The page is a self-contained UI kit: buttons, inputs, a keyboard-accessible
 * select, switches, modals and toasts are all built here over React elements,
 * with no native browser chrome and no CSS framework. Everything derives from
 * the host page's design tokens so the panel follows the active theme.
 *
 * @module dsh-mcp-skills-board/client
 */
window.__ModuleLoader__.load({
  id: 'dsh-mcp-skills-board',
  factory: (require) => {
    const React = require('react')
    const h = React.createElement
    const NS = 'mcp-skills'
    const PANEL_ID = 'mcp-skills'
    const STATE_URL = '/mcp-skills/state'
    const ACTION_URL = '/mcp-skills/action'
    const BROWSE_URL = '/mcp-skills/browse'
    const STYLE_ID = 'dsh-mcp-skills-board'
    const module = { exports: {} }
    const exports = module.exports

    const DICTIONARIES = {
      zh: {
        nav: 'MCP 与技能',
        title: 'MCP 与技能',
        intro: '一处查看和开关本部署的技能与 MCP 服务器。改动即时生效，不需要重启进程。',
        search: '搜索名称、描述、命令或路径',
        skillsTab: '技能',
        mcpTab: 'MCP 服务',
        refresh: '刷新',
        addServer: '添加服务器',
        editServer: '编辑 MCP 服务器',
        newSkill: '新建技能',
        editSkill: '编辑技能',
        viewSkill: '技能详情',
        createSkill: '新建技能',
        saveSkill: '保存技能',
        loading: '正在读取…',
        retry: '重试',
        loadFailed: '读取失败',
        emptySkills: '没有发现技能。扫描根：',
        emptyMcp: '还没有 MCP 服务器，点「添加服务器」创建第一台。',
        emptyFiltered: '没有匹配的条目',
        policyTitle: '调用方式',
        policyEnabled: '启用',
        policyManual: '仅手动',
        policyModel: '仅模型',
        policyOff: '停用',
        enabled: '已启用',
        disabled: '已停用',
        description: '描述',
        whenToUse: '何时使用',
        path: '路径',
        bodyLines: '正文行数',
        modelInvocable: '模型可调用',
        userInvocable: '用户可调用',
        yes: '是',
        no: '否',
        entryId: '条目 id',
        transport: '传输方式',
        target: '目标',
        phase: '连接状态',
        tools: '工具',
        timeout: '超时',
        none: '无',
        globalGroup: '全局',
        currentProject: '当前项目',
        restartHint: '该 profile 不热重载 patch 层，本次改动将在下次启动 dsh 时生效。',
        errorRow: '该条目无法解析',
        readOnly: '只读',
        edit: '编辑',
        close: '关闭',
        remove: '删除',
        deleteServer: '删除服务器',
        deleteConfirm: '删除后无法恢复，确认删除这台服务器？',
        confirmDelete: '确认删除',
        name: '名称',
        nameHint: '工具前缀 mcp__<名称>__，只能字母、数字、下划线、连字符',
        command: '命令',
        args: '参数',
        argsHint: '一行一个',
        env: '环境变量',
        envHint: '每行 KEY=VALUE',
        cwd: '工作目录',
        cwdHint: '可留空，继承进程目录',
        url: '地址',
        headers: '请求头',
        headersHint: '每行 Name: value',
        toolCallTimeoutMs: '工具超时（毫秒）',
        enableOnAdd: '创建后立即启用',
        save: '保存',
        cancel: '取消',
        saving: '保存中…',
        required: '必填',
        invalidName: '名称只能包含字母、数字、下划线或连字符，1–32 个字符',
        invalidCommand: 'stdio 服务器需要启动命令',
        invalidUrl: '地址必须以 http:// 或 https:// 开头',
        configPath: '配置文件',
        patchPath: 'patch 文件',
        managedCount: '本页管理',
        missingRow: '尚未进入组合（配置已保存）',
        formError: '保存失败',
        pending: '处理中…',
        skillName: '技能名称',
        skillNameHint: 'kebab-case：小写字母、数字和连字符，例如 release-notes',
        skillNameLocked: '技能名称创建后不可修改',
        skillDescription: '描述',
        skillDescriptionHint: '一句话说明这个技能做什么',
        skillWhen: '何时使用',
        skillWhenHint: '可选，写清楚触发场景，模型更容易选对',
        skillBody: '技能正文',
        skillBodyHint: 'Markdown。留空也可以，之后随时补',
        skillBodyEmpty: '正文为空',
        skillRoot: '创建位置',
        browse: '浏览…',
        pickFolder: '选择文件夹',
        pickerGo: '打开',
        pickerChoose: '选择此文件夹',
        pickerEmpty: '这里没有子文件夹',
        pickerRoots: '快速位置',
        pickerPath: '路径',
        pickFolderMissing: '该文件夹还不存在，选中后会在保存时自动创建。',
        browseMissing: '文件夹浏览需要重启一次 DSH 才能使用（宿主新增了 /mcp-skills/browse 接口）',
        skillPolicy: '调用方式',
        skillModel: '允许模型调用',
        skillUser: '允许手动调用',
        skillModelHint: '模型可以自动选用这个技能',
        skillUserHint: '可以在对话里手动触发',
        enableOnAddHint: '保存后立即启用',
        skillRootHint: '选择这个技能写到哪里',
        skillCreated: '技能已创建',
        noWritableRoot: '没有可写的技能目录，先在 dsh 配置里加一个 skillRoots',
        skillSaved: '技能已保存',
        skillDuplicate: '同名技能已存在',
        invalidSkillName: '技能名称必须是 kebab-case（小写字母、数字、连字符）',
        descriptionRequired: '描述不能为空',
        body: '正文',
        details: '详情',
        source: '来源',
        external: '外部配置',
        duplicate: '已存在',
        actionFailed: '操作失败',
        selected: '已选择',
        filterHint: '按名称、描述、路径或命令过滤',
        count: '项',
      },
      en: {
        nav: 'MCP & Skills',
        title: 'MCP & Skills',
        intro: 'Inspect and toggle this deployment\'s skills and MCP servers. Changes apply immediately; no process restart.',
        search: 'Search name, description, command, or path',
        skillsTab: 'Skills',
        mcpTab: 'MCP servers',
        refresh: 'Refresh',
        addServer: 'Add server',
        editServer: 'Edit MCP server',
        newSkill: 'New skill',
        editSkill: 'Edit skill',
        viewSkill: 'Skill details',
        createSkill: 'New skill',
        saveSkill: 'Save skill',
        loading: 'Reading…',
        retry: 'Retry',
        loadFailed: 'Read failed',
        emptySkills: 'No skills discovered. Scanned roots: ',
        emptyMcp: 'No MCP servers yet. Use "Add server" to create one.',
        emptyFiltered: 'Nothing matches',
        policyTitle: 'Invocation',
        policyEnabled: 'Enabled',
        policyManual: 'Manual only',
        policyModel: 'Model only',
        policyOff: 'Off',
        enabled: 'Enabled',
        disabled: 'Disabled',
        description: 'Description',
        whenToUse: 'When to use',
        path: 'Path',
        bodyLines: 'Body lines',
        modelInvocable: 'Model invocable',
        userInvocable: 'User invocable',
        yes: 'Yes',
        no: 'No',
        entryId: 'Entry id',
        transport: 'Transport',
        target: 'Target',
        phase: 'Connection',
        tools: 'Tools',
        timeout: 'Timeout',
        none: 'None',
        globalGroup: 'Global',
        currentProject: 'Current project',
        restartHint: 'This profile does not hot-reload its patch layer; the change applies on the next dsh launch.',
        errorRow: 'This entry cannot be parsed',
        readOnly: 'Read-only',
        edit: 'Edit',
        close: 'Close',
        remove: 'Remove',
        deleteServer: 'Remove server',
        deleteConfirm: 'This cannot be undone. Remove this server?',
        confirmDelete: 'Remove',
        name: 'Name',
        nameHint: 'Tool prefix mcp__<name>__; letters, digits, underscore, hyphen',
        command: 'Command',
        args: 'Arguments',
        argsHint: 'One per line',
        env: 'Environment',
        envHint: 'KEY=VALUE per line',
        cwd: 'Working directory',
        cwdHint: 'Optional; inherits the process directory',
        url: 'URL',
        headers: 'Headers',
        headersHint: 'Name: value per line',
        toolCallTimeoutMs: 'Tool timeout (ms)',
        enableOnAdd: 'Enable after creating',
        save: 'Save',
        cancel: 'Cancel',
        saving: 'Saving…',
        required: 'Required',
        invalidName: 'Name must be 1–32 letters, digits, underscores, or hyphens',
        invalidCommand: 'A stdio server needs a command',
        invalidUrl: 'URL must start with http:// or https://',
        configPath: 'Config file',
        patchPath: 'Patch file',
        managedCount: 'Managed here',
        missingRow: 'Not in the composition yet (saved)',
        formError: 'Save failed',
        pending: 'Working…',
        skillName: 'Skill name',
        skillNameHint: 'kebab-case: lowercase letters, digits and dashes, e.g. release-notes',
        skillNameLocked: 'The name is fixed after creation',
        skillDescription: 'Description',
        skillDescriptionHint: 'One sentence about what this skill does',
        skillWhen: 'When to use',
        skillWhenHint: 'Optional; describe the trigger so the model picks it reliably',
        skillBody: 'Skill body',
        skillBodyHint: 'Markdown. Can stay empty and be filled in later',
        skillBodyEmpty: 'Empty body',
        skillRoot: 'Create in',
        browse: 'Browse…',
        pickFolder: 'Choose folder',
        pickerGo: 'Open',
        pickerChoose: 'Use this folder',
        pickerEmpty: 'No subfolders here',
        pickerRoots: 'Quick locations',
        pickerPath: 'Path',
        pickFolderMissing: 'This folder does not exist yet; it is created when you save.',
        browseMissing: 'Folder browsing needs one DSH restart (the host now serves /mcp-skills/browse)',
        skillPolicy: 'Invocation',
        skillModel: 'Model can invoke',
        skillUser: 'User can invoke',
        skillModelHint: 'The model may pick this skill automatically',
        skillUserHint: 'You can trigger it manually in a conversation',
        enableOnAddHint: 'Enable right after saving',
        skillRootHint: 'Where this skill file is written',
        skillCreated: 'Skill created',
        noWritableRoot: 'No writable skill directory; add a skillRoots entry first',
        skillSaved: 'Skill saved',
        skillDuplicate: 'A skill with this name already exists',
        invalidSkillName: 'Skill name must be kebab-case (lowercase letters, digits, dashes)',
        descriptionRequired: 'Description is required',
        body: 'Body',
        details: 'Details',
        source: 'Source',
        external: 'Configured elsewhere',
        duplicate: 'Exists',
        actionFailed: 'Action failed',
        selected: 'Selected',
        filterHint: 'Filter by name, description, path or command',
        count: 'items',
      },
    }

    const STYLES = `
.ms-root {
  --ms-accent: var(--dsw-static-blue-500, #4f7cff);
  --ms-accent-soft: rgba(79, 124, 255, 0.14);
  --ms-text: var(--dsw-alias-label-primary, #e8eaee);
  --ms-text-2: var(--dsw-alias-label-secondary, #a9adb6);
  --ms-text-3: var(--dsw-alias-label-tertiary, #7c828c);
  --ms-surface: var(--dsw-alias-bg-layer-1, rgba(255,255,255,0.045));
  --ms-surface-2: var(--dsw-alias-bg-layer-2, rgba(255,255,255,0.07));
  --ms-surface-3: var(--dsw-alias-bg-layer-3, rgba(255,255,255,0.1));
  --ms-border: var(--dsw-alias-border-l2, rgba(255,255,255,0.1));
  --ms-border-strong: var(--dsw-alias-border-l3, rgba(255,255,255,0.17));
  --ms-green: var(--dsw-static-green-400, #34c759);
  --ms-amber: var(--dsw-static-amber-400, #f5a623);
  --ms-red: var(--dsw-static-red-400, #e5484d);
  --ms-mono: var(--ds-font-family-code, ui-monospace, "SF Mono", Menlo, monospace);
  --ms-radius: 14px;
  --ms-radius-sm: 9px;
  width: 100%;
  box-sizing: border-box;
  color: var(--ms-text);
  font-family: inherit;
  font-size: 13px;
  line-height: 1.5;
}
.ms-root.is-panel { max-width: 1000px; margin: 0 auto; padding: 26px 30px 40px; }
.ms-root:not(.is-panel) { padding: 0; }
.ms-root *, .ms-root *::before, .ms-root *::after { box-sizing: border-box; }

/* header */
.ms-head { display: flex; flex-direction: column; gap: 6px; margin-bottom: 20px; }
.ms-title { font-size: 21px; font-weight: 600; letter-spacing: -0.01em; }
.ms-intro { font-size: 13px; color: var(--ms-text-3); max-width: 640px; }

/* tabs */
.ms-tabs { display: flex; gap: 22px; border-bottom: 1px solid var(--ms-border); margin-bottom: 16px; }
.ms-tab { position: relative; display: inline-flex; align-items: center; gap: 7px; padding: 0 1px 11px;
  border: 0; background: none; color: var(--ms-text-3); font: inherit; font-weight: 500; cursor: pointer;
  transition: color 140ms ease; }
.ms-tab:hover { color: var(--ms-text-2); }
.ms-tab.is-active { color: var(--ms-text); }
.ms-tab.is-active::after { content: ""; position: absolute; left: 0; right: 0; bottom: -1px; height: 2px;
  border-radius: 2px; background: var(--ms-accent); }
.ms-tab-count { min-width: 18px; padding: 0 6px; border-radius: 9px; background: var(--ms-surface-3);
  font-size: 11px; line-height: 17px; text-align: center; color: var(--ms-text-2); }

/* toolbar */
.ms-toolbar { display: flex; align-items: center; gap: 8px; margin-bottom: 16px; }
.ms-search { flex: 1 1 auto; display: flex; align-items: center; gap: 8px; height: 34px; padding: 0 11px;
  border: 1px solid var(--ms-border); border-radius: var(--ms-radius-sm); background: var(--ms-surface);
  color: var(--ms-text-3); transition: border-color 140ms ease, background 140ms ease; }
.ms-search:focus-within { border-color: var(--ms-accent); background: var(--ms-surface-2); }
.ms-search input { flex: 1 1 auto; min-width: 0; height: 100%; border: 0; outline: 0; background: transparent;
  color: var(--ms-text); font: inherit; }
.ms-search input::placeholder { color: var(--ms-text-3); }
.ms-toolbar-actions { display: flex; align-items: center; gap: 6px; flex: 0 0 auto; }

/* buttons */
.ms-btn { display: inline-flex; align-items: center; justify-content: center; gap: 6px; height: 32px;
  padding: 0 13px; border-radius: var(--ms-radius-sm); border: 1px solid var(--ms-border);
  background: var(--ms-surface); color: var(--ms-text); font: inherit; font-weight: 500; cursor: pointer;
  white-space: nowrap; transition: background 140ms ease, border-color 140ms ease, transform 90ms ease; }
.ms-btn:hover:not(:disabled) { background: var(--ms-surface-2); border-color: var(--ms-border-strong); }
.ms-btn:active:not(:disabled) { transform: translateY(1px); }
.ms-btn:disabled { opacity: 0.55; cursor: default; }
.ms-btn.is-sm { height: 28px; padding: 0 10px; font-size: 12px; }
.ms-btn.is-primary { background: var(--ms-accent); border-color: transparent; color: #fff; }
.ms-btn.is-primary:hover:not(:disabled) { background: var(--ms-accent); filter: brightness(1.08); }
.ms-btn.is-ghost { background: transparent; border-color: transparent; color: var(--ms-text-2); }
.ms-btn.is-ghost:hover:not(:disabled) { background: var(--ms-surface-2); color: var(--ms-text); }
.ms-btn.is-danger { color: var(--ms-red); border-color: transparent; background: transparent; }
.ms-btn.is-danger:hover:not(:disabled) { background: rgba(229,72,77,0.12); border-color: transparent; }
.ms-btn.is-danger-solid { background: var(--ms-red); border-color: transparent; color: #fff; }
.ms-btn-icon { display: inline-flex; align-items: center; justify-content: center; }
.ms-icon-btn { display: inline-flex; align-items: center; justify-content: center; width: 30px; height: 30px;
  padding: 0; border: 1px solid transparent; border-radius: 8px; background: transparent;
  color: var(--ms-text-3); cursor: pointer; transition: background 140ms ease, color 140ms ease; }
.ms-icon-btn:hover:not(:disabled) { background: var(--ms-surface-2); color: var(--ms-text); }
.ms-icon-btn:disabled { opacity: 0.5; cursor: default; }

/* inputs */
.ms-input, .ms-textarea { width: 100%; border: 1px solid var(--ms-border); border-radius: var(--ms-radius-sm);
  background: var(--ms-surface); color: var(--ms-text); font: inherit; padding: 8px 11px;
  transition: border-color 140ms ease, background 140ms ease; outline: none; }
.ms-input { height: 34px; }
.ms-textarea { min-height: 62px; max-height: 28vh; resize: vertical; line-height: 1.55;
  field-sizing: content; }
.ms-textarea.is-code { font-family: var(--ms-mono); font-size: 12.5px; min-height: 104px; max-height: 30vh; }
.ms-input:hover, .ms-textarea:hover { border-color: var(--ms-border-strong); }
.ms-input:focus, .ms-textarea:focus { border-color: var(--ms-accent); background: var(--ms-surface-2); }
.ms-input::placeholder, .ms-textarea::placeholder { color: var(--ms-text-3); }
.ms-input:disabled { opacity: 0.6; cursor: default; }
.ms-field { display: flex; flex-direction: column; gap: 6px; }
.ms-field-label { font-size: 12px; font-weight: 500; color: var(--ms-text-2); display: flex; gap: 4px; align-items: center; }
.ms-req { color: var(--ms-red); }
.ms-hint { font-size: 11.5px; color: var(--ms-text-3); line-height: 1.45; }
.ms-error-text { font-size: 12px; color: var(--ms-red); }
.ms-form-grid { display: flex; flex-direction: column; gap: 13px; }
.ms-form-row { display: flex; gap: 14px; align-items: flex-start; }
.ms-form-row > .ms-field { flex: 1 1 0; min-width: 0; }
.ms-switch-row { display: flex; align-items: center; gap: 10px; font-size: 12.5px; color: var(--ms-text-2); }
.ms-toggle-cards { display: flex; gap: 10px; }
.ms-toggle-card { flex: 1 1 0; display: flex; align-items: center; gap: 10px; min-width: 0;
  padding: 10px 12px; border: 1px solid var(--ms-border); border-radius: var(--ms-radius-sm);
  background: var(--ms-surface); }
.ms-toggle-card-text { display: flex; flex-direction: column; gap: 1px; min-width: 0; }
.ms-toggle-card-title { font-size: 12.5px; color: var(--ms-text); }
.ms-toggle-card-hint { font-size: 11px; color: var(--ms-text-3); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ms-section { display: flex; flex-direction: column; gap: 12px; }
.ms-section + .ms-section { padding-top: 14px; border-top: 1px solid var(--ms-border); }
/* path field + folder picker */
.ms-path-field { display: flex; align-items: center; gap: 8px; }
.ms-path-field .ms-input { flex: 1 1 auto; min-width: 0; font-family: var(--ms-mono); font-size: 12px; }
.ms-path-field .ms-btn { flex: 0 0 auto; }
.ms-picker { display: flex; flex-direction: column; gap: 12px; }
.ms-picker-row { display: flex; align-items: center; gap: 8px; }
.ms-picker-row .ms-input { flex: 1 1 auto; min-width: 0; font-family: var(--ms-mono); font-size: 12px; }
.ms-picker-roots { display: flex; flex-wrap: wrap; gap: 6px; }
.ms-picker-list { max-height: 300px; min-height: 180px; overflow-y: auto; border: 1px solid var(--ms-border);
  border-radius: 12px; background: var(--ms-surface); padding: 4px; display: flex; flex-direction: column; gap: 1px; }
.ms-picker-item { display: flex; align-items: center; gap: 10px; width: 100%; padding: 8px 10px; border: 0;
  border-radius: 8px; background: transparent; color: var(--ms-text); font: inherit; font-size: 12.5px;
  text-align: left; cursor: pointer; }
.ms-picker-item:hover { background: var(--ms-surface-2); }
.ms-picker-item.is-hidden { color: var(--ms-text-3); }
.ms-picker-item svg { flex: 0 0 auto; color: var(--ms-text-3); }
.ms-picker-empty { padding: 24px 12px; text-align: center; color: var(--ms-text-3); font-size: 12px; }
.ms-picker-path { font-family: var(--ms-mono); font-size: 11.5px; color: var(--ms-text-3); word-break: break-all; }

.ms-modal-sub { font-size: 11.5px; color: var(--ms-text-3); font-family: var(--ms-mono);
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ms-dialog-actions { display: flex; align-items: center; gap: 8px; }
.ms-root :focus-visible { outline: 2px solid var(--ms-accent); outline-offset: 1px; border-radius: 6px; }

/* custom select */
.ms-select { position: relative; display: inline-flex; flex-direction: column; min-width: 120px; }
.ms-select.is-sm { min-width: 96px; }
.ms-select-btn { display: inline-flex; align-items: center; justify-content: space-between; gap: 8px;
  height: 32px; padding: 0 10px; border: 1px solid var(--ms-border); border-radius: var(--ms-radius-sm);
  background: var(--ms-surface); color: var(--ms-text); font: inherit; font-size: 12.5px; cursor: pointer;
  transition: border-color 140ms ease, background 140ms ease; }
.ms-select.is-sm .ms-select-btn { height: 28px; font-size: 12px; }
.ms-select-btn:hover:not(:disabled) { border-color: var(--ms-border-strong); background: var(--ms-surface-2); }
.ms-select-btn:disabled { opacity: 0.55; cursor: default; }
.ms-select-caret { display: inline-flex; color: var(--ms-text-3); transition: transform 140ms ease; }
.ms-select.is-open .ms-select-caret { transform: rotate(180deg); }
.ms-pop { position: absolute; z-index: 40; top: calc(100% + 5px); left: 0; min-width: 100%; padding: 4px;
  border: 1px solid var(--ms-border-strong); border-radius: 10px; background: var(--ms-surface-3);
  box-shadow: 0 14px 34px rgba(0,0,0,0.28);
  display: flex; flex-direction: column; gap: 1px; }
.ms-option { display: flex; align-items: center; justify-content: space-between; gap: 10px; width: 100%;
  padding: 7px 9px; border: 0; border-radius: 7px; background: transparent; color: var(--ms-text-2);
  font: inherit; font-size: 12.5px; text-align: left; cursor: pointer; white-space: nowrap; }
.ms-option:hover { background: var(--ms-surface); color: var(--ms-text); }
.ms-option.is-selected { color: var(--ms-text); background: var(--ms-surface-2); }
.ms-option svg { color: var(--ms-accent); }

/* switch */
.ms-switch { position: relative; width: 38px; height: 22px; flex: 0 0 auto; padding: 0; border: 1px solid var(--ms-border);
  border-radius: 12px; background: var(--ms-surface-3); cursor: pointer;
  transition: background 160ms ease, border-color 160ms ease; }
.ms-switch.is-on { background: var(--ms-green); border-color: transparent; }
.ms-switch .ms-knob { position: absolute; top: 2px; left: 2px; width: 16px; height: 16px; border-radius: 50%;
  background: #fff; box-shadow: 0 1px 3px rgba(0,0,0,0.3); transition: transform 160ms cubic-bezier(.3,.7,.4,1); }
.ms-switch.is-on .ms-knob { transform: translateX(16px); }
.ms-switch:disabled { opacity: 0.5; cursor: default; }

/* chips, dots */
.ms-chip { display: inline-flex; align-items: center; gap: 4px; padding: 2px 7px; border-radius: 6px;
  background: var(--ms-surface-3); color: var(--ms-text-2); font-size: 11px; line-height: 17px; white-space: nowrap; }
.ms-chip.is-mono { font-family: var(--ms-mono); font-size: 10.5px; }
.ms-dot { width: 7px; height: 7px; flex: 0 0 auto; border-radius: 50%; background: var(--ms-text-3); }
.ms-dot.is-on { background: var(--ms-green); box-shadow: 0 0 0 3px rgba(52,199,89,0.14); }
.ms-dot.is-warn { background: var(--ms-amber); box-shadow: 0 0 0 3px rgba(245,166,35,0.14); }
.ms-dot.is-error { background: var(--ms-red); box-shadow: 0 0 0 3px rgba(229,72,77,0.14); }

/* list */
.ms-groups { display: flex; flex-direction: column; gap: 18px; }
.ms-group { display: flex; flex-direction: column; gap: 8px; }
.ms-group-head { display: flex; align-items: center; gap: 8px; width: 100%; padding: 2px 2px;
  border: 0; background: none; color: var(--ms-text-3); font: inherit; font-size: 12px; cursor: pointer; text-align: left; }
.ms-group-head:hover { color: var(--ms-text-2); }
.ms-chevron { display: inline-flex; transition: transform 140ms ease; }
.ms-chevron.is-open { transform: rotate(90deg); }
.ms-group-label { font-weight: 500; color: var(--ms-text-2); }
.ms-group-path { font-family: var(--ms-mono); font-size: 11px; color: var(--ms-text-3); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ms-group-current { padding: 1px 6px; border-radius: 5px; background: var(--ms-accent-soft); color: var(--ms-accent); font-size: 10.5px; }
.ms-group-count { margin-left: auto; font-size: 11px; color: var(--ms-text-3); }
.ms-cards { display: flex; flex-direction: column; gap: 6px; }
.ms-card { display: flex; align-items: center; gap: 12px; padding: 12px 14px; border: 1px solid var(--ms-border);
  border-radius: var(--ms-radius); background: var(--ms-surface); cursor: pointer;
  transition: border-color 140ms ease, background 140ms ease, transform 120ms ease; }
.ms-card:hover { border-color: var(--ms-border-strong); background: var(--ms-surface-2); }
.ms-card:active { transform: scale(0.998); }
.ms-card.is-plain { cursor: default; }
.ms-card-main { flex: 1 1 auto; min-width: 0; display: flex; flex-direction: column; gap: 3px; }
.ms-card-title-row { display: flex; align-items: center; gap: 8px; min-width: 0; }
.ms-card-title { font-weight: 550; font-size: 13px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ms-card-sub { font-size: 12px; color: var(--ms-text-3); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ms-card-actions { display: flex; align-items: center; gap: 8px; flex: 0 0 auto; }
.ms-card-meta { display: flex; align-items: center; gap: 6px; flex: 0 0 auto; }

/* empty / skeleton */
.ms-empty { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px;
  padding: 56px 20px; border: 1px dashed var(--ms-border); border-radius: var(--ms-radius);
  color: var(--ms-text-3); text-align: center; }
.ms-empty-icon { width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center;
  background: var(--ms-surface-2); color: var(--ms-text-3); }
.ms-empty-title { font-size: 13px; color: var(--ms-text-2); }
.ms-empty-hint { font-size: 12px; }
.ms-skeleton { display: flex; flex-direction: column; gap: 8px; }
.ms-skeleton-row { height: 58px; border-radius: var(--ms-radius); background: linear-gradient(90deg,
  var(--ms-surface) 25%, var(--ms-surface-2) 37%, var(--ms-surface) 63%); background-size: 400% 100%;
  animation: ms-shimmer 1.4s ease infinite; }
@keyframes ms-shimmer { 0% { background-position: 100% 0; } 100% { background-position: -100% 0; } }

/* banners */
.ms-banner { display: flex; align-items: flex-start; gap: 10px; padding: 10px 12px; margin-bottom: 12px;
  border-radius: 10px; border: 1px solid var(--ms-border); background: var(--ms-surface); font-size: 12.5px; }
.ms-banner.is-error { border-color: rgba(229,72,77,0.35); background: rgba(229,72,77,0.08); color: var(--ms-text); }
.ms-banner.is-warn { border-color: rgba(245,166,35,0.3); background: rgba(245,166,35,0.08); }
.ms-banner-text { flex: 1 1 auto; min-width: 0; }
.ms-banner-actions { display: flex; gap: 6px; flex: 0 0 auto; }

/* meta footer */
.ms-meta { display: flex; flex-wrap: wrap; align-items: center; gap: 6px 10px; margin-top: 22px;
  font-size: 11.5px; color: var(--ms-text-3); }
.ms-meta code, .ms-mono { font-family: var(--ms-mono); font-size: 11.5px; }
.ms-meta code { color: var(--ms-text-2); background: var(--ms-surface); padding: 1px 5px; border-radius: 4px; }
.ms-meta-sep { opacity: 0.5; }

/* overlay + dialog */
.ms-overlay { position: fixed; inset: 0; z-index: 100; display: flex; align-items: center; justify-content: center;
  padding: 20px; background: rgba(8, 10, 14, 0.5);
  animation: ms-fade 140ms ease; }
@keyframes ms-fade { from { opacity: 0; } to { opacity: 1; } }
.ms-modal { display: flex; flex-direction: column; width: min(640px, calc(100vw - 40px));
  max-height: calc(100vh - 40px); border: 1px solid var(--ms-border-strong); border-radius: 18px; overflow: hidden;
  background: var(--dsw-alias-bg-layer-2, #2c2c2e);
  box-shadow: 0 30px 80px rgba(0,0,0,0.38); animation: ms-rise 160ms cubic-bezier(.2,.7,.3,1); }
.ms-modal.is-wide { width: min(760px, calc(100vw - 40px)); }
.ms-modal-body { overscroll-behavior: contain; }
@keyframes ms-rise { from { opacity: 0; transform: translateY(10px) scale(0.99); } to { opacity: 1; transform: none; } }
.ms-modal-head { display: flex; align-items: center; gap: 10px; padding: 16px 16px 12px 20px; }
.ms-modal-title { flex: 1 1 auto; min-width: 0; font-size: 15px; font-weight: 600; overflow: hidden;
  text-overflow: ellipsis; white-space: nowrap; }
.ms-modal-tools { display: flex; align-items: center; gap: 4px; flex: 0 0 auto; }
.ms-modal-body { flex: 0 1 auto; min-height: 0; overflow-y: auto; padding: 2px 20px 16px; display: flex;
  flex-direction: column; gap: 16px; }
.ms-modal-foot { display: flex; align-items: center; justify-content: flex-end; gap: 8px; padding: 12px 18px;
  border-top: 1px solid var(--ms-border); background: var(--ms-surface); }
.ms-modal-foot .ms-spacer { flex: 1 1 auto; }

/* detail lists */
.ms-kv { display: flex; flex-direction: column; border: 1px solid var(--ms-border); border-radius: 12px; overflow: hidden; }
.ms-kv-row { display: flex; gap: 14px; padding: 9px 12px; font-size: 12.5px; }
.ms-kv-row + .ms-kv-row { border-top: 1px solid var(--ms-border); }
.ms-kv-key { width: 110px; flex: 0 0 auto; color: var(--ms-text-3); }
.ms-kv-val { flex: 1 1 auto; min-width: 0; color: var(--ms-text); word-break: break-word; }
.ms-kv-val.is-mono { font-family: var(--ms-mono); font-size: 12px; }
.ms-tool-list { display: flex; flex-wrap: wrap; gap: 5px; }
.ms-body-block { border: 1px solid var(--ms-border); border-radius: 12px; background: var(--ms-surface);
  padding: 12px 14px; max-height: 260px; overflow: auto; font-family: var(--ms-mono); font-size: 12px;
  line-height: 1.65; white-space: pre-wrap; word-break: break-word; color: var(--ms-text-2); }
.ms-hint-empty { color: var(--ms-text-3); font-style: normal; }

/* toast */
.ms-toast { position: fixed; right: 22px; bottom: 22px; z-index: 120; max-width: 380px; padding: 10px 14px;
  border-radius: 10px; border: 1px solid var(--ms-border-strong); background: var(--ms-surface-3);
  box-shadow: 0 16px 40px rgba(0,0,0,0.3); font-size: 12.5px;
  animation: ms-toast-in 180ms cubic-bezier(.2,.7,.3,1); }
.ms-toast.is-ok { border-left: 3px solid var(--ms-green); }
.ms-toast.is-error { border-left: 3px solid var(--ms-red); }
@keyframes ms-toast-in { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }

/* misc */
.ms-actions-row { display: flex; align-items: center; gap: 8px; }
.ms-divider { height: 1px; background: var(--ms-border); margin: 2px 0; }
.ms-spin { animation: ms-rotate 900ms linear infinite; display: inline-flex; }
@keyframes ms-rotate { to { transform: rotate(360deg); } }
.ms-scroll::-webkit-scrollbar { width: 8px; height: 8px; }
.ms-scroll::-webkit-scrollbar-thumb { background: var(--ms-border-strong); border-radius: 4px; }
.ms-only-desk { display: initial; }
`

    /** A bare observable snapshot source: the renderer binds it to a hook. */
    function createSource(initial) {
      let snapshot = initial
      const listeners = new Set()
      return {
        getSnapshot: () => snapshot,
        subscribe: (listener) => {
          listeners.add(listener)
          return () => { listeners.delete(listener) }
        },
        set: (next) => {
          snapshot = next
          for (const listener of [...listeners]) listener()
        },
      }
    }

    /** The four skill invocation states, as the two frontmatter bits. */
    const POLICY_STATES = [
      { value: '11', labelKey: 'policyEnabled', dot: 'is-on' },
      { value: '01', labelKey: 'policyManual', dot: 'is-warn' },
      { value: '10', labelKey: 'policyModel', dot: 'is-on' },
      { value: '00', labelKey: 'policyOff', dot: 'is-off' },
    ]

    /** The two invocation bits of one skill row, as the selector value. */
    function policyValue(row) {
      return `${row.modelInvocable ? '1' : '0'}${row.userInvocable ? '1' : '0'}`
    }

    /** One skill row's state key. */
    function skillState(row) {
      if (row.error) return 'is-error'
      if (row.readOnly) return 'is-on'
      return POLICY_STATES.find(state => state.value === policyValue(row))?.dot ?? 'is-off'
    }

    /** One MCP row's state, from enablement and the Loader's fiber phase. */
    function mcpState(row) {
      if (row.enabled !== true) return 'is-off'
      if (row.missing) return 'is-warn'
      if (row.phase === 'failed') return 'is-error'
      if (row.phase === 'active') return row.tools > 0 ? 'is-on' : 'is-warn'
      return 'is-warn'
    }

    /** One-line message for one thrown value. */
    function messageOf(error) {
      return error instanceof Error ? error.message : String(error)
    }

    /** Non-empty trimmed lines, as an argv list. */
    function linesToArgs(text) {
      return String(text).split(/\r?\n/).map(line => line.trim()).filter(line => line.length > 0)
    }

    /** `KEY=VALUE` (or `Name: value`) lines, as a string map. */
    function linesToMap(text, separator) {
      const map = {}
      for (const line of String(text).split(/\r?\n/)) {
        const trimmed = line.trim()
        if (trimmed.length === 0) continue
        const at = trimmed.indexOf(separator)
        if (at <= 0) continue
        const key = trimmed.slice(0, at).trim()
        const value = trimmed.slice(at + 1).trim()
        if (key.length > 0) map[key] = value
      }
      return map
    }

    /** A string map back to editable lines. */
    function mapToLines(map, separator) {
      return Object.entries(map).map(([key, value]) => `${key}${separator === ':' ? ': ' : '='}${value}`).join('\n')
    }

    /** One empty server form. */
    function emptyServer() {
      return {
        name: '',
        transport: 'stdio',
        enabled: true,
        command: '',
        args: '',
        env: '',
        cwd: '',
        url: '',
        headers: '',
        toolCallTimeoutMs: 60000,
      }
    }

    /** One MCP row's config, as form values. */
    function serverToValues(row) {
      return {
        name: row.serverName,
        transport: row.transport,
        enabled: row.enabled === true,
        command: row.config?.command ?? '',
        args: (row.config?.args ?? []).join('\n'),
        env: mapToLines(row.config?.env ?? {}, '='),
        cwd: row.config?.cwd ?? '',
        url: row.config?.url ?? '',
        headers: mapToLines(row.config?.headers ?? {}, ':'),
        toolCallTimeoutMs: row.toolCallTimeoutMs ?? 60000,
      }
    }

    // -----------------------------------------------------------------------
    // Icons (16px stroke glyphs, inherit currentColor)
    // -----------------------------------------------------------------------

    function Svg(paths, opts) {
      return function IconComponent(props) {
        const size = props?.size ?? 16
        return h('svg', {
          width: size, height: size, viewBox: opts?.viewBox ?? '0 0 24 24', fill: 'none',
          stroke: 'currentColor', strokeWidth: opts?.strokeWidth ?? 1.8,
          strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': 'true',
        }, ...paths.map((d, index) => h('path', { key: index, d })))
      }
    }

    const IconSearch = Svg(['M11 4.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13', 'M16 16l4.5 4.5'])
    const IconPlus = Svg(['M12 5v14', 'M5 12h14'])
    const IconRefresh = Svg(['M20 12a8 8 0 1 1-2.4-5.7', 'M20 4v4h-4'])
    const IconEdit = Svg(['M4 20h4l10-10-4-4L4 16v4z', 'M13.5 6.5l4 4'])
    const IconClose = Svg(['M6 6l12 12', 'M18 6L6 18'])
    const IconChevron = Svg(['M9 6l6 6-6 6'])
    const IconChevronDown = Svg(['M6 9.5l6 6 6-6'])
    const IconCheck = Svg(['M5 12.5l4.5 4.5L19 7.5'])
    const IconTrash = Svg(['M5 7h14', 'M10 7V5h4v2', 'M7 7l1 12h8l1-12'])
    const IconServer = Svg(['M4 5h16v5H4z', 'M4 14h16v5H4z', 'M7.5 7.5h.01', 'M7.5 16.5h.01'])
    const IconSkill = Svg(['M6 4h9l3 3v13H6z', 'M9 10h6', 'M9 13.5h4', 'M17.5 16.5l1 2.2 2.2 1-2.2 1-1 2.2-1-2.2-2.2-1 2.2-1z'])
    const IconInfo = Svg(['M12 8h.01', 'M11 12h1v5h1'])
    const IconFolder = Svg(['M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z'])
    const IconSpinner = Svg(['M12 3a9 9 0 1 0 9 9'], { strokeWidth: 2 })

    // -----------------------------------------------------------------------
    // Primitives
    // -----------------------------------------------------------------------

    function Button(props) {
      const variant = props.variant ?? 'secondary'
      const size = props.size ?? 'md'
      const className = ['ms-btn', `is-${variant}`, size === 'sm' ? 'is-sm' : '', props.className ?? '']
        .filter(Boolean).join(' ')
      return h('button', {
        type: 'button',
        className,
        disabled: props.disabled === true,
        title: props.title,
        'aria-label': props['aria-label'],
        onClick: props.onClick,
      }, props.icon === undefined ? null : h('span', { className: 'ms-btn-icon' }, props.icon),
        props.children === undefined || props.children === null ? null : h('span', null, props.children))
    }

    function IconButton(props) {
      return h('button', {
        type: 'button',
        className: 'ms-icon-btn' + (props.className ? ` ${props.className}` : ''),
        title: props.title,
        'aria-label': props['aria-label'] ?? props.title,
        disabled: props.disabled === true,
        onClick: props.onClick,
      }, props.children)
    }

    function Field(props) {
      return h('div', { className: 'ms-field' + (props.wide ? ' is-wide' : '') },
        h('div', { className: 'ms-field-label' }, props.label,
          props.required === true ? h('span', { className: 'ms-req' }, '*') : null),
        props.children,
        props.hint === undefined ? null : h('div', { className: 'ms-hint' }, props.hint),
        props.error === undefined || props.error === null ? null : h('div', { className: 'ms-error-text' }, props.error))
    }

    function Toggle(props) {
      return h('button', {
        type: 'button',
        role: 'switch',
        'aria-checked': props.checked === true,
        'aria-label': props.label,
        disabled: props.disabled === true,
        className: 'ms-switch' + (props.checked === true ? ' is-on' : ''),
        onClick: () => { if (props.disabled !== true) props.onChange(props.checked !== true) },
      }, h('span', { className: 'ms-knob' }))
    }

    function Select(props) {
      const [open, setOpen] = React.useState(false)
      const ref = React.useRef(null)
      const options = props.options ?? []
      const current = options.find(option => option.value === props.value)
      const disabled = props.disabled === true
      React.useEffect(() => {
        if (!open) return undefined
        const onDown = (event) => { if (ref.current !== null && !ref.current.contains(event.target)) setOpen(false) }
        const onKey = (event) => { if (event.key === 'Escape') setOpen(false) }
        document.addEventListener('mousedown', onDown)
        document.addEventListener('keydown', onKey)
        return () => {
          document.removeEventListener('mousedown', onDown)
          document.removeEventListener('keydown', onKey)
        }
      }, [open])
      return h('div', {
        className: ['ms-select', open ? 'is-open' : '', disabled ? 'is-disabled' : '', props.size === 'sm' ? 'is-sm' : ''].filter(Boolean).join(' '),
        ref,
      },
      h('button', {
        type: 'button',
        className: 'ms-select-btn',
        disabled,
        'aria-haspopup': 'listbox',
        'aria-expanded': open,
        'aria-label': props['aria-label'],
        onClick: () => { if (!disabled) setOpen(value => !value) },
      }, h('span', { className: 'ms-select-value' }, current === undefined ? (props.placeholder ?? '') : current.label),
        h('span', { className: 'ms-select-caret' }, h(IconChevronDown, { size: 13 }))),
      open ? h('div', { className: 'ms-pop ms-scroll', role: 'listbox' },
        options.map(option => h('button', {
          key: option.value,
          type: 'button',
          role: 'option',
          'aria-selected': option.value === props.value,
          className: 'ms-option' + (option.value === props.value ? ' is-selected' : ''),
          onClick: () => {
            setOpen(false)
            if (option.value !== props.value) props.onChange(option.value)
          },
        }, h('span', null, option.label),
          option.value === props.value ? h(IconCheck, { size: 13 }) : null))) : null)
    }

    function Modal(props) {
      React.useEffect(() => {
        const onKey = (event) => { if (event.key === 'Escape') props.onClose() }
        document.addEventListener('keydown', onKey)
        return () => document.removeEventListener('keydown', onKey)
      }, [props.onClose])
      React.useEffect(() => {
        const previous = document.body.style.overflow
        document.body.style.overflow = 'hidden'
        return () => { document.body.style.overflow = previous }
      }, [])
      return h('div', {
        className: 'ms-overlay',
        onMouseDown: (event) => { if (event.target === event.currentTarget) props.onClose() },
      }, h('div', {
        className: 'ms-modal' + (props.wide ? ' is-wide' : ''),
        role: 'dialog',
        'aria-modal': 'true',
        'aria-label': props.title,
      },
      h('div', { className: 'ms-modal-head' },
        h('div', { className: 'ms-modal-title' }, props.title),
        h('div', { className: 'ms-modal-tools' },
          props.tools ?? null,
          h(IconButton, { title: props.closeLabel ?? 'Close', onClick: props.onClose }, h(IconClose)))),
      h('div', { className: 'ms-modal-body ms-scroll' }, props.children),
      props.footer === undefined || props.footer === null ? null
        : h('div', { className: 'ms-modal-foot' }, props.footer)))
    }

    function Toast(props) {
      React.useEffect(() => {
        const timer = setTimeout(() => props.onDone(), 2600)
        return () => clearTimeout(timer)
      }, [props.id])
      return h('div', { className: 'ms-toast is-' + props.kind, role: 'status' }, props.text)
    }

    function EmptyState(props) {
      return h('div', { className: 'ms-empty' },
        h('div', { className: 'ms-empty-icon' }, props.icon),
        h('div', { className: 'ms-empty-title' }, props.title),
        props.hint === undefined ? null : h('div', { className: 'ms-empty-hint' }, props.hint))
    }

    function Skeleton() {
      return h('div', { className: 'ms-skeleton' },
        h('div', { className: 'ms-skeleton-row' }),
        h('div', { className: 'ms-skeleton-row' }),
        h('div', { className: 'ms-skeleton-row' }))
    }

    function Banner(props) {
      return h('div', { className: 'ms-banner is-' + props.kind },
        h('div', { className: 'ms-banner-text' }, props.text),
        props.actions === undefined ? null : h('div', { className: 'ms-banner-actions' }, props.actions))
    }

    function KeyValue(props) {
      return h('div', { className: 'ms-kv-row' },
        h('div', { className: 'ms-kv-key' }, props.label),
        h('div', { className: 'ms-kv-val' + (props.mono ? ' is-mono' : '') }, props.children))
    }

    /** A text path with a browse button that opens the folder picker. */
    function PathField(props) {
      return h(Field, {
        label: props.label,
        required: props.required,
        hint: props.hint,
      }, h('div', { className: 'ms-path-field' },
        h('input', {
          className: 'ms-input',
          value: props.value,
          placeholder: props.placeholder,
          spellCheck: false,
          onChange: (event) => props.onChange(event.target.value),
        }),
        h(Button, { variant: 'secondary', onClick: props.onBrowse }, props.t('browse'))))
    }

    /** Server-backed folder picker, shared by every path field. */
    function DirectoryPickerDialog(props) {
      const { t } = props
      const [listing, setListing] = React.useState(null)
      const [manual, setManual] = React.useState(props.startPath ?? '')
      const [error, setError] = React.useState(null)
      const [loading, setLoading] = React.useState(true)

      const load = React.useCallback(async (path) => {
        setLoading(true)
        setError(null)
        try {
          const query = path === undefined || path === null || String(path).trim().length === 0 ? '' : `?path=${encodeURIComponent(String(path).trim())}`
          const response = await fetch(`${BROWSE_URL}${query}`, { credentials: 'same-origin', headers: { accept: 'application/json' } })
          const payload = await response.json().catch(() => ({}))
          if (response.status === 404) throw new Error(t('browseMissing'))
          if (!response.ok) throw new Error(payload.message ?? `HTTP ${response.status}`)
          setListing(payload)
          setManual(payload.path ?? '')
          if (typeof payload.error === 'string' && payload.error.length > 0) setError(payload.error)
        } catch (failure) {
          setError(messageOf(failure))
        } finally {
          setLoading(false)
        }
      }, [])

      React.useEffect(() => { void load(props.startPath) }, [])

      const current = listing?.path ?? ''
      const entries = Array.isArray(listing?.entries) ? listing.entries : []
      const roots = Array.isArray(listing?.roots) ? listing.roots : []

      return h(Modal, {
        title: t('pickFolder'),
        onClose: props.onCancel,
        closeLabel: t('close'),
        wide: true,
        footer: [
          h('span', { key: 'path', className: 'ms-picker-path' }, current || t('pickerPath')),
          h('div', { key: 'spacer', className: 'ms-spacer' }),
          h(Button, { key: 'cancel', variant: 'ghost', onClick: props.onCancel }, t('cancel')),
          h(Button, {
            key: 'choose',
            variant: 'primary',
            disabled: loading || current.length === 0 || error !== null,
            onClick: () => props.onPick(current),
          }, t('pickerChoose')),
        ],
      },
      h('div', { className: 'ms-picker' },
        h('div', { className: 'ms-picker-row' },
          h('input', {
            className: 'ms-input',
            value: manual,
            spellCheck: false,
            placeholder: t('pickerPath'),
            onChange: (event) => setManual(event.target.value),
            onKeyDown: (event) => { if (event.key === 'Enter') { event.preventDefault(); void load(manual) } },
          }),
          h(Button, { variant: 'secondary', disabled: loading, onClick: () => { void load(manual) } }, t('pickerGo'))),
        roots.length === 0 ? null : h('div', { className: 'ms-picker-roots' },
          h('span', { className: 'ms-hint' }, t('pickerRoots')),
          ...roots.map(root => h(Button, {
            key: root.path,
            size: 'sm',
            variant: 'secondary',
            title: root.path,
            onClick: () => { void load(root.path) },
          }, root.label))),
        error === null ? null : h(Banner, { kind: 'error', text: error }),
        listing !== null && listing.missing === true && error === null ? h(Banner, { kind: 'warn', text: t('pickFolderMissing') }) : null,
        h('div', { className: 'ms-picker-list ms-scroll' },
          listing === null || listing.parent === null || listing.parent === undefined ? null : h('button', {
            type: 'button',
            className: 'ms-picker-item is-hidden',
            onClick: () => { void load(listing.parent) },
          }, h(IconChevron, { size: 14 }), '..'),
          entries.length === 0 && loading !== true
            ? h('div', { className: 'ms-picker-empty' }, t('pickerEmpty'))
            : entries.map(entry => h('button', {
              key: entry.path,
              type: 'button',
              className: 'ms-picker-item' + (entry.hidden === true ? ' is-hidden' : ''),
              title: entry.path,
              onClick: () => { void load(entry.path) },
            }, h(IconFolder, { size: 15 }), entry.name)))))
    }

    // -----------------------------------------------------------------------
    // Skill dialogs
    // -----------------------------------------------------------------------

    function SkillViewDialog(props) {
      const { row, doc, loading, t } = props
      const policy = row.readOnly ? null : POLICY_STATES.find(state => state.value === policyValue(row))
      return h(Modal, {
        title: t('viewSkill'),
        onClose: props.onClose,
        closeLabel: t('close'),
        wide: true,
        footer: [
          h('div', { key: 'spacer', className: 'ms-spacer' }),
          h(Button, { key: 'close', variant: 'ghost', onClick: props.onClose }, t('close')),
          row.readOnly ? null : h(Button, { key: 'edit', variant: 'primary', icon: h(IconEdit), onClick: () => props.onEdit(doc ?? row) }, t('edit')),
        ].filter(Boolean),
      },
      h('div', { className: 'ms-card-title-row' },
        h('span', { className: 'ms-card-title' }, row.name),
        row.readOnly ? h('span', { className: 'ms-chip' }, t('readOnly')) : null,
        policy === undefined || policy === null ? null : h('span', { className: 'ms-chip' }, t(policy.labelKey))),
      h('div', { className: 'ms-kv' },
        h(KeyValue, { label: t('path'), mono: true }, row.path),
        h(KeyValue, { label: t('description') }, row.description || h('span', { className: 'ms-hint-empty' }, t('none'))),
        h(KeyValue, { label: t('whenToUse') }, row.whenToUse || h('span', { className: 'ms-hint-empty' }, t('none'))),
        h(KeyValue, { label: t('bodyLines') }, String(row.bodyLines))),
      h('div', { className: 'ms-field-label' }, t('body')),
      loading
        ? h('div', { className: 'ms-body-block' }, h('span', { className: 'ms-spin' }, h(IconSpinner)))
        : h('div', { className: 'ms-body-block' }, doc === null || doc === undefined || String(doc.body ?? '').trim().length === 0
          ? h('span', { className: 'ms-hint-empty' }, t('skillBodyEmpty'))
          : doc.body))
    }

    function SkillEditorDialog(props) {
      const { mode, initial, roots, t } = props
      const isCreate = mode === 'create'
      const writableRoots = (roots ?? []).filter(root => root.writable !== false)
      const [values, setValues] = React.useState(() => ({
        name: initial?.name ?? '',
        description: initial?.description ?? '',
        whenToUse: initial?.whenToUse ?? '',
        body: initial?.body ?? '',
        model: initial?.modelInvocable !== false,
        user: initial?.userInvocable !== false,
        rootPath: writableRoots[0]?.path ?? '',
      }))
      const [picker, setPicker] = React.useState(null)
      const [error, setError] = React.useState(null)
      const [busy, setBusy] = React.useState(false)
      const set = (key) => (event) => setValues(current => ({ ...current, [key]: event.target.value }))
      const toggle = (key) => (next) => setValues(current => ({ ...current, [key]: next }))

      const submit = async () => {
        if (busy) return
        const name = values.name.trim()
        if (isCreate && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(name)) {
          setError(t('invalidSkillName'))
          return
        }
        if (isCreate && values.rootPath.trim().length === 0) {
          setError(t('noWritableRoot'))
          return
        }
        if (values.description.trim().length === 0) {
          setError(t('descriptionRequired'))
          return
        }
        setBusy(true)
        const failure = await props.onSubmit({
          name,
          description: values.description.trim(),
          whenToUse: values.whenToUse.trim(),
          body: values.body,
          model: values.model,
          user: values.user,
          rootPath: values.rootPath,
        })
        setBusy(false)
        if (failure !== null && failure !== undefined) setError(failure)
      }

      const onKeyDown = (event) => {
        if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
          event.preventDefault()
          void submit()
        }
      }

      const toggleCard = (title, hint, checked, onChange) => h('div', { className: 'ms-toggle-card' },
        h(Toggle, { checked, label: title, onChange }),
        h('div', { className: 'ms-toggle-card-text' },
          h('span', { className: 'ms-toggle-card-title' }, title),
          h('span', { className: 'ms-toggle-card-hint' }, hint)))

      const modal = h(Modal, {
        title: isCreate ? t('createSkill') : t('editSkill'),
        onClose: props.onCancel,
        closeLabel: t('close'),
        wide: true,
        footer: [
          h('span', { key: 'hint', className: 'ms-hint' }, '⌘/Ctrl + Enter'),
          h('div', { key: 'spacer', className: 'ms-spacer' }),
          h(Button, { key: 'cancel', variant: 'ghost', disabled: busy, onClick: props.onCancel }, t('cancel')),
          h(Button, { key: 'save', variant: 'primary', disabled: busy, onClick: submit }, busy ? t('saving') : t('save')),
        ],
      },
      h('div', { className: 'ms-form-grid', onKeyDown },
        isCreate ? null : h('div', { className: 'ms-modal-sub' }, initial?.path ?? ''),
        h('div', { className: 'ms-form-row' },
          h(Field, {
            label: t('skillName'),
            required: isCreate,
            hint: isCreate ? t('skillNameHint') : t('skillNameLocked'),
          }, h('input', {
            className: 'ms-input',
            value: values.name,
            spellCheck: false,
            autoFocus: isCreate,
            disabled: !isCreate,
            readOnly: !isCreate,
            placeholder: 'release-notes',
            onChange: set('name'),
          })),
          isCreate
            ? h(PathField, {
              label: t('skillRoot'),
              value: values.rootPath,
              placeholder: t('noWritableRoot'),
              onChange: (next) => setValues(current => ({ ...current, rootPath: next })),
              onBrowse: () => setPicker({ startPath: values.rootPath }),
              t,
            })
            : null),
        h(Field, { label: t('skillDescription'), required: true, hint: t('skillDescriptionHint') },
          h('textarea', { className: 'ms-textarea', rows: 2, value: values.description, onChange: set('description') })),
        h(Field, { label: t('skillWhen'), hint: t('skillWhenHint') },
          h('textarea', { className: 'ms-textarea', rows: 2, value: values.whenToUse, onChange: set('whenToUse') })),
        h(Field, { label: t('skillBody'), hint: t('skillBodyHint') },
          h('textarea', { className: 'ms-textarea is-code', rows: 8, value: values.body, spellCheck: false, onChange: set('body') })),
        h('div', { className: 'ms-toggle-cards' },
          toggleCard(t('skillModel'), t('skillModelHint'), values.model, toggle('model')),
          toggleCard(t('skillUser'), t('skillUserHint'), values.user, toggle('user'))),
        error === null ? null : h('div', { className: 'ms-error-text' }, error)))

      return h(React.Fragment, null, modal, picker === null ? null : h(DirectoryPickerDialog, {
        t,
        startPath: picker.startPath,
        onCancel: () => setPicker(null),
        onPick: (path) => {
          setValues(current => ({ ...current, rootPath: path }))
          setPicker(null)
        },
      }))
    }

    // -----------------------------------------------------------------------
    // MCP dialogs
    // -----------------------------------------------------------------------

    function ServerViewDialog(props) {
      const { row, t } = props
      const [confirm, setConfirm] = React.useState(false)
      const [busy, setBusy] = React.useState(false)
      const run = async (action) => {
        if (busy) return
        setBusy(true)
        await action()
        setBusy(false)
      }
      const tools = Array.isArray(row.toolNames) ? row.toolNames : []
      return h(Modal, {
        title: t('details'),
        onClose: props.onClose,
        closeLabel: t('close'),
        wide: true,
        footer: [
          h('div', { key: 'left', className: 'ms-actions-row' },
            row.managed !== false
              ? (confirm
                ? h(Button, { key: 'd1', variant: 'danger', disabled: busy, onClick: () => setConfirm(false) }, t('cancel'))
                : null)
              : null,
            row.managed !== false
              ? (confirm
                ? h(Button, { key: 'd2', variant: 'danger-solid', disabled: busy, onClick: () => run(props.onDelete) }, t('confirmDelete'))
                : h(Button, { key: 'd3', variant: 'danger', icon: h(IconTrash), disabled: busy, onClick: () => setConfirm(true) }, t('remove')))
              : null),
          h('div', { key: 'spacer', className: 'ms-spacer' }),
          h(Button, { key: 'close', variant: 'ghost', onClick: props.onClose }, t('close')),
          h(Button, { key: 'edit', variant: 'primary', icon: h(IconEdit), onClick: () => props.onEdit(row) }, t('edit')),
        ],
      },
      h('div', { className: 'ms-card-title-row' },
        h('span', { className: 'ms-dot ' + mcpState(row) }),
        h('span', { className: 'ms-card-title' }, row.serverName),
        h('span', { className: 'ms-chip' }, row.transport)),
      h('div', { className: 'ms-kv' },
        h(KeyValue, { label: t('entryId'), mono: true }, row.id),
        h(KeyValue, { label: t('target'), mono: true }, row.detail || t('none')),
        h(KeyValue, { label: t('phase') }, row.missing === true ? t('missingRow') : (row.phase ?? t('none'))),
        h(KeyValue, { label: t('timeout') }, `${row.toolCallTimeoutMs ?? t('none')} ms`),
        h(KeyValue, { label: t('tools') }, tools.length === 0
          ? t('none')
          : h('div', { className: 'ms-tool-list' }, tools.map(name => h('span', { key: name, className: 'ms-chip is-mono' }, name))))),
      h('div', { className: 'ms-switch-row' },
        h(Toggle, {
          checked: row.enabled === true,
          label: t('enabled'),
          disabled: busy,
          onChange: (next) => run(() => props.onToggle(next)),
        }),
        h('span', null, row.enabled === true ? t('enabled') : t('disabled'))),
      confirm ? h('div', { className: 'ms-error-text' }, t('deleteConfirm')) : null)
    }

    function ServerEditorDialog(props) {
      const { mode, initial, t } = props
      const isCreate = mode === 'create'
      const [values, setValues] = React.useState(initial ?? emptyServer())
      const [picker, setPicker] = React.useState(null)
      const [error, setError] = React.useState(null)
      const [busy, setBusy] = React.useState(false)
      const set = (key) => (event) => setValues(current => ({ ...current, [key]: event.target.value }))
      const setBool = (key) => (next) => setValues(current => ({ ...current, [key]: next }))

      const submit = async () => {
        if (busy) return
        const name = values.name.trim()
        if (!/^[A-Za-z0-9_-]{1,32}$/.test(name)) {
          setError(t('invalidName'))
          return
        }
        const stdio = values.transport === 'stdio'
        if (stdio && values.command.trim().length === 0) {
          setError(t('invalidCommand'))
          return
        }
        if (!stdio && !/^https?:\/\//.test(values.url.trim())) {
          setError(t('invalidUrl'))
          return
        }
        const server = {
          name,
          transport: values.transport,
          enabled: values.enabled === true,
          command: stdio ? values.command.trim() : '',
          args: stdio ? linesToArgs(values.args) : [],
          env: stdio ? linesToMap(values.env, '=') : {},
          cwd: stdio ? values.cwd.trim() : '',
          url: stdio ? '' : values.url.trim(),
          headers: stdio ? {} : linesToMap(values.headers, ':'),
          toolCallTimeoutMs: Number(values.toolCallTimeoutMs) || 60000,
        }
        setBusy(true)
        const failure = await props.onSubmit(server)
        setBusy(false)
        if (failure !== null && failure !== undefined) setError(failure)
      }

      const onKeyDown = (event) => {
        if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
          event.preventDefault()
          void submit()
        }
      }

      const stdio = values.transport === 'stdio'
      const timeoutField = h(Field, { label: t('toolCallTimeoutMs') },
        h('input', {
          className: 'ms-input',
          type: 'number',
          min: '1000',
          max: '600000',
          step: '1000',
          value: values.toolCallTimeoutMs,
          onChange: set('toolCallTimeoutMs'),
        }))

      const modal = h(Modal, {
        title: isCreate ? t('addServer') : t('editServer'),
        onClose: props.onCancel,
        closeLabel: t('close'),
        wide: true,
        footer: [
          h('span', { key: 'hint', className: 'ms-hint' }, '⌘/Ctrl + Enter'),
          h('div', { key: 'spacer', className: 'ms-spacer' }),
          h(Button, { key: 'cancel', variant: 'ghost', disabled: busy, onClick: props.onCancel }, t('cancel')),
          h(Button, { key: 'save', variant: 'primary', disabled: busy, onClick: submit }, busy ? t('saving') : t('save')),
        ],
      },
      h('div', { className: 'ms-form-grid', onKeyDown },
        isCreate ? null : h('div', { className: 'ms-modal-sub' }, values.name),
        h('div', { className: 'ms-form-row' },
          h(Field, { label: t('name'), required: true },
            h('input', { className: 'ms-input', value: values.name, spellCheck: false, autoFocus: isCreate, onChange: set('name') })),
          h('div', { className: 'ms-field' },
            h('div', { className: 'ms-field-label' }, t('transport')),
            h(Select, {
              value: values.transport,
              'aria-label': t('transport'),
              options: [{ value: 'stdio', label: 'stdio' }, { value: 'streamable-http', label: 'streamable-http' }],
              onChange: (next) => setValues(current => ({ ...current, transport: next })),
            }))),
        stdio
          ? h('div', { className: 'ms-form-row' },
            h(Field, { label: t('command'), required: true },
              h('input', { className: 'ms-input', value: values.command, placeholder: 'npx', spellCheck: false, onChange: set('command') })),
            timeoutField)
          : h('div', { className: 'ms-form-row' },
            h(Field, { label: t('url'), required: true },
              h('input', { className: 'ms-input', value: values.url, placeholder: 'https://example.com/mcp', spellCheck: false, onChange: set('url') })),
            timeoutField),
        stdio
          ? h(Field, { label: t('args'), hint: t('argsHint') },
            h('textarea', {
              className: 'ms-textarea is-code',
              rows: 3,
              value: values.args,
              placeholder: '-y\n@modelcontextprotocol/server-filesystem',
              spellCheck: false,
              onChange: set('args'),
            }))
          : h(Field, { label: t('headers'), hint: t('headersHint') },
            h('textarea', {
              className: 'ms-textarea is-code',
              rows: 3,
              value: values.headers,
              placeholder: 'Authorization: Bearer ...',
              spellCheck: false,
              onChange: set('headers'),
            })),
        stdio
          ? h('div', { className: 'ms-form-row' },
            h(Field, { label: t('env'), hint: t('envHint') },
              h('textarea', { className: 'ms-textarea is-code', rows: 2, value: values.env, placeholder: 'GITHUB_TOKEN=...', spellCheck: false, onChange: set('env') })),
            h(PathField, {
              label: t('cwd'),
              hint: t('cwdHint'),
              value: values.cwd,
              onChange: (next) => setValues(current => ({ ...current, cwd: next })),
              onBrowse: () => setPicker({ startPath: values.cwd }),
              t,
            }))
          : null,
        h('div', { className: 'ms-toggle-cards' },
          h('div', { className: 'ms-toggle-card' },
            h(Toggle, { checked: values.enabled, label: t('enableOnAdd'), onChange: setBool('enabled') }),
            h('div', { className: 'ms-toggle-card-text' },
              h('span', { className: 'ms-toggle-card-title' }, t('enableOnAdd')),
              h('span', { className: 'ms-toggle-card-hint' }, t('enableOnAddHint'))))),
        error === null ? null : h('div', { className: 'ms-error-text' }, error)))

      return h(React.Fragment, null, modal, picker === null ? null : h(DirectoryPickerDialog, {
        t,
        startPath: picker.startPath,
        onCancel: () => setPicker(null),
        onPick: (path) => {
          setValues(current => ({ ...current, cwd: path }))
          setPicker(null)
        },
      }))
    }

    // -----------------------------------------------------------------------
    // Board
    // -----------------------------------------------------------------------

    /**
     * The Settings page. Props are the framework shares: `useBoard` (the data
     * source bound to a selector hook), `load`/`dispatch`, `t`, `presentation`.
     */
    function BoardSection(props) {
      const snapshot = props.useBoard(value => value)
      const t = props.t
      const presentation = props.presentation === 'panel' ? 'panel' : 'page'
      const [query, setQuery] = React.useState('')
      const [tab, setTab] = React.useState('skills')
      const [dialog, setDialog] = React.useState(null)
      const [toast, setToast] = React.useState(null)
      const [collapsed, setCollapsed] = React.useState({})

      React.useEffect(() => {
        if (snapshot.status === 'idle') void props.load()
      }, [snapshot.status])

      const pushToast = (kind, text) => setToast({ id: `${Date.now()}-${Math.random()}`, kind, text })

      const act = async (action, successText) => {
        const result = await props.dispatch(action)
        if (result.ok) {
          if (successText !== undefined) pushToast('ok', successText)
        } else {
          pushToast('error', result.error ?? t('actionFailed'))
        }
        return result
      }

      const needle = query.trim().toLowerCase()
      const matches = (haystack) => needle.length === 0 || String(haystack ?? '').toLowerCase().includes(needle)

      const skills = snapshot.skills.filter(row => matches(`${row.name} ${row.description} ${row.whenToUse} ${row.path}`))
      const servers = snapshot.mcp.filter(row => matches(`${row.serverName} ${row.detail} ${row.id} ${row.transport}`))
      const allRoots = Array.isArray(snapshot.roots) ? snapshot.roots : []
      const pinnedId = snapshot.groups.find(group => group.current)?.id

      const groupLabel = (group) => group.kind === 'global' ? t('globalGroup') : (group.label ?? group.path ?? group.id)
      const isOpen = (group) => collapsed[group.id] !== true
      const toggleGroup = (id) => setCollapsed(current => ({ ...current, [id]: current[id] !== true }))

      const setSkillPolicy = async (row, value) => {
        await act({ action: 'skill', id: row.path, model: value[0] === '1', user: value[1] === '1' })
      }

      const openSkillView = async (row) => {
        setDialog({ kind: 'skill-view', row, doc: null, loading: true })
        const result = await props.dispatch({ action: 'skill-read', id: row.path })
        if (result.ok && result.payload?.skill) {
          const doc = result.payload.skill
          setDialog(current => current !== null && current.kind === 'skill-view' && current.row.path === row.path
            ? { ...current, doc, loading: false }
            : current)
        } else {
          setDialog(current => current !== null && current.kind === 'skill-view' ? { ...current, loading: false } : current)
          pushToast('error', result.error ?? t('loadFailed'))
        }
      }

      const submitSkill = async (dialogs, values) => {
        const result = await act(dialogs.kind === 'skill-create'
          ? { action: 'skill-create', rootPath: values.rootPath, name: values.name, description: values.description, whenToUse: values.whenToUse, body: values.body, model: values.model, user: values.user }
          : { action: 'skill-save', id: dialogs.row.path, description: values.description, whenToUse: values.whenToUse, body: values.body, model: values.model, user: values.user },
        dialogs.kind === 'skill-create' ? t('skillCreated') : t('skillSaved'))
        if (!result.ok) return result.error ?? t('formError')
        setDialog(null)
        return null
      }

      const toggleGroupRow = async (row, next) => {
        await act({ action: 'mcp-toggle', id: row.id, enabled: next })
      }

      const removeServer = async (row) => {
        const result = await act({ action: 'mcp-remove', id: row.id })
        if (result.ok) {
          pushToast('ok', t('remove'))
          setDialog(null)
        }
      }

      async function submitServer(form, server) {
        const result = await act({ action: 'mcp-save', server, previousName: form.previousName })
        if (!result.ok) return result.error ?? t('formError')
        setDialog(null)
        return null
      }

      const renderSkillRow = (row) => {
        const policyOptions = POLICY_STATES.map(state => ({ value: state.value, label: t(state.labelKey) }))
        return h('article', {
          key: row.path,
          className: 'ms-card',
          role: 'button',
          tabIndex: 0,
          onClick: () => { void openSkillView(row) },
          onKeyDown: (event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); void openSkillView(row) } },
        },
        h('span', { className: 'ms-dot ' + skillState(row) }),
        h('div', { className: 'ms-card-main' },
          h('div', { className: 'ms-card-title-row' },
            h('span', { className: 'ms-card-title' }, row.name),
            row.readOnly === true ? h('span', { className: 'ms-chip' }, t('readOnly')) : null),
          h('div', { className: 'ms-card-sub' }, row.error ? `${t('errorRow')} — ${row.error}` : (row.description || row.path))),
        h('div', { className: 'ms-card-actions', onClick: (event) => event.stopPropagation() },
          row.readOnly === true
            ? null
            : h(Select, {
              value: policyValue(row),
              size: 'sm',
              'aria-label': t('policyTitle'),
              options: policyOptions,
              onChange: (next) => { void setSkillPolicy(row, next) },
            }),
          row.readOnly === true
            ? null
            : h(IconButton, {
              title: t('edit'),
              onClick: async () => {
                setDialog({ kind: 'skill-edit', row, doc: null })
                const result = await props.dispatch({ action: 'skill-read', id: row.path })
                if (result.ok && result.payload?.skill) {
                  setDialog(current => current !== null && current.kind === 'skill-edit' && current.row.path === row.path
                    ? { ...current, doc: result.payload.skill }
                    : current)
                } else {
                  pushToast('error', result.error ?? t('loadFailed'))
                  setDialog(null)
                }
              },
            }, h(IconEdit, { size: 15 }))))
      }

      const renderServerRow = (row) => h('article', {
        key: row.id,
        className: 'ms-card',
        role: 'button',
        tabIndex: 0,
        onClick: () => setDialog({ kind: 'mcp-view', row }),
        onKeyDown: (event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); setDialog({ kind: 'mcp-view', row }) } },
      },
      h('span', { className: 'ms-dot ' + mcpState(row) }),
      h('div', { className: 'ms-card-main' },
        h('div', { className: 'ms-card-title-row' },
          h('span', { className: 'ms-card-title' }, row.serverName),
          row.managed === false ? h('span', { className: 'ms-chip' }, t('external')) : null),
        h('div', { className: 'ms-card-sub' }, row.detail || row.id)),
      h('div', { className: 'ms-card-actions', onClick: (event) => event.stopPropagation() },
        h('span', { className: 'ms-chip' }, row.transport),
        h('span', { className: 'ms-chip' }, `${t('tools')} ${row.tools ?? 0}`),
        h(Toggle, {
          checked: row.enabled === true,
          label: t('enabled'),
          onChange: (next) => { void toggleGroupRow(row, next) },
        }),
        h(IconButton, {
          title: t('edit'),
          onClick: () => setDialog({
            kind: 'mcp-form',
            row,
            previousName: row.serverName,
            values: serverToValues(row),
          }),
        }, h(IconEdit, { size: 15 }))))

      const renderGroups = (groups, rowsFor, renderRow, emptyText) => {
        if (rowsFor.length === 0) {
          return h(EmptyState, {
            icon: h(tab === 'skills' ? IconSkill : IconServer, { size: 18 }),
            title: emptyText,
            hint: needle.length > 0 ? t('emptyFiltered') : undefined,
          })
        }
        const visible = groups
          .map(group => ({ group, rows: rowsFor.filter(row => row.groupId === group.id) }))
          .filter(entry => entry.rows.length > 0)
        return h('div', { className: 'ms-groups' }, visible.map(({ group, rows }) => h('section', { key: group.id, className: 'ms-group' },
          h('button', {
            type: 'button',
            className: 'ms-group-head',
            'aria-expanded': isOpen(group),
            onClick: () => toggleGroup(group.id),
          },
          h('span', { className: 'ms-chevron' + (isOpen(group) ? ' is-open' : '') }, h(IconChevron, { size: 13 })),
          h('span', { className: 'ms-group-label' }, groupLabel(group)),
          group.path === undefined || group.path === null ? null : h('span', { className: 'ms-group-path' }, group.path),
          group.current === true ? h('span', { className: 'ms-group-current' }, t('currentProject')) : null,
          h('span', { className: 'ms-group-count' }, String(rows.length))),
          isOpen(group) ? h('div', { className: 'ms-cards' }, rows.map(renderRow)) : null)))
      }

      const skillGroups = snapshot.groups.filter(group => group.kind !== 'preset' || true)
      const mcpGroups = snapshot.groups.filter(group => group.kind === 'global' || group.kind === 'project' || group.kind === 'custom')

      const tabs = h('div', { className: 'ms-tabs', role: 'tablist' },
        tabButton('skills', t('skillsTab'), snapshot.skills.length),
        tabButton('mcp', t('mcpTab'), snapshot.mcp.length))

      function tabButton(id, label, count) {
        const active = tab === id
        return h('button', {
          key: id,
          type: 'button',
          role: 'tab',
          'aria-selected': active,
          className: 'ms-tab' + (active ? ' is-active' : ''),
          onClick: () => setTab(id),
        }, h('span', null, label), h('span', { className: 'ms-tab-count' }, String(count)))
      }

      const toolbar = h('div', { className: 'ms-toolbar' },
        h('div', { className: 'ms-search' },
          h(IconSearch, { size: 15 }),
          h('input', {
            value: query,
            placeholder: t('search'),
            'aria-label': t('search'),
            spellCheck: false,
            onChange: (event) => setQuery(event.target.value),
          })),
        h('div', { className: 'ms-toolbar-actions' },
          tab === 'skills'
            ? h(Button, { variant: 'primary', icon: h(IconPlus), onClick: () => setDialog({ kind: 'skill-create', values: null }) }, t('newSkill'))
            : h(Button, { variant: 'primary', icon: h(IconPlus), onClick: () => setDialog({ kind: 'mcp-form', values: emptyServer(), previousName: undefined }) }, t('addServer')),
          h(IconButton, { title: t('refresh'), onClick: () => { void props.load() } }, h(IconRefresh, { size: 15 }))))

      const banners = []
      if (snapshot.status === 'error') {
        banners.push(h(Banner, {
          key: 'error',
          kind: 'error',
          text: `${t('loadFailed')}：${snapshot.error}`,
          actions: h(Button, { size: 'sm', onClick: () => { void props.load() } }, t('retry')),
        }))
      }
      if (snapshot.notice === 'restartHint') {
        banners.push(h(Banner, { key: 'restart', kind: 'warn', text: t('restartHint') }))
      }

      const loading = snapshot.status === 'idle' || snapshot.status === 'loading'
      const body = loading
        ? h(Skeleton)
        : tab === 'skills'
          ? renderGroups(skillGroups, skills, renderSkillRow, t('emptySkills'))
          : renderGroups(mcpGroups, servers, renderServerRow, t('emptyMcp'))

      const meta = h('div', { className: 'ms-meta' },
        h('span', null, t('configPath'), ' ', h('code', null, snapshot.configPath ?? '—')),
        h('span', { className: 'ms-meta-sep' }, '·'),
        h('span', null, t('patchPath'), ' ', h('code', null, snapshot.profile?.patchPath ?? '—')),
        h('span', { className: 'ms-meta-sep' }, '·'),
        h('span', null, `${t('managedCount')} ${snapshot.managedCount ?? 0}`))

      const dialogs = []
      if (dialog?.kind === 'skill-view') {
        dialogs.push(h(SkillViewDialog, {
          key: 'skill-view',
          row: dialog.row,
          doc: dialog.doc,
          loading: dialog.loading === true,
          t,
          onClose: () => setDialog(null),
          onEdit: (doc) => setDialog({ kind: 'skill-edit', row: dialog.row, doc }),
        }))
      }
      if (dialog?.kind === 'skill-edit' && dialog.doc !== null) {
        dialogs.push(h(SkillEditorDialog, {
          key: 'skill-edit',
          mode: 'edit',
          initial: dialog.doc,
          roots: allRoots,
          t,
          onCancel: () => setDialog(null),
          onSubmit: (values) => submitSkill(dialog, values),
        }))
      }
      if (dialog?.kind === 'skill-create') {
        dialogs.push(h(SkillEditorDialog, {
          key: 'skill-create',
          mode: 'create',
          initial: null,
          roots: allRoots,
          t,
          onCancel: () => setDialog(null),
          onSubmit: (values) => submitSkill(dialog, values),
        }))
      }
      if (dialog?.kind === 'mcp-view') {
        dialogs.push(h(ServerViewDialog, {
          key: 'mcp-view',
          row: dialog.row,
          t,
          onClose: () => setDialog(null),
          onEdit: (row) => setDialog({ kind: 'mcp-form', row, previousName: row.serverName, values: serverToValues(row) }),
          onToggle: (next) => toggleGroupRow(dialog.row, next),
          onDelete: () => removeServer(dialog.row),
        }))
      }
      if (dialog?.kind === 'mcp-form') {
        dialogs.push(h(ServerEditorDialog, {
          key: 'mcp-form',
          mode: dialog.previousName === undefined ? 'create' : 'edit',
          initial: dialog.values ?? emptyServer(),
          t,
          onCancel: () => setDialog(null),
          onSubmit: (server) => submitServer(dialog, server),
        }))
      }

      return h('div', { className: presentation === 'panel' ? 'ms-root is-panel' : 'ms-root' },
        h('div', { className: 'ms-head' },
          h('div', { className: 'ms-title' }, t('title')),
          h('div', { className: 'ms-intro' }, t('intro'))),
        tabs,
        toolbar,
        ...banners,
        h('div', { className: 'ms-panel', role: 'tabpanel' }, body),
        meta,
        ...dialogs,
        toast === null ? null : h(Toast, {
          key: toast.id,
          id: toast.id,
          kind: toast.kind,
          text: toast.text,
          onDone: () => setToast(null),
        }))
    }

    /**
     * Sidebar glyph. This is the official `IconSkillOutlineRegular` artwork from
     * `@deepseek-ai/dsh-client-ui-primitives` (document + sparkle, 17-grid,
     * 1-unit stroke), copied here so the entry matches the sidebar's icon weight
     * without adding a client-module dependency.
     */
    function BoardNavIcon(props) {
      const size = typeof props.size === 'number' ? props.size : 18
      return h('svg', {
        width: size,
        height: size,
        viewBox: '0 0 17 17',
        fill: 'none',
        stroke: 'currentColor',
        strokeWidth: 1,
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        'aria-hidden': true,
      },
      h('path', { d: 'M4.57788 5.77124H10.7029' }),
      h('path', { d: 'M4.57788 8.89819H7.91879' }),
      h('path', {
        d: 'M12.1404 1.19446C12.9442 1.19446 13.6404 1.81999 13.6404 2.64465V8.89856H12.6404V2.64465C12.6404 2.42015 12.4411 2.19446 12.1404 2.19446H3.14038C2.83968 2.19446 2.64038 2.42015 2.64038 2.64465V13.0929C2.64082 13.3172 2.84001 13.5421 3.14038 13.5421H8.88159V14.5421H3.14038C2.33675 14.5421 1.6408 13.9172 1.64038 13.0929V2.64465C1.64038 1.81999 2.33651 1.19446 3.14038 1.19446H12.1404Z',
        fill: 'currentColor',
        stroke: 'none',
      }),
      h('path', {
        d: 'M12.0051 15.1056C12.0051 13.6395 10.8166 12.451 9.35059 12.451C10.8166 12.451 12.0051 11.2626 12.0051 9.79651C12.0051 11.2626 13.1936 12.451 14.6597 12.451C13.1936 12.451 12.0051 13.6395 12.0051 15.1056Z',
      }))
    }

    // -----------------------------------------------------------------------
    // Registration
    // -----------------------------------------------------------------------

    /**
     * Register the page: locale dictionary, stylesheet, and the three slot
     * contributions (main panel, sidebar entry, plugin-page section).
     * @param ctx - the browser plugin context.
     */
    function apply(ctx) {
      const source = createSource({
        status: 'idle',
        error: null,
        notice: null,
        pending: null,
        skills: [],
        mcp: [],
        groups: [],
        roots: [],
        profile: null,
        configPath: undefined,
        configErrors: [],
        managedCount: 0,
      })

      const setState = (patch) => source.set({ ...source.getSnapshot(), ...patch })

      /** The directory the GUI's current Session runs in, read per request. */
      const currentCwd = () => {
        try {
          const list = ctx.get('sessions')?.list?.getSnapshot()
          const id = list?.current
          const cwd = id === undefined ? undefined : list?.byId?.[id]?.cwd
          return typeof cwd === 'string' && cwd.length > 0 ? cwd : undefined
        } catch {
          return undefined
        }
      }

      const stateUrl = (cwd) => (cwd === undefined ? STATE_URL : `${STATE_URL}?cwd=${encodeURIComponent(cwd)}`)

      const adopt = (payload) => {
        setState({
          status: 'ready',
          error: null,
          skills: Array.isArray(payload.skills) ? payload.skills : [],
          mcp: Array.isArray(payload.mcp) ? payload.mcp : [],
          groups: Array.isArray(payload.groups) ? payload.groups : [],
          roots: Array.isArray(payload.roots) ? payload.roots : [],
          profile: payload.profile ?? null,
          configPath: payload.configPath,
          configErrors: Array.isArray(payload.configErrors) ? payload.configErrors : [],
          managedCount: typeof payload.managedCount === 'number' ? payload.managedCount : 0,
        })
      }

      const load = async (silent) => {
        if (silent !== true) setState({ status: source.getSnapshot().status === 'ready' ? 'ready' : 'loading', error: null })
        try {
          const response = await fetch(stateUrl(currentCwd()), { credentials: 'same-origin', headers: { accept: 'application/json' } })
          const payload = await response.json().catch(() => ({}))
          if (!response.ok) throw new Error(payload.message ?? `HTTP ${response.status}`)
          adopt(payload)
        } catch (error) {
          setState({ status: 'error', error: messageOf(error) })
        }
      }

      /**
       * Send one action. Resolves to { ok, payload, error }; a failed write is
       * reported to the caller, which keeps the open form in place.
       */
      const dispatch = async (action) => {
        setState({ pending: action.action, error: null, notice: null })
        try {
          const response = await fetch(ACTION_URL, {
            method: 'POST',
            credentials: 'same-origin',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ ...action, cwd: currentCwd() }),
          })
          const payload = await response.json().catch(() => ({}))
          if (!response.ok || payload.ok !== true) throw new Error(payload.message ?? `HTTP ${response.status}`)
          adopt(payload)
          if (payload.applied === 'restart') setState({ notice: 'restartHint' })
          setTimeout(() => { void load(true) }, 700)
          return { ok: true, payload, error: null }
        } catch (error) {
          const message = messageOf(error)
          setState({ error: message })
          return { ok: false, payload: null, error: message }
        } finally {
          setState({ pending: null })
        }
      }

      ctx.effect(() => ctx.locale.register(NS, DICTIONARIES), 'mcp-skills: dictionaries')
      ctx.effect(() => {
        if (document.querySelector(`style[data-plugin-css="${STYLE_ID}"]`) !== null) return () => {}
        const tag = document.createElement('style')
        tag.dataset.plugin = 'dsh-mcp-skills-board'
        tag.dataset.pluginCss = STYLE_ID
        tag.textContent = STYLES
        document.head.appendChild(tag)
        return () => { tag.remove() }
      }, 'mcp-skills: styles')

      // The sidebar is the primary entry: one click from anywhere. The same
      // component also renders inside the Plugins page's bundle section, where
      // the plugin manager draws the surrounding chrome (presentation differs).
      ctx.slots.inject('main', () => ctx.slots.register({
        name: 'main',
        key: PANEL_ID,
        locale: NS,
        inject: () => ({
          presentation: 'panel',
          hooks: { board: source },
          load,
          dispatch,
        }),
      }, BoardSection))
      ctx.slots.inject('sidebar.panellist', () => ctx.slots.register({
        name: 'sidebar.panellist',
        id: PANEL_ID,
        order: 30,
        locale: NS,
        label: () => ctx.locale.bind(NS)('nav'),
      }, BoardNavIcon))

      // The Plugins page declares one keyed slot per bundle that brings its own
      // configuration; the bundle's own detail page renders it between the
      // description and the component rows.
      ctx.slots.inject('plugins.bundle.config', () => ctx.slots.register({
        name: 'plugins.bundle.config',
        key: 'dsh-mcp-skills-board',
        locale: NS,
        inject: () => ({
          hooks: { board: source },
          load,
          dispatch,
        }),
      }, BoardSection))
    }

    exports.name = 'mcp-skills-client'
    exports.inject = ['slots', 'locale']
    exports.apply = apply
    return module.exports
  },
})
