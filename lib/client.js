/**
 * MCP & Skills board — browser half.
 *
 * Hand-written in the client module system's lazy-CJS factory form: executing
 * this file only REGISTERS the factory; the body runs on first materialization.
 * The only module-table word it uses is `react` (for createElement); `slots`
 * and `locale` arrive through Cordis.
 *
 * One Settings section, shaped after Codex's MCP and skills surfaces: a search
 * box, two tabs, status lights, one switch per row, expandable details, and an
 * "Add server" form whose fields mirror `[mcp_servers.*]` from config.toml.
 *
 * The registration id below MUST equal the package name: the client module
 * table matches a graph row on it.
 */
window.__ModuleLoader__.load({
  id: 'dsh-mcp-skills-board',
  factory: (require) => {
    var module = { exports: {} }
    var exports = module.exports

    const React = require('react')
    const h = React.createElement

    const NS = 'settings.mcpSkills'
    const STATE_URL = '/mcp-skills/state'
    const ACTION_URL = '/mcp-skills/action'
    const STYLE_ID = 'dsh-mcp-skills-board'
    /** The sidebar panel id; also the `main` slot key. */
    const PANEL_ID = 'mcp-skills'

    const DICTIONARIES = {
      zh: {
        nav: 'MCP 与技能',
        title: 'MCP 与技能',
        intro: '一处查看和开关本部署的技能与 MCP 服务器。改动即时生效，不需要重启进程。',
        search: '搜索名称、描述、命令或路径',
        skillsTab: '技能',
        mcpTab: 'MCP 服务',
        refresh: '刷新',
        add: '添加服务器',
        loading: '正在读取…',
        retry: '重试',
        loadFailed: '读取失败',
        empty: '没有匹配的条目',
        emptySkills: '没有发现技能。扫描根：',
        emptyMcp: '还没有 MCP 服务器。点「添加服务器」创建第一台。',
        enabled: '已启用',
        disabled: '已停用',
        policyTitle: '调用方式',
        policyEnabled: '启用',
        policyManual: '仅手动',
        policyModel: '仅模型',
        policyOff: '停用',
        details: '详情',
        description: '描述',
        whenToUse: '何时使用',
        path: '路径',
        source: '来源',
        bodyLines: '正文行数',
        modelInvocable: '模型可调用',
        userInvocable: '用户可调用',
        yes: '是',
        no: '否',
        entryId: '条目 id',
        transport: '传输',
        target: '目标',
        phase: '连接状态',
        toolCount: '工具数',
        tools: '工具',
        timeout: '超时',
        none: '无',
        globalGroup: '全局',
        currentProject: '当前项目',
        restartHint: '该 profile 不热重载 patch 层，本次改动将在下次启动 dsh 时生效。',
        errorRow: '该条目无法解析',
        readOnly: '只读',
        provider: '提供方',
        manageHint: '由本页管理',
        externalHint: '配置在别处',
        edit: '编辑',
        remove: '删除',
        confirmRemove: '确认删除？',
        removeConfirm: '只删除本页管理的服务器定义；确认删除？',
        addServer: '添加 MCP 服务器',
        editServer: '编辑 MCP 服务器',
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
      },
      en: {
        nav: 'MCP & Skills',
        title: 'MCP & Skills',
        intro: 'Inspect and toggle this deployment\'s skills and MCP servers. Changes apply immediately; no process restart.',
        search: 'Search name, description, command, or path',
        skillsTab: 'Skills',
        mcpTab: 'MCP servers',
        refresh: 'Refresh',
        add: 'Add server',
        loading: 'Reading…',
        retry: 'Retry',
        loadFailed: 'Read failed',
        empty: 'Nothing matches',
        emptySkills: 'No skills discovered. Scanned roots: ',
        emptyMcp: 'No MCP servers yet. Use "Add server" to create one.',
        enabled: 'Enabled',
        disabled: 'Disabled',
        policyTitle: 'Invocation',
        policyEnabled: 'Enabled',
        policyManual: 'Manual only',
        policyModel: 'Model only',
        policyOff: 'Off',
        details: 'Details',
        description: 'Description',
        whenToUse: 'When to use',
        path: 'Path',
        source: 'Source',
        bodyLines: 'Body lines',
        modelInvocable: 'Model invocable',
        userInvocable: 'User invocable',
        yes: 'Yes',
        no: 'No',
        entryId: 'Entry id',
        transport: 'Transport',
        target: 'Target',
        phase: 'Connection',
        toolCount: 'Tools',
        tools: 'Tools',
        timeout: 'Timeout',
        none: 'None',
        globalGroup: 'Global',
        currentProject: 'Current project',
        restartHint: 'This profile does not hot-reload its patch layer; the change applies on the next dsh launch.',
        errorRow: 'This entry cannot be parsed',
        readOnly: 'Read-only',
        provider: 'Provider',
        manageHint: 'Managed here',
        externalHint: 'Configured elsewhere',
        edit: 'Edit',
        remove: 'Remove',
        confirmRemove: 'Confirm removal?',
        removeConfirm: 'Remove this server definition from this page?',
        addServer: 'Add MCP server',
        editServer: 'Edit MCP server',
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
      },
    }

    const STYLES = `
.ms-root { display: flex; flex-direction: column; gap: 14px; padding: 2px 0 24px;
  width: 100%; box-sizing: border-box; }
/* The sidebar panel owns the whole main area, so it needs page padding; the
   plugin-page config section is already laid out by the plugin manager. */
.ms-root.is-panel { padding: 28px 36px 48px; max-width: 1080px; margin: 0 auto; }
.ms-root.is-panel .ms-title { font-size: 20px; }
.ms-root.is-panel .ms-intro { font-size: 13px; }
.ms-head { display: flex; flex-direction: column; gap: 4px; }
.ms-title { font-size: 16px; font-weight: 500; color: var(--dsw-alias-label-primary, #e6e6e6); }
.ms-intro { font-size: 13px; line-height: 20px; color: var(--dsw-alias-label-tertiary, #8a8f98); }
.ms-toolbar { display: flex; align-items: center; gap: 8px; flex-wrap: nowrap; }
.ms-search { flex: 1 1 auto; min-width: 0; height: 34px; padding: 0 12px; border-radius: 8px;
  border: 1px solid var(--dsw-alias-border-l2, rgba(255,255,255,0.12));
  background: var(--dsw-alias-bg-layer-2, rgba(255,255,255,0.04));
  color: var(--dsw-alias-label-primary, #e6e6e6); font-size: 13px; outline: none; }
.ms-search:focus { border-color: var(--dsw-alias-border-l4, rgba(255,255,255,0.24)); }
/* A real tab strip, not pills: buttons that look like buttons read as actions,
   and the two views must not be mistaken for the Add/Refresh actions beside
   them. One row, bottom rule, the active tab underlined. */
.ms-tabs { display: flex; align-items: stretch; gap: 20px; flex: 0 0 auto;
  border-bottom: 1px solid var(--dsw-alias-border-l1, rgba(255,255,255,0.06)); }
.ms-tab { position: relative; display: inline-flex; align-items: center; gap: 6px;
  height: 32px; padding: 0 2px; border: 0; background: none; cursor: pointer;
  font-family: inherit; font-size: 13px; white-space: nowrap;
  color: var(--dsw-alias-label-tertiary, #8a8f98); }
.ms-tab:hover { color: var(--dsw-alias-label-secondary, #a9adb6); }
.ms-tab.is-active { color: var(--dsw-alias-label-primary, #e6e6e6); font-weight: 500; }
.ms-tab.is-active::after { content: ""; position: absolute; left: 0; right: 0; bottom: -1px;
  height: 2px; border-radius: 1px; background: currentColor; }
.ms-tab:focus-visible { outline: 1px solid var(--dsw-alias-border-l4, rgba(255,255,255,0.24));
  outline-offset: -2px; border-radius: 6px 6px 0 0; }
.ms-tab-count { min-width: 18px; padding: 0 6px; border-radius: 9px; font-size: 11px; line-height: 16px;
  text-align: center; font-weight: 400;
  background: var(--dsw-alias-bg-layer-3, rgba(255,255,255,0.08));
  color: var(--dsw-alias-label-secondary, #a9adb6); }
.ms-panel { display: flex; flex-direction: column; gap: 14px; }
.ms-icon-btn { flex: 0 0 auto; width: 34px; height: 34px; border-radius: 8px; cursor: pointer;
  font-size: 15px; line-height: 1;
  border: 1px solid var(--dsw-alias-border-l2, rgba(255,255,255,0.12));
  background: transparent; color: var(--dsw-alias-label-secondary, #a9adb6); }
.ms-icon-btn:hover { background: var(--dsw-alias-bg-layer-3, rgba(255,255,255,0.08));
  color: var(--dsw-alias-label-primary, #e6e6e6); }
.ms-add { flex: 0 0 auto; height: 34px; padding: 0 12px; border-radius: 8px; cursor: pointer; font-size: 13px;
  border: 1px solid var(--dsw-alias-border-l2, rgba(255,255,255,0.12));
  background: var(--dsw-alias-bg-layer-3, rgba(255,255,255,0.08));
  color: var(--dsw-alias-label-primary, #e6e6e6); white-space: nowrap; }
.ms-add:hover { border-color: var(--dsw-alias-border-l4, rgba(255,255,255,0.24)); }
.ms-banner { padding: 10px 12px; border-radius: 8px; font-size: 13px;
  border: 1px solid var(--dsw-alias-border-l2, rgba(255,255,255,0.12));
  background: var(--dsw-alias-bg-layer-2, rgba(255,255,255,0.04));
  color: var(--dsw-alias-label-secondary, #a9adb6); }
.ms-banner.is-error { color: var(--dsw-static-red-400, #ff6b6b); border-color: currentColor; }
.ms-banner.is-warn { color: var(--dsw-static-amber-400, #f7ad31); border-color: currentColor; }
.ms-meta { font-size: 11px; color: var(--dsw-alias-label-tertiary, #8a8f98);
  display: flex; gap: 14px; flex-wrap: wrap; }
.ms-meta code { font-family: var(--ds-font-family-code, ui-monospace, monospace); }
.ms-groups { display: flex; flex-direction: column; gap: 18px; }
.ms-group-head { display: flex; align-items: baseline; gap: 8px; width: 100%; padding: 0 2px 6px;
  border: 0; background: none; cursor: pointer; text-align: left; font-family: inherit; }
.ms-group-head:hover .ms-group-label { color: var(--dsw-alias-label-primary, #e6e6e6); }
.ms-group-head:focus-visible { outline: 1px solid var(--dsw-alias-border-l4, rgba(255,255,255,0.24));
  outline-offset: 2px; border-radius: 6px; }
.ms-chevron { flex: 0 0 auto; align-self: center; color: var(--dsw-alias-label-tertiary, #8a8f98);
  transition: transform 120ms ease; font-size: 10px; }
.ms-group-head.is-open .ms-chevron { transform: rotate(90deg); }
.ms-group-label { font-size: 12px; font-weight: 500; color: var(--dsw-alias-label-secondary, #a9adb6); }
.ms-group-path { flex: 1 1 auto; min-width: 0; font-size: 11px; color: var(--dsw-alias-label-tertiary, #8a8f98);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.ms-group-current { flex: 0 0 auto; padding: 0 5px; border-radius: 6px; font-size: 10px;
  color: var(--dsw-alias-label-secondary, #a9adb6);
  background: var(--dsw-alias-bg-layer-2, rgba(255,255,255,0.06)); }
.ms-group-count { flex: 0 0 auto; font-size: 11px; color: var(--dsw-alias-label-tertiary, #8a8f98); }
.ms-grid { display: grid; grid-template-columns: 1fr; gap: 8px; }
.ms-card { border-radius: 10px; overflow: hidden;
  border: 1px solid var(--dsw-alias-border-l1, rgba(255,255,255,0.06));
  background: var(--dsw-alias-bg-layer-2, rgba(255,255,255,0.04)); }
.ms-card-main { display: flex; align-items: center; gap: 10px; padding: 10px 12px; }
.ms-card-text { flex: 1 1 auto; min-width: 0; }
.ms-card-title { font-size: 13px; font-weight: 500; color: var(--dsw-alias-label-primary, #e6e6e6);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.ms-card-sub { font-size: 12px; line-height: 18px; color: var(--dsw-alias-label-tertiary, #8a8f98);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.ms-card-right { display: flex; align-items: center; gap: 8px; flex: 0 0 auto; }
.ms-dot { width: 8px; height: 8px; border-radius: 50%; flex: 0 0 auto; background: #7f828a; }
.ms-dot.is-on { background: var(--dsw-static-green-400, #4ed17e); }
.ms-dot.is-warn { background: var(--dsw-static-amber-400, #f7ad31); }
.ms-dot.is-error { background: var(--dsw-static-red-400, #ff6b6b); }
.ms-dot.is-off { background: #7f828a; }
.ms-tag { font-size: 12px; color: var(--dsw-alias-label-secondary, #a9adb6); white-space: nowrap; }
.ms-chip { font-size: 11px; padding: 1px 6px; border-radius: 6px; white-space: nowrap;
  color: var(--dsw-alias-label-secondary, #a9adb6);
  background: var(--dsw-alias-bg-layer-3, rgba(255,255,255,0.08)); }
.ms-select { height: 26px; max-width: 132px; padding: 0 6px; border-radius: 6px; cursor: pointer; font-size: 12px;
  border: 1px solid var(--dsw-alias-border-l2, rgba(255,255,255,0.12));
  background: var(--dsw-alias-bg-layer-3, rgba(255,255,255,0.08));
  color: var(--dsw-alias-label-primary, #e6e6e6); }
.ms-select:disabled { opacity: 0.5; cursor: default; }
.ms-more { flex: 0 0 auto; display: inline-flex; align-items: center; justify-content: center;
  width: 26px; height: 26px; padding: 0; border-radius: 6px; cursor: pointer; font-size: 13px;
  border: 1px solid var(--dsw-alias-border-l2, rgba(255,255,255,0.12));
  background: var(--dsw-alias-bg-layer-3, rgba(255,255,255,0.08));
  color: var(--dsw-alias-label-secondary, #a9adb6); }
.ms-more:hover { color: var(--dsw-alias-label-primary, #e6e6e6); }
.ms-switch { position: relative; width: 32px; height: 18px; padding: 0; border-radius: 9px; cursor: pointer;
  border: 1px solid var(--dsw-alias-border-l3, rgba(255,255,255,0.18));
  background: var(--dsw-alias-bg-layer-3, rgba(255,255,255,0.08)); transition: background 120ms ease; }
.ms-switch.is-on { background: var(--dsw-static-green-500, #2fa763);
  border-color: var(--dsw-static-green-500, #2fa763); }
.ms-switch:disabled { opacity: 0.5; cursor: default; }
.ms-knob { position: absolute; top: 2px; left: 2px; width: 12px; height: 12px; border-radius: 50%;
  background: #ffffff; transition: transform 120ms ease; }
.ms-switch.is-on .ms-knob { transform: translateX(14px); }
.ms-details { margin: 0; padding: 4px 12px 12px; border-top: 1px solid var(--dsw-alias-border-l1, rgba(255,255,255,0.06));
  display: grid; grid-template-columns: 92px minmax(0, 1fr); gap: 4px 10px; font-size: 12px; }
.ms-details dt { color: var(--dsw-alias-label-tertiary, #8a8f98); }
.ms-details dd { margin: 0; min-width: 0; color: var(--dsw-alias-label-secondary, #a9adb6);
  overflow-wrap: anywhere; word-break: break-word; }
.ms-details dd.is-error { color: var(--dsw-static-red-400, #ff6b6b); }
.ms-details dd.ms-scroll { max-height: 156px; overflow-y: auto; overscroll-behavior: contain; }
.ms-tool { line-height: 18px; }
.ms-mono { font-family: var(--ds-font-family-code, ui-monospace, monospace); }
.ms-actions { grid-column: 1 / -1; display: flex; gap: 8px; padding-top: 4px; }
.ms-btn { height: 28px; padding: 0 10px; border-radius: 7px; cursor: pointer; font-size: 12px;
  border: 1px solid var(--dsw-alias-border-l2, rgba(255,255,255,0.12));
  background: transparent; color: var(--dsw-alias-label-secondary, #a9adb6); }
.ms-btn:hover { color: var(--dsw-alias-label-primary, #e6e6e6);
  background: var(--dsw-alias-bg-layer-3, rgba(255,255,255,0.08)); }
.ms-btn.is-danger { color: var(--dsw-static-red-400, #ff6b6b); border-color: currentColor; }
.ms-btn.is-primary { color: #ffffff; background: var(--dsw-static-blue-500, #3b82f6);
  border-color: transparent; }
.ms-btn:disabled { opacity: 0.55; cursor: default; }
.ms-form { border-radius: 10px; padding: 12px;
  border: 1px solid var(--dsw-alias-border-l2, rgba(255,255,255,0.12));
  background: var(--dsw-alias-bg-layer-2, rgba(255,255,255,0.05));
  display: flex; flex-direction: column; gap: 10px; }
.ms-form-title { font-size: 13px; font-weight: 500; color: var(--dsw-alias-label-primary, #e6e6e6); }
.ms-field { display: grid; grid-template-columns: 110px minmax(0, 1fr); gap: 8px; align-items: start; }
.ms-field-label { font-size: 12px; line-height: 28px; color: var(--dsw-alias-label-secondary, #a9adb6); }
.ms-field-body { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
.ms-input, .ms-textarea { width: 100%; box-sizing: border-box; border-radius: 7px; font-size: 12px;
  padding: 6px 8px;
  border: 1px solid var(--dsw-alias-border-l2, rgba(255,255,255,0.12));
  background: var(--dsw-alias-bg-layer-1, rgba(0,0,0,0.18));
  color: var(--dsw-alias-label-primary, #e6e6e6); outline: none;
  font-family: inherit; }
.ms-input { height: 28px; padding: 0 8px; }
.ms-textarea { min-height: 54px; resize: vertical; line-height: 18px;
  font-family: var(--ds-font-family-code, ui-monospace, monospace); }
.ms-input:focus, .ms-textarea:focus { border-color: var(--dsw-alias-border-l4, rgba(255,255,255,0.24)); }
.ms-hint { font-size: 11px; color: var(--dsw-alias-label-tertiary, #8a8f98); }
.ms-form-foot { display: flex; gap: 8px; justify-content: flex-end; padding-left: 118px; }
.ms-inline-switch { display: flex; align-items: center; gap: 8px; font-size: 12px;
  color: var(--dsw-alias-label-secondary, #a9adb6); }
.ms-form-error { font-size: 12px; color: var(--dsw-static-red-400, #ff6b6b); padding-left: 118px; }
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
      { value: '11', key: 'policyEnabled', dot: 'is-on' },
      { value: '01', key: 'policyManual', dot: 'is-warn' },
      { value: '10', key: 'policyModel', dot: 'is-on' },
      { value: '00', key: 'policyOff', dot: 'is-off' },
    ]

    /** One skill row's state key. */
    function skillState(row) {
      if (row.error) return 'is-error'
      return POLICY_STATES.find(state => state.value === policyValue(row))?.dot ?? 'is-off'
    }

    /** The two invocation bits of one skill row, as the selector value. */
    function policyValue(row) {
      return `${row.modelInvocable ? '1' : '0'}${row.userInvocable ? '1' : '0'}`
    }

    /** One MCP row's state, from enablement and the Loader's fiber phase. */
    function mcpState(row) {
      if (row.enabled !== true) return 'is-off'
      if (row.missing) return 'is-warn'
      if (row.phase === 'failed') return 'is-error'
      // A row that loaded but registers no tool usually means the server exited
      // or rejected the handshake; amber says "look at the details".
      if (row.phase === 'active') return row.tools > 0 ? 'is-on' : 'is-warn'
      return 'is-warn'
    }

    /** One-line message for one thrown value. */
    function messageOf(error) {
      return error instanceof Error ? error.message : String(error)
    }

    /** One definition-list label. */
    const dt = (label) => h('dt', null, label)

    /** One definition-list value, optionally styled or scrollable. */
    const dd = (value, className) => h('dd', className === undefined ? null : { className }, value)

    /**
     * The Settings page. Props are the framework shares: `useBoard` (the data
     * source bound to a selector hook), `load`/`dispatch`, `t`, and `close`.
     */
    function BoardSection(props) {
      const snapshot = props.useBoard((value) => value)
      const t = props.t
      const presentation = props.presentation === 'panel' ? 'panel' : 'page'
      const [query, setQuery] = React.useState('')
      const [tab, setTab] = React.useState('skills')
      const [open, setOpen] = React.useState({})
      const [groupOpen, setGroupOpen] = React.useState({})
      const [form, setForm] = React.useState(null)
      const [confirmRemove, setConfirmRemove] = React.useState(null)
      const [busy, setBusy] = React.useState(false)

      React.useEffect(() => {
        if (snapshot.status === 'idle') void props.load()
      }, [snapshot.status])

      const toggleOpen = (id) => setOpen(current => ({ ...current, [id]: current[id] !== true }))

      const groupIsOpen = (group, pinnedId) => {
        const chosen = groupOpen[group.id]
        if (chosen !== undefined) return chosen === true
        return pinnedId === undefined || group.id === pinnedId
      }

      const toggleGroup = (id, isOpen) => setGroupOpen(current => ({ ...current, [id]: !isOpen }))

      const needle = query.trim().toLowerCase()
      const matches = (haystack) => needle.length === 0 || haystack.toLowerCase().includes(needle)
      const skills = snapshot.skills.filter(row => matches(`${row.name} ${row.description} ${row.whenToUse} ${row.path}`))
      const servers = snapshot.mcp.filter(row => matches(`${row.serverName} ${row.detail} ${row.id} ${row.transport}`))

      const pinnedId = snapshot.groups.find(group => group.current)?.id

      const groupLabel = (group) => group.kind === 'global' ? t('globalGroup') : (group.label ?? group.path ?? group.id)

      const header = h('div', { className: 'ms-head' },
        h('div', { className: 'ms-title' }, t('title')),
        h('div', { className: 'ms-intro' }, t('intro')))

      const tabbar = h('div', { className: 'ms-tabs', role: 'tablist', 'aria-label': t('nav') },
        tabButton('skills', t('skillsTab'), snapshot.skills.length),
        tabButton('mcp', t('mcpTab'), snapshot.mcp.length))

      const toolbar = h('div', { className: 'ms-toolbar' },
        h('input', {
          className: 'ms-search',
          type: 'search',
          value: query,
          placeholder: t('search'),
          'aria-label': t('search'),
          spellCheck: false,
          onChange: (event) => setQuery(event.target.value),
        }),
        tab === 'mcp' && form === null
          ? h('button', {
            type: 'button',
            className: 'ms-add',
            onClick: () => setForm({ mode: 'add', values: emptyServer(), previousName: undefined, error: null }),
          }, '+ ' + t('add'))
          : null,
        h('button', {
          className: 'ms-icon-btn',
          type: 'button',
          title: t('refresh'),
          'aria-label': t('refresh'),
          disabled: snapshot.status === 'loading',
          onClick: () => { void props.load() },
        }, '↻'))

      function tabButton(id, label, count) {
        const activate = () => setTab(id)
        return h('button', {
          key: id,
          type: 'button',
          role: 'tab',
          id: `ms-tab-${id}`,
          'aria-selected': tab === id,
          'aria-controls': `ms-tabpanel-${id}`,
          tabIndex: tab === id ? 0 : -1,
          className: tab === id ? 'ms-tab is-active' : 'ms-tab',
          onClick: activate,
          onKeyDown: (event) => {
            if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return
            event.preventDefault()
            setTab(id === 'skills' ? 'mcp' : 'skills')
          },
        }, h('span', null, label), count === 0 ? null : h('span', { className: 'ms-tab-count' }, String(count)))
      }

      const banners = []
      if (snapshot.status === 'error' && snapshot.error) {
        banners.push(h('div', { key: 'err', className: 'ms-banner is-error' },
          `${t('loadFailed')}：${snapshot.error}`, ' ',
          h('button', { type: 'button', className: 'ms-btn', onClick: () => { void props.load() } }, t('retry'))))
      }
      if (snapshot.notice === 'restartHint') {
        banners.push(h('div', { key: 'notice', className: 'ms-banner is-warn' }, t('restartHint')))
      }
      if (Array.isArray(snapshot.configErrors) && snapshot.configErrors.length > 0) {
        banners.push(h('div', { key: 'cfg', className: 'ms-banner is-warn' }, snapshot.configErrors.join(' · ')))
      }
      const busyBanner = snapshot.pending === null
        ? null
        : h('div', { key: 'pending', className: 'ms-banner' }, t('pending'))

      const meta = h('div', { className: 'ms-meta' },
        snapshot.configPath === undefined ? null : h('span', null, t('configPath'), ' ', h('code', null, snapshot.configPath)),
        snapshot.profile === null || snapshot.profile === undefined ? null : h('span', null, t('patchPath'), ' ', h('code', null, snapshot.profile.patchPath)),
        snapshot.managedCount === undefined ? null : h('span', null, t('managedCount'), ' ', h('code', null, String(snapshot.managedCount))))

      const body = []
      if (snapshot.status === 'loading' && snapshot.skills.length === 0) {
        body.push(h('div', { key: 'loading', className: 'ms-banner' }, t('loading')))
      } else if (tab === 'skills') {
        body.push(renderSkills())
      } else {
        body.push(renderMcp())
      }

      function renderSkills() {
        if (skills.length === 0) {
          return h('div', { key: 'empty', className: 'ms-banner' },
            t('emptySkills'), ' ',
            (snapshot.roots ?? []).map(root => h('code', { key: root.path, className: 'ms-mono' }, root.path + '  ')))
        }
        const contents = []
        for (const group of snapshot.groups) {
          const rows = skills.filter(row => row.groupId === group.id)
          if (rows.length === 0) continue
          const isOpen = groupIsOpen(group, pinnedId)
          contents.push(h('section', { key: group.id, className: 'ms-group' },
            h('button', {
              type: 'button',
              className: isOpen ? 'ms-group-head is-open' : 'ms-group-head',
              onClick: () => toggleGroup(group.id, isOpen),
            },
            h('span', { className: 'ms-chevron' }, '▶'),
            h('span', { className: 'ms-group-label' }, groupLabel(group)),
            group.path === null || group.path === undefined ? null : h('span', { className: 'ms-group-path' }, group.path),
            group.current ? h('span', { className: 'ms-group-current' }, t('currentProject')) : null,
            h('span', { className: 'ms-group-count' }, String(rows.length))),
            isOpen ? h('div', { className: 'ms-grid' }, rows.map(renderSkillRow)) : null))
        }
        return h('div', { key: 'skills', className: 'ms-groups' }, contents)
      }

      function renderSkillRow(row) {
        const isOpen = open[row.id] === true
        const control = row.readOnly === true
          ? h('span', { className: 'ms-chip', title: t('readOnly') }, t('readOnly'))
          : h('select', {
            className: 'ms-select',
            value: policyValue(row),
            disabled: row.error !== null || snapshot.pending !== null,
            'aria-label': t('policyTitle'),
            onChange: (event) => {
              const value = event.target.value
              void props.dispatch({ action: 'skill', id: row.id, model: value[0] === '1', user: value[1] === '1' })
            },
          }, POLICY_STATES.map(state => h('option', { key: state.value, value: state.value }, t(state.key))))

        const detailRows = []
        if (isOpen) {
          detailRows.push(h(React.Fragment, { key: 'desc' }, dt(t('description')), dd(row.description || t('none'))))
          detailRows.push(h(React.Fragment, { key: 'when' }, dt(t('whenToUse')), dd(row.whenToUse || t('none'))))
          if (row.path) detailRows.push(h(React.Fragment, { key: 'path' }, dt(t('path')), dd(h('code', { className: 'ms-mono' }, row.path))))
          detailRows.push(h(React.Fragment, { key: 'src' },
            dt(t('source')),
            dd(row.readOnly === true
              ? [row.source, row.provider].filter(part => typeof part === 'string' && part.length > 0).join(' · ') || t('none')
              : row.rootPath)))
          if (row.readOnly !== true) {
            detailRows.push(h(React.Fragment, { key: 'body' }, dt(t('bodyLines')), dd(String(row.bodyLines))))
          }
          detailRows.push(h(React.Fragment, { key: 'model' }, dt(t('modelInvocable')), dd(row.modelInvocable ? t('yes') : t('no'))))
          detailRows.push(h(React.Fragment, { key: 'user' }, dt(t('userInvocable')), dd(row.userInvocable ? t('yes') : t('no'))))
          if (row.error) detailRows.push(h(React.Fragment, { key: 'err' }, dt(t('details')), dd(row.error, 'is-error')))
        }

        return h('div', { key: row.id, className: 'ms-card' },
          h('div', { className: 'ms-card-main' },
            h('span', { className: 'ms-dot ' + skillState(row) }),
            h('div', { className: 'ms-card-text' },
              h('div', { className: 'ms-card-title' }, row.name),
              h('div', { className: 'ms-card-sub' }, row.error ? t('errorRow') + ' — ' + row.error : (row.description || row.path))),
            h('div', { className: 'ms-card-right' },
              control,
              h('button', {
                type: 'button',
                className: 'ms-more',
                title: t('details'),
                'aria-expanded': isOpen,
                onClick: () => toggleOpen(row.id),
              }, isOpen ? '−' : '+'))),
          isOpen ? h('dl', { className: 'ms-details' }, detailRows) : null)
      }

      function renderMcp() {
        const formCard = form === null ? null : renderForm()
        if (servers.length === 0 && form === null) {
          return h('div', { key: 'empty', className: 'ms-banner' }, t('emptyMcp'))
        }
        const contents = []
        if (formCard !== null) contents.push(formCard)
        for (const group of snapshot.groups) {
          const rows = servers.filter(row => row.groupId === group.id)
          if (rows.length === 0) continue
          // MCP rows are few; a list hidden behind a collapsed header reads as
          // an empty page right after adding the first server.
          const chosen = groupOpen[group.id]
          const isOpen = chosen === undefined ? true : chosen === true
          contents.push(h('section', { key: group.id, className: 'ms-group' },
            h('button', {
              type: 'button',
              className: isOpen ? 'ms-group-head is-open' : 'ms-group-head',
              onClick: () => toggleGroup(group.id, isOpen),
            },
            h('span', { className: 'ms-chevron' }, '▶'),
            h('span', { className: 'ms-group-label' }, groupLabel(group)),
            group.path === null || group.path === undefined ? null : h('span', { className: 'ms-group-path' }, group.path),
            group.current ? h('span', { className: 'ms-group-current' }, t('currentProject')) : null,
            h('span', { className: 'ms-group-count' }, String(rows.length))),
            isOpen ? h('div', { className: 'ms-grid' }, rows.map(renderMcpRow)) : null))
        }
        return h('div', { key: 'mcp', className: 'ms-groups' }, contents)
      }

      function renderMcpRow(row) {
        const isOpen = open[row.id] === true
        const details = isOpen
          ? h('dl', { className: 'ms-details' },
            dt(t('entryId')), dd(h('code', { className: 'ms-mono' }, row.id)),
            dt(t('transport')), dd(row.transport),
            dt(t('target')), dd(h('code', { className: 'ms-mono' }, row.detail || t('none'))),
            dt(t('timeout')), dd(`${row.toolCallTimeoutMs} ms`),
            dt(t('phase')), dd(row.missing ? t('missingRow') : (row.phase ?? t('none'))),
            dt(t('tools')), row.toolNames.length === 0 ? dd(t('none')) : dd(row.toolNames.map(name => h('div', { key: name, className: 'ms-tool ms-mono' }, name)), 'ms-scroll'),
            h('div', { className: 'ms-actions' },
              row.managed && !row.missing
                ? h('button', {
                  type: 'button',
                  className: 'ms-btn',
                  onClick: () => setForm({ mode: 'edit', values: serverToValues(row), previousName: row.serverName, error: null }),
                }, t('edit'))
                : h('span', { className: 'ms-hint' }, t('externalHint')),
              row.managed && !row.missing
                ? h('button', {
                  type: 'button',
                  className: 'ms-btn is-danger',
                  disabled: snapshot.pending !== null,
                  onClick: () => {
                    if (confirmRemove === row.id) {
                      setConfirmRemove(null)
                      void props.dispatch({ action: 'mcp-remove', id: row.id })
                      return
                    }
                    setConfirmRemove(row.id)
                  },
                }, confirmRemove === row.id ? t('confirmRemove') : t('remove'))
                : null))
          : null

        return h('div', { key: row.id, className: 'ms-card' },
          h('div', { className: 'ms-card-main' },
            h('span', { className: 'ms-dot ' + mcpState(row) }),
            h('div', { className: 'ms-card-text' },
              h('div', { className: 'ms-card-title' }, row.serverName),
              h('div', { className: 'ms-card-sub' }, row.missing ? t('missingRow') : (row.detail || row.id))),
            h('div', { className: 'ms-card-right' },
              h('span', { className: 'ms-chip' }, row.transport === 'streamable-http' ? 'HTTP' : 'stdio'),
              h('span', { className: 'ms-tag' }, `${t('toolCount')} ${row.tools}`),
              h('button', {
                type: 'button',
                role: 'switch',
                'aria-checked': row.enabled === true,
                'aria-label': row.enabled === true ? t('enabled') : t('disabled'),
                title: row.enabled === true ? t('enabled') : t('disabled'),
                className: row.enabled === true ? 'ms-switch is-on' : 'ms-switch',
                disabled: snapshot.pending !== null,
                onClick: () => { void props.dispatch({ action: 'mcp-toggle', id: row.id, enabled: row.enabled !== true }) },
              }, h('span', { className: 'ms-knob' })),
              h('button', {
                type: 'button',
                className: 'ms-more',
                title: t('details'),
                'aria-expanded': isOpen,
                onClick: () => toggleOpen(row.id),
              }, isOpen ? '−' : '+'))),
          details)
      }

      function renderForm() {
        const values = form.values
        const setValue = (key) => (event) => {
          setForm({ ...form, values: { ...form.values, [key]: event.target.value }, error: null })
        }
        const setBool = (key) => (event) => {
          setForm({ ...form, values: { ...form.values, [key]: event.target.checked }, error: null })
        }

        const field = (label, control, hint) => h('label', { className: 'ms-field' },
          h('span', { className: 'ms-field-label' }, label),
          h('span', { className: 'ms-field-body' }, control, hint ? h('span', { className: 'ms-hint' }, hint) : null))

        const input = (key, placeholder) => h('input', {
          className: 'ms-input', type: 'text', value: values[key], placeholder: placeholder ?? '',
          spellCheck: false, onChange: setValue(key),
        })
        const textarea = (key, placeholder) => h('textarea', {
          className: 'ms-textarea', value: values[key], placeholder: placeholder ?? '',
          spellCheck: false, onChange: setValue(key),
        })

        const stdio = values.transport === 'stdio'
        return h('div', { key: 'form', className: 'ms-form' },
          h('div', { className: 'ms-form-title' }, form.mode === 'add' ? t('addServer') : t('editServer')),
          field(t('name'), input('name'), t('nameHint')),
          field(t('transport'), h('select', {
            className: 'ms-select',
            value: values.transport,
            onChange: setValue('transport'),
          },
          h('option', { value: 'stdio' }, 'stdio'),
          h('option', { value: 'streamable-http' }, 'streamable-http'))),
          stdio
            ? [
              field(t('command'), input('command', 'npx'), t('required')),
              field(t('args'), textarea('args', '-y\n@modelcontextprotocol/server-filesystem'), t('argsHint')),
              field(t('env'), textarea('env', 'GITHUB_TOKEN=...'), t('envHint')),
              field(t('cwd'), input('cwd', ''), t('cwdHint')),
            ]
            : [
              field(t('url'), input('url', 'https://example.com/mcp'), t('required')),
              field(t('headers'), textarea('headers', 'Authorization: Bearer ...'), t('headersHint')),
            ],
          field(t('toolCallTimeoutMs'), h('input', {
            className: 'ms-input', type: 'number', min: '1000', max: '600000', step: '1000',
            value: values.toolCallTimeoutMs, onChange: setValue('toolCallTimeoutMs'),
          })),
          h('div', { className: 'ms-field' },
            h('span', { className: 'ms-field-label' }),
            h('span', { className: 'ms-inline-switch' },
              h('button', {
                type: 'button',
                role: 'switch',
                'aria-checked': values.enabled === true,
                className: values.enabled === true ? 'ms-switch is-on' : 'ms-switch',
                onClick: () => setForm({ ...form, values: { ...form.values, enabled: form.values.enabled !== true } }),
              }, h('span', { className: 'ms-knob' })),
              t('enableOnAdd'))),
          form.error === null ? null : h('div', { className: 'ms-form-error' }, `${t('formError')}：${form.error}`),
          h('div', { className: 'ms-form-foot' },
            h('button', {
              type: 'button',
              className: 'ms-btn',
              disabled: busy,
              onClick: () => setForm(null),
            }, t('cancel')),
            h('button', {
              type: 'button',
              className: 'ms-btn is-primary',
              disabled: busy,
              onClick: submitForm,
            }, busy ? t('saving') : t('save'))))
      }

      async function submitForm() {
        if (form === null || busy) return
        const values = form.values
        const name = values.name.trim()
        if (!/^[A-Za-z0-9_-]{1,32}$/.test(name)) {
          setForm({ ...form, error: t('invalidName') })
          return
        }
        const stdio = values.transport === 'stdio'
        if (stdio && values.command.trim().length === 0) {
          setForm({ ...form, error: t('invalidCommand') })
          return
        }
        if (!stdio && !/^https?:\/\//.test(values.url.trim())) {
          setForm({ ...form, error: t('invalidUrl') })
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
        const result = await props.dispatch({ action: 'mcp-save', server, previousName: form.previousName })
        setBusy(false)
        if (result === true) setForm(null)
        else setForm(current => (current === null ? current : { ...current, error: typeof result === 'string' ? result : t('formError') }))
      }

      return h('div', { className: presentation === 'panel' ? 'ms-root is-panel' : 'ms-root' },
        header, tabbar, toolbar,
        ...banners,
        busyBanner,
        h('div', {
          className: 'ms-panel',
          role: 'tabpanel',
          id: `ms-tabpanel-${tab}`,
          'aria-labelledby': `ms-tab-${tab}`,
        }, ...body),
        meta)
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

    /** One empty add-form value set. */
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

    /**
     * Register the page: locale dictionary, stylesheet, and the one Settings
     * section contribution.
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
       * Send one action. Returns whether the write was accepted; a failed write
       * is reported through the shared snapshot and the current form stays open.
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
          // The composition re-applies asynchronously; refresh the live status.
          setTimeout(() => { void load(true) }, 700)
          return true
        } catch (error) {
          const message = messageOf(error)
          setState({ error: message })
          return message
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
      // description and the component rows. That is where this board belongs:
      // MCP servers and skills are plugin-manager surfaces, not preferences.
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
