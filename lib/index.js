/**
 * MCP & Skills board — Host half.
 *
 * One Settings page over two resource kinds, shaped after Codex's MCP and
 * skills surfaces: a flat list you can search, a status light and one switch
 * per row, and an "Add server" form that matches the composer in Codex's
 * desktop app.
 *
 * MCP servers live as `@deepseek-ai/dsh-mcp-client` rows. The panel owns a
 * managed block in the profile's `cordis.patch.yml`; the block is regenerated
 * from `$DSH_HOME/mcp-skills.json`, the single source of truth for the servers
 * this page manages. Rows declared elsewhere stay editable for enablement via
 * id-targeted overrides and are never rewritten.
 *
 * Toggling is hot:
 * - a skill flips by rewriting its frontmatter flags, which the filesystem
 *   provider watches, so the next `agent/pre-step` republishes the catalog;
 * - an MCP row flips by rewriting the patch file, which a `patchReload: live`
 *   profile re-applies through config HMR.
 *
 * All writes are text surgery or atomic replacement, never a YAML round-trip:
 * the user's file keeps every comment and formatting choice outside the
 * managed block.
 *
 * @module dsh-mcp-skills-board
 */

import { readFile, writeFile, readdir, rename, chmod, stat, mkdir, rm, rmdir } from 'node:fs/promises'
import { join, resolve, basename, dirname } from 'node:path'
import { homedir } from 'node:os'

/** Cordis function-plugin name. */
export const name = 'mcp-skills'

/** The module name an MCP server row is composed from. */
const MCP_MODULE = '@deepseek-ai/dsh-mcp-client'

/** This package's own name, used to find the profile it is installed in. */
const OWN_PACKAGE = 'dsh-mcp-skills-board'

const STATE_ROUTE = '/mcp-skills/state'
const ACTION_ROUTE = '/mcp-skills/action'
const BROWSE_ROUTE = '/mcp-skills/browse'

/** Managed-block fences for the profile patch file. */
const BLOCK_START = '# >>> dsh-mcp-skills-board (managed — edit MCP servers from Settings → MCP & Skills)'
const BLOCK_END = '# <<< dsh-mcp-skills-board'

/** The sidecar holding every server this page manages. */
const CONFIG_NAME = 'mcp-skills.json'

/** A skill file larger than this is not worth reading; the provider would too. */
const MAX_SKILL_BYTES = 512 * 1024

/** Action bodies carry one server definition; anything larger is hostile. */
const MAX_BODY_BYTES = 256 * 1024

const MAX_CWD_BYTES = 4096
const MAX_PROJECTS = 64

/** Cordis fiber states, in the order the enum declares them. */
const PHASES = ['pending', 'loading', 'active', 'failed', 'disposed', 'unloading']

/** Frontmatter keys this board reads and writes. */
const KEY_DISABLE_MODEL = 'disable-model-invocation'
const KEY_USER_INVOCABLE = 'user-invocable'

/** The group every row belongs to when no project owns it. */
const GLOBAL_GROUP = 'global'

/** Field ceilings; a malformed form fails here, not halfway through a write. */
const LIMITS = {
  name: 32,
  command: 4096,
  arg: 8192,
  args: 64,
  env: 64,
  headers: 64,
  url: 8192,
  timeout: 600000,
}

/**
 * Mount the board: register the two routes once a webserver exists.
 *
 * `webServer` is read through `ctx.inject` so a profile without a browser
 * transport (headless, sdk, acp) simply mounts nothing.
 *
 * @param ctx - the plugin context.
 * @param config - optional deployment overrides.
 */
export function apply(ctx, config = {}) {
  const settings = resolveSettings(config)
  ctx.inject(['webServer'], (webCtx) => {
    webCtx.effect(() => webCtx.webServer.register({
      kind: 'exact',
      path: STATE_ROUTE,
      handler: (req, res) => handleState(ctx, settings, req, res),
    }), `mcp-skills: GET ${STATE_ROUTE}`)
    webCtx.effect(() => webCtx.webServer.register({
      kind: 'exact',
      path: ACTION_ROUTE,
      handler: (req, res) => handleAction(ctx, settings, req, res),
    }), `mcp-skills: POST ${ACTION_ROUTE}`)
    webCtx.effect(() => webCtx.webServer.register({
      kind: 'exact',
      path: BROWSE_ROUTE,
      handler: (req, res) => handleBrowse(ctx, settings, req, res),
    }), `mcp-skills: GET ${BROWSE_ROUTE}`)
  })
}

// ---------------------------------------------------------------------------
// Configuration & settings
// ---------------------------------------------------------------------------

/**
 * Resolve the deployment-varying paths once, at mount.
 * @param config - raw plugin configuration.
 * @returns absolute paths and extra skill roots.
 */
function resolveSettings(config) {
  if (config === null || typeof config !== 'object') {
    throw new TypeError('mcp-skills: config must be an object')
  }
  const extraRoots = config.skillRoots === undefined ? [] : config.skillRoots
  if (!Array.isArray(extraRoots)) throw new TypeError('mcp-skills: skillRoots must be a string array')
  const maxProjects = config.maxSkillProjects ?? MAX_PROJECTS
  if (!Number.isSafeInteger(maxProjects) || maxProjects < 1) {
    throw new TypeError('mcp-skills: maxSkillProjects must be a positive integer')
  }
  return {
    dshHome: optionalPath(config.dshHome, 'dshHome') ?? resolve(process.env.DSH_HOME ?? join(homedir(), '.dsh')),
    agentsHome: optionalPath(config.agentsHome, 'agentsHome') ?? resolve(process.env.DSH_AGENTS_HOME ?? join(homedir(), '.agents')),
    projectRoot: optionalPath(config.projectRoot, 'projectRoot') ?? resolve(process.cwd()),
    patchPath: optionalPath(config.patchPath, 'patchPath'),
    maxProjects,
    extraRoots: extraRoots.map((root, index) => {
      const path = optionalPath(root, `skillRoots[${index}]`)
      if (path === undefined) throw new TypeError(`mcp-skills: skillRoots[${index}] must be a non-empty string`)
      return path
    }),
  }
}

/** One optional absolute path from configuration. */
function optionalPath(value, label) {
  if (value === undefined || value === null) return undefined
  if (typeof value !== 'string' || value.length === 0) {
    throw new TypeError(`mcp-skills: ${label} must be a non-empty string`)
  }
  return resolve(value)
}

/** Every project root this deployment knows about, deduplicated and bounded. */
function projectRoots(ctx, settings) {
  const roots = []
  const registry = ctx.get('workspaceRegistry')
  if (registry !== undefined && typeof registry.list === 'function') {
    try {
      for (const workspace of registry.list()) {
        if (typeof workspace?.path === 'string' && workspace.path.length > 0) roots.push(resolve(workspace.path))
      }
    } catch {
      // A registry that cannot answer falls back to the process's own project.
    }
  }
  if (roots.length === 0) roots.push(settings.projectRoot)
  return [...new Set(roots)].sort().slice(0, settings.maxProjects)
}

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------

/** Answer `GET /mcp-skills/browse?path=<absolute directory>`. */
async function handleBrowse(ctx, settings, req, res) {
  if (refuse(ctx, req, res)) return
  if (req.method !== 'GET') {
    sendMethodNotAllowed(res, 'GET')
    return
  }
  try {
    const projects = projectRoots(ctx, settings)
    const url = new URL(String(req.url), 'http://localhost')
    const requested = url.searchParams.get('path')
    const start = requested === null || requested.trim().length === 0
      ? resolve(settings.projectRoot ?? homedir())
      : resolve(expandUser(requested.trim()))
    const listing = await listDirectories(start)
    sendJson(res, 200, { ...listing, roots: browseRoots(settings, projects) })
  } catch (error) {
    sendJson(res, 500, { code: 'browse-failed', message: messageOf(error) })
  }
}

/** Quick-jump locations offered by the folder picker. */
function browseRoots(settings, projects) {
  const roots = [
    { label: '~', path: homedir() },
    ...projects.map(project => ({ label: basename(project), path: project })),
    { label: '.dsh/skills', path: join(settings.dshHome, 'skills') },
    { label: '.agents/skills', path: join(settings.agentsHome, 'skills') },
    ...settings.extraRoots.map(path => ({ label: basename(path), path })),
  ]
  const seen = new Set()
  const quick = []
  for (const root of roots) {
    if (typeof root.path !== 'string' || root.path.length === 0) continue
    const resolved = resolve(root.path)
    if (seen.has(resolved)) continue
    seen.add(resolved)
    quick.push({ label: root.label, path: resolved })
  }
  return quick
}

/** Expand a leading `~` so typed paths match what the picker shows. */
function expandUser(path) {
  const text = String(path ?? '')
  if (text === '~') return homedir()
  if (text.startsWith('~/') || text.startsWith('~\\')) return join(homedir(), text.slice(2))
  return text
}

/** One directory listing for the folder picker. */
async function listDirectories(path) {
  const parent = dirname(path)
  let entries
  try {
    entries = await readdir(path, { withFileTypes: true })
  } catch (error) {
    if (error?.code === 'ENOENT') return { path, parent: parent === path ? null : parent, entries: [], missing: true }
    return { path, parent: parent === path ? null : parent, entries: [], error: messageOf(error) }
  }
  const directories = []
  for (const entry of entries) {
    const child = join(path, entry.name)
    if (entry.isDirectory()) {
      directories.push({ name: entry.name, path: child, hidden: entry.name.startsWith('.') })
    } else if (entry.isSymbolicLink()) {
      try {
        if ((await stat(child)).isDirectory()) directories.push({ name: entry.name, path: child, hidden: entry.name.startsWith('.') })
      } catch {
        // a dangling or unreadable link is not a directory the picker can enter
      }
    }
  }
  directories.sort((left, right) => (left.hidden === right.hidden ? left.name.localeCompare(right.name) : left.hidden ? 1 : -1))
  return { path, parent: parent === path ? null : parent, entries: directories.slice(0, 500) }
}

/** Answer `GET /mcp-skills/state`. */
async function handleState(ctx, settings, req, res) {
  if (refuse(ctx, req, res)) return
  if (req.method !== 'GET') {
    sendMethodNotAllowed(res, 'GET')
    return
  }
  try {
    const projects = projectRoots(ctx, settings)
    const requested = requestedProject(queryParam(req, 'cwd'))
    sendJson(res, 200, await statePayload(ctx, settings, projects, requested))
  } catch (error) {
    sendJson(res, 500, { code: 'state-failed', message: messageOf(error) })
  }
}

/** Answer `POST /mcp-skills/action`. */
async function handleAction(ctx, settings, req, res) {
  if (refuse(ctx, req, res)) return
  if (req.method !== 'POST') {
    sendMethodNotAllowed(res, 'POST')
    return
  }
  const essence = String(req.headers['content-type']).split(';', 1)[0]?.trim().toLowerCase()
  if (essence !== 'application/json') {
    sendJson(res, 415, { code: 'unsupported-media-type', message: 'content-type must be application/json' })
    return
  }
  const text = await readBoundedBody(req)
  if (text === null) {
    sendJson(res, 413, { code: 'payload-too-large', message: 'request body is too large' })
    return
  }
  let parsed
  try {
    parsed = JSON.parse(text)
  } catch {
    sendJson(res, 400, { code: 'bad-json', message: 'request body must be JSON' })
    return
  }
  try {
    const projects = projectRoots(ctx, settings)
    const config = await readConfig(settings)
    const action = parsed?.action
    let extra = null
    if (action === 'skill') {
      const { id, model, user } = parsed
      if (typeof id !== 'string' || typeof model !== 'boolean' || typeof user !== 'boolean') {
        sendJson(res, 400, { code: 'bad-request', message: 'expected { action:"skill", id, model, user }' })
        return
      }
      await writeSkillPolicy(settings, projects, id, { model, user })
    } else if (action === 'skill-read') {
      if (typeof parsed.id !== 'string') {
        sendJson(res, 400, { code: 'bad-request', message: 'expected { action:"skill-read", id }' })
        return
      }
      extra = { skill: await readSkillDoc(settings, projects, parsed.id) }
    } else if (action === 'skill-create') {
      await createSkill(settings, projects, parsed)
    } else if (action === 'skill-save') {
      await saveSkill(settings, projects, parsed)
    } else if (action === 'mcp-import') {
      if (typeof parsed.text !== 'string') {
        sendJson(res, 400, { code: 'bad-request', message: 'expected { action:"mcp-import", text }' })
        return
      }
      extra = { importResult: await importServers(ctx, settings, projects, config, parsed.text, parsed.format) }
    } else if (action === 'mcp-export') {
      extra = { export: exportSnapshot(config) }
    } else if (action === 'skill-rename') {
      await renameSkill(settings, projects, parsed)
    } else if (action === 'skill-duplicate') {
      await duplicateSkill(settings, projects, parsed)
    } else if (action === 'skill-delete') {
      await deleteSkill(settings, projects, parsed)
    } else if (action === 'mcp-toggle') {
      if (typeof parsed.id !== 'string' || typeof parsed.enabled !== 'boolean') {
        sendJson(res, 400, { code: 'bad-request', message: 'expected { action:"mcp-toggle", id, enabled }' })
        return
      }
      await toggleMcp(ctx, settings, projects, config, parsed.id, parsed.enabled)
    } else if (action === 'mcp-save') {
      if (parsed.server === null || typeof parsed.server !== 'object') {
        sendJson(res, 400, { code: 'bad-request', message: 'expected { action:"mcp-save", server }' })
        return
      }
      await saveMcp(ctx, settings, projects, config, parsed.server, typeof parsed.previousName === 'string' ? parsed.previousName : undefined)
    } else if (action === 'mcp-remove') {
      if (typeof parsed.id !== 'string') {
        sendJson(res, 400, { code: 'bad-request', message: 'expected { action:"mcp-remove", id }' })
        return
      }
      await removeMcp(settings, config, parsed.id)
    } else {
      sendJson(res, 400, { code: 'bad-request', message: `unknown action: ${String(action)}` })
      return
    }
    const payload = await statePayload(ctx, settings, projects, requestedProject(parsed.cwd))
    sendJson(res, 200, {
      ok: true,
      applied: payload.profile?.patchReload === 'startup' ? 'restart' : 'hot',
      ...payload,
      ...(extra ?? {}),
    })
  } catch (error) {
    sendJson(res, 409, { code: 'action-failed', message: messageOf(error) })
  }
}

/**
 * The full payload both routes answer with. Building it in one place keeps a
 * change answer identical to a state answer: the page replaces its whole
 * snapshot on every change.
 */
async function statePayload(ctx, settings, projects, requested) {
  const [diskSkills, profile, config] = await Promise.all([
    collectSkills(settings, projects),
    resolveProfile(settings),
    readConfig(settings),
  ])
  // Preset-bound skills are provided by the engine on a per-preset scope; they
  // are listed read-only because their files live inside the installed bundle.
  const preset = await collectPresetSkills(ctx, new Set(diskSkills.map(skill => skill.name)))
  const groups = [...groupsFor(settings, projects, pinnedProject(settings, projects, requested)), ...preset.groups]
  return {
    skills: [...diskSkills, ...preset.rows],
    mcp: collectMcp(ctx, projects, config),
    groups,
    roots: skillRoots(settings, projects).map(root => ({
      id: root.id,
      path: root.path,
      groupId: root.groupId,
      writable: root.id !== 'bundled',
      label: root.id === 'user-dsh'
        ? join('~', '.dsh', 'skills')
        : root.id === 'user-agents' ? join('~', '.agents', 'skills') : root.path,
    })),
    profile: profile === undefined
      ? null
      : { name: profile.name, patchPath: profile.patchPath, patchReload: profile.patchReload, detected: profile.detected },
    configPath: configPath(settings),
    configErrors: config.errors,
    managedCount: config.servers.length,
  }
}

/**
 * Skills contributed by agent presets, read through the scoped skill registry.
 *
 * dsh 0.2 mounts each preset's plugins into its own registry scope, so the
 * scope is the only supported read. Ambient skills (host-scope and on-disk)
 * are subtracted, and a name seen once is not repeated per preset.
 */
async function collectPresetSkills(ctx, diskNames) {
  const presets = ctx.get('agentPresets')
  const skills = ctx.get('skills')
  if (presets === undefined || skills === undefined) return { rows: [], groups: [] }
  if (typeof presets.list !== 'function' || typeof skills.list !== 'function') return { rows: [], groups: [] }
  let list
  try {
    list = await presets.list()
  } catch {
    return { rows: [], groups: [] }
  }
  const hostNames = new Set()
  try {
    for (const summary of (await skills.list({})) ?? []) {
      if (summary !== null && typeof summary?.name === 'string') hostNames.add(summary.name)
    }
  } catch {
    // An unreadable host catalog just means no subtraction.
  }
  const rows = []
  const groups = []
  const seen = new Set()
  for (const preset of Array.isArray(list) ? list : []) {
    const id = typeof preset?.id === 'string' ? preset.id : ''
    if (id.length === 0 || typeof preset.broken === 'string') continue
    let lease
    try {
      lease = typeof presets.acquireScope === 'function' ? await presets.acquireScope(id) : undefined
    } catch {
      continue
    }
    let found = []
    try {
      found = await skills.list({ scope: lease?.key })
    } catch {
      found = []
    } finally {
      try { await lease?.[Symbol.asyncDispose]?.() } catch { /* already released */ }
    }
    const groupId = `preset:${id}`
    const groupRows = []
    for (const summary of Array.isArray(found) ? found : []) {
      const name = typeof summary?.name === 'string' ? summary.name : ''
      if (name.length === 0 || seen.has(name) || diskNames.has(name) || hostNames.has(name)) continue
      seen.add(name)
      const path = typeof summary.path === 'string' ? summary.path : ''
      groupRows.push({
        id: `preset:${id}:${name}`,
        name,
        description: typeof summary.description === 'string' ? summary.description : '',
        whenToUse: typeof summary.whenToUse === 'string' ? summary.whenToUse : '',
        groupId,
        root: 'preset',
        rootPath: '',
        path,
        bodyLines: 0,
        modelInvocable: summary.invocation?.modelInvocable !== false,
        userInvocable: summary.invocation?.userInvocable !== false,
        hasFrontmatter: true,
        readOnly: true,
        source: typeof summary.source === 'string' ? summary.source : '',
        provider: typeof summary.provider === 'string' ? summary.provider : '',
        error: null,
      })
    }
    if (groupRows.length > 0) {
      groups.push({ id: groupId, kind: 'preset', label: typeof preset.name === 'string' && preset.name.length > 0 ? preset.name : id, path: null, current: false })
      rows.push(...groupRows)
    }
  }
  return { rows, groups }
}

/** The sidecar path. */
function configPath(settings) {
  return join(settings.dshHome, CONFIG_NAME)
}

// ---------------------------------------------------------------------------
// Groups and roots
// ---------------------------------------------------------------------------

/** The group id for one project root. */
function projectGroupId(project) {
  return `project:${project}`
}

/** Whether a path is the project itself or something inside it. */
function isInside(project, path) {
  return path === project || path.startsWith(project + sep(project))
}

/** The separator that must follow a root path for it to contain a child. */
function sep(path) {
  return path.endsWith('\\') || path.endsWith('/') ? '' : (process.platform === 'win32' ? '\\' : '/')
}

/**
 * The groups a page renders: the current project first, then the global group,
 * the other project roots, and the configured extra roots.
 */
function groupsFor(settings, projects, pinned) {
  const groups = [{ id: GLOBAL_GROUP, kind: 'global', path: null, current: false }]
  for (const project of projects) {
    groups.push({
      id: projectGroupId(project),
      kind: 'project',
      label: basename(project),
      path: project,
      current: pinned !== undefined && samePath(project, pinned),
    })
  }
  for (const path of settings.extraRoots) {
    groups.push({ id: `root:${path}`, kind: 'custom', label: basename(path), path, current: false })
  }
  return [...groups.filter(group => group.current), ...groups.filter(group => !group.current)]
}

/**
 * The skill roots scanned, each tagged with the group it feeds.
 */
function skillRoots(settings, projects) {
  const roots = [
    { id: 'user-dsh', path: join(settings.dshHome, 'skills'), groupId: GLOBAL_GROUP },
    { id: 'user-agents', path: join(settings.agentsHome, 'skills'), groupId: GLOBAL_GROUP },
    { id: 'bundled', path: process.env.DSH_BUNDLED_SKILL_DIR ?? '', groupId: GLOBAL_GROUP },
  ].filter(root => root.path.length > 0)
  for (const project of projects) {
    const groupId = projectGroupId(project)
    roots.push({ id: 'project-dsh', path: join(project, '.dsh', 'skills'), groupId })
    roots.push({ id: 'project-agents', path: join(project, '.agents', 'skills'), groupId })
  }
  for (const path of settings.extraRoots) roots.push({ id: 'custom', path, groupId: `root:${path}` })
  return roots
}

/** Whether two absolute paths name the same directory on this platform. */
function samePath(left, right) {
  if (left === right) return true
  return process.platform === 'win32' && left.toLowerCase() === right.toLowerCase()
}

/** The project whose group the page pins. */
function pinnedProject(settings, projects, requested) {
  if (requested !== undefined) {
    const match = projects.find(project => samePath(project, requested))
    if (match !== undefined) return match
  }
  return projects.find(project => samePath(project, settings.projectRoot)) ?? projects[0]
}

// ---------------------------------------------------------------------------
// Skills
// ---------------------------------------------------------------------------

/**
 * Discover every skill on disk, highest-priority root first.
 */
async function collectSkills(settings, projects) {
  const rows = []
  for (const root of skillRoots(settings, projects)) {
    let entries
    try {
      entries = await readdir(root.path, { withFileTypes: true })
    } catch {
      continue // an absent root is the normal case, not a failure
    }
    const found = []
    for (const entry of entries) {
      if (entry.name.startsWith('.')) continue
      if (entry.isDirectory()) {
        found.push(await readSkill(join(root.path, entry.name, 'SKILL.md'), root, entry.name))
      } else if (entry.isFile() && entry.name.endsWith('.md')) {
        found.push(await readSkill(join(root.path, entry.name), root, basename(entry.name, '.md')))
      }
    }
    found.sort((left, right) => left.name.localeCompare(right.name))
    rows.push(...found)
  }
  return rows
}

/** Parse one skill file into a row. */
async function readSkill(path, root, fallbackName) {
  let text
  try {
    text = await readFile(path, 'utf8')
  } catch (error) {
    return failedRow(path, root, fallbackName, messageOf(error))
  }
  if (text.length > MAX_SKILL_BYTES) {
    return failedRow(path, root, fallbackName, `file exceeds ${MAX_SKILL_BYTES} bytes`)
  }
  const front = splitFrontmatter(text)
  if (front.error !== undefined) return failedRow(path, root, fallbackName, front.error)
  const fields = parseFields(front.lines)
  const name = fields.get('name') ?? fallbackName
  const disableModel = readBoolean(fields.get(KEY_DISABLE_MODEL))
  const userInvocable = readBoolean(fields.get(KEY_USER_INVOCABLE))
  if (disableModel.error !== undefined) return failedRow(path, root, name, disableModel.error)
  if (userInvocable.error !== undefined) return failedRow(path, root, name, userInvocable.error)
  return {
    id: path,
    name,
    description: fields.get('description') ?? '',
    whenToUse: fields.get('whenToUse') ?? fields.get('when-to-use') ?? '',
    groupId: root.groupId,
    root: root.id,
    rootPath: root.path,
    path,
    bodyLines: front.body.trim().length === 0 ? 0 : front.body.trim().split(/\r?\n/).length,
    modelInvocable: disableModel.value !== true,
    userInvocable: userInvocable.value !== false,
    hasFrontmatter: front.hasFrontmatter,
    error: null,
  }
}

/** One row for a skill that could not be read or parsed. */
function failedRow(path, root, name, error) {
  return {
    id: path,
    name,
    description: '',
    whenToUse: '',
    groupId: root.groupId,
    root: root.id,
    rootPath: root.path,
    path,
    bodyLines: 0,
    modelInvocable: false,
    userInvocable: false,
    hasFrontmatter: false,
    error,
  }
}

/** Split a skill file into its frontmatter lines and body. */
function splitFrontmatter(text) {
  const lines = text.split(/\r?\n/)
  if (lines[0]?.trim() !== '---') {
    return { hasFrontmatter: false, lines: [], body: text, error: 'missing YAML frontmatter' }
  }
  let end = -1
  for (let index = 1; index < lines.length; index += 1) {
    if (lines[index].trim() === '---') {
      end = index
      break
    }
  }
  if (end < 0) return { hasFrontmatter: false, lines: [], body: text, error: 'unterminated YAML frontmatter' }
  return {
    hasFrontmatter: true,
    lines: lines.slice(1, end),
    body: lines.slice(end + 1).join('\n'),
    error: undefined,
  }
}

/** Read the simple `key: value` pairs of a frontmatter block. */
function parseFields(lines) {
  const fields = new Map()
  for (const line of lines) {
    const match = /^(?<key>[A-Za-z][A-Za-z0-9_-]*)\s*:\s*(?<value>.*)$/.exec(line)
    if (match?.groups === undefined) continue
    fields.set(match.groups.key, unquote(match.groups.value.trim()))
  }
  return fields
}

/** Strip one layer of matching quotes. */
function unquote(value) {
  if (value.length >= 2 && ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'")))) {
    return value.slice(1, -1)
  }
  return value
}

/** Read a frontmatter boolean using the spellings the local provider accepts. */
function readBoolean(value) {
  if (value === undefined) return { value: undefined, error: undefined }
  const normalized = value.toLowerCase()
  if (['true', 'yes', 'on', '1'].includes(normalized)) return { value: true, error: undefined }
  if (['false', 'no', 'off', '0'].includes(normalized)) return { value: false, error: undefined }
  return { value: undefined, error: `invalid boolean for a frontmatter key: ${value}` }
}

/**
 * Write one skill's invocation policy into its frontmatter.
 * `true` is the provider default and REMOVES the key; `false` writes it.
 */
async function writeSkillPolicy(settings, projects, path, policy) {
  const roots = skillRoots(settings, projects)
  const root = roots.find(candidate => path.startsWith(candidate.path + sep(candidate.path)))
  if (root === undefined) throw new Error(`${path} is not inside a scanned skill root`)
  const skills = await collectSkills(settings, projects)
  const row = skills.find(skill => skill.id === path)
  if (row === undefined) throw new Error(`unknown skill: ${path}`)
  if (row.error !== null) throw new Error(`${path}: ${row.error}`)
  if (row.modelInvocable === policy.model && row.userInvocable === policy.user) return
  const text = await readFile(path, 'utf8')
  const front = splitFrontmatter(text)
  if (front.error !== undefined) throw new Error(`${path}: ${front.error}`)
  const lines = text.split(/\r?\n/)
  const close = front.lines.length + 1
  const owned = [KEY_DISABLE_MODEL, KEY_USER_INVOCABLE].map(key => new RegExp(`^\\s*${key}\\s*:`))
  const kept = lines.slice(1, close).filter(line => !owned.some(pattern => pattern.test(line)))
  if (!policy.model) kept.push(`${KEY_DISABLE_MODEL}: true`)
  if (!policy.user) kept.push(`${KEY_USER_INVOCABLE}: false`)
  const next = [lines[0], ...kept, ...lines.slice(close)].join('\n')
  if (next === text) return
  await atomicWrite(path, next)
}

// ---------------------------------------------------------------------------
// Skill authoring (create / read / save)
// ---------------------------------------------------------------------------

/** A kebab-case skill directory name. */
const SKILL_DIR_NAME = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

/** Write one YAML scalar for a skill frontmatter value. */
function skillYamlScalar(value) {
  const text = String(value ?? '')
    .replace(/[\r\n]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  if (text.length === 0) return "''"
  const plain = /^[\p{L}\p{N}_][\p{L}\p{N} _.,'()/+\-]*$/u.test(text)
  const reserved = /^(true|false|yes|no|on|off|null|~|-?[0-9.]+)$/i.test(text)
  if (plain && !reserved && !text.includes(': ') && !text.includes(' #')) return text
  return JSON.stringify(text)
}

/** One required, single-line frontmatter value. */
function singleLine(value, field, max) {
  const text = String(value ?? '').trim()
  if (text.length === 0) throw new Error(`${field} is required`)
  if (/[\r\n]/.test(String(value ?? ''))) throw new Error(`${field} must be a single line`)
  if (text.length > max) throw new Error(`${field} is too long (max ${max} characters)`)
  return text
}

/** Split one skill file path into the editable document the page needs. */
async function readSkillDoc(settings, projects, path) {
  const root = skillRoots(settings, projects).find(candidate => path.startsWith(candidate.path + sep(candidate.path)))
  if (root === undefined) throw new Error(`${path} is not inside a scanned skill root`)
  let text
  try {
    text = await readFile(path, 'utf8')
  } catch (error) {
    throw new Error(`${path}: ${messageOf(error)}`)
  }
  if (text.length > MAX_SKILL_BYTES) throw new Error(`${path}: file exceeds ${MAX_SKILL_BYTES} bytes`)
  const front = splitFrontmatter(text)
  if (front.error !== undefined) throw new Error(`${path}: ${front.error}`)
  const fields = parseFields(front.lines)
  const fallback = basename(path) === 'SKILL.md' ? basename(dirname(path)) : basename(path, '.md')
  return {
    id: path,
    name: fields.get('name') ?? fallback,
    description: fields.get('description') ?? '',
    whenToUse: fields.get('whenToUse') ?? fields.get('when-to-use') ?? '',
    body: front.body.replace(/^\r?\n+/, ''),
    modelInvocable: readBoolean(fields.get(KEY_DISABLE_MODEL)).value !== true,
    userInvocable: readBoolean(fields.get(KEY_USER_INVOCABLE)).value !== false,
    path,
    root: root.id,
    readOnly: root.id === 'bundled',
  }
}

/** The skill roots the page may write into. The bundled root is read-only. */
function writableSkillRoots(settings, projects) {
  return skillRoots(settings, projects).filter(root => root.id !== 'bundled')
}

/** Build the frontmatter block, keeping unknown keys from the previous file. */
function skillDocument({ name, description, whenToUse, model, user, body, kept }) {
  const lines = ['---', `name: ${skillYamlScalar(name)}`, `description: ${skillYamlScalar(description)}`]
  if (String(whenToUse ?? '').trim().length > 0) lines.push(`whenToUse: ${skillYamlScalar(whenToUse)}`)
  if (model === false) lines.push(`${KEY_DISABLE_MODEL}: true`)
  if (user === false) lines.push(`${KEY_USER_INVOCABLE}: false`)
  lines.push(...kept, '---')
  const text = body.trim()
  return text.length === 0 ? `${lines.join('\n')}\n` : `${lines.join('\n')}\n\n${text}\n`
}

/** Create `<root>/<name>/SKILL.md`. Refuses to overwrite anything. */
async function createSkill(settings, projects, input) {
  const writable = writableSkillRoots(settings, projects)
  const chosenPath = typeof input?.rootPath === 'string' && input.rootPath.trim().length > 0 ? resolve(expandUser(input.rootPath.trim())) : null
  let root
  let base
  if (chosenPath === null) {
    root = writable.find(candidate => candidate.id === input?.root)
    if (root === undefined) throw new Error('unknown skill root')
    base = root.path
  } else {
    root = writable.find(candidate => {
      const candidatePath = resolve(candidate.path)
      return chosenPath === candidatePath || chosenPath.startsWith(candidatePath + sep(candidatePath))
    })
    if (root === undefined) throw new Error('the chosen folder is not inside a writable skill root')
    base = chosenPath
  }
  const name = singleLine(input?.name, 'name', 64)
  if (!SKILL_DIR_NAME.test(name)) throw new Error('name must be kebab-case: lowercase letters, digits and dashes')
  const description = singleLine(input?.description, 'description', 2000)
  const whenToUse = String(input?.whenToUse ?? '').trim()
  if (/[\r\n]/.test(whenToUse)) throw new Error('whenToUse must be a single line')
  if (whenToUse.length > 2000) throw new Error('whenToUse is too long (max 2000 characters)')
  const body = String(input?.body ?? '')
  if (body.length > MAX_BODY_BYTES) throw new Error('body is too large')
  const dir = join(base, name)
  const file = join(dir, 'SKILL.md')
  try {
    await stat(file)
    throw new Error(`a skill named ${name} already exists`)
  } catch (error) {
    if (error?.code !== 'ENOENT') throw error
  }
  const text = skillDocument({ name, description, whenToUse, model: input?.model, user: input?.user, body, kept: [] })
  await mkdir(dir, { recursive: true })
  await atomicWrite(file, text)
  return file
}

/** Rewrite one existing skill's frontmatter values and body. */
async function saveSkill(settings, projects, input) {
  const path = String(input?.id ?? '')
  const root = writableSkillRoots(settings, projects).find(candidate => path.startsWith(candidate.path + sep(candidate.path)))
  if (root === undefined) throw new Error('skill is not inside a writable skill root')
  const rows = await collectSkills(settings, projects)
  const row = rows.find(candidate => candidate.id === path)
  if (row === undefined) throw new Error(`unknown skill: ${path}`)
  if (row.error !== null) throw new Error(`${path}: ${row.error}`)
  const description = singleLine(input?.description, 'description', 2000)
  const whenToUse = String(input?.whenToUse ?? '').trim()
  if (/[\r\n]/.test(whenToUse)) throw new Error('whenToUse must be a single line')
  if (whenToUse.length > 2000) throw new Error('whenToUse is too long (max 2000 characters)')
  const body = String(input?.body ?? '')
  if (body.length > MAX_BODY_BYTES) throw new Error('body is too large')
  const previous = await readFile(path, 'utf8')
  const front = splitFrontmatter(previous)
  if (front.error !== undefined) throw new Error(`${path}: ${front.error}`)
  const owned = /^\s*(name|description|when-?to-?use|disable-model-invocation|user-invocable)\s*:/i
  const kept = front.lines.filter(line => !owned.test(line))
  const text = skillDocument({ name: row.name, description, whenToUse, model: input?.model, user: input?.user, body, kept })
  await atomicWrite(path, text)
  return path
}

// ---------------------------------------------------------------------------
// Skill rename / duplicate / delete
// ---------------------------------------------------------------------------

/** The writable root that contains one absolute path, if any. */
function writableRootFor(settings, projects, path) {
  const resolved = resolve(path)
  return writableSkillRoots(settings, projects).find(candidate => {
    const rootPath = resolve(candidate.path)
    return resolved === rootPath || resolved.startsWith(rootPath + sep(rootPath))
  })
}

/** One existing, editable skill row. */
async function editableSkill(settings, projects, id) {
  const path = String(id ?? '')
  const root = writableRootFor(settings, projects, path)
  if (root === undefined) throw new Error('skill is not inside a writable skill root')
  const rows = await collectSkills(settings, projects)
  const row = rows.find(candidate => candidate.id === path)
  if (row === undefined) throw new Error(`unknown skill: ${path}`)
  if (row.error !== null) throw new Error(`${path}: ${row.error}`)
  return { row, root, path }
}

/** Rename the `name` key of one skill file, keeping every other line. */
function renamedSkillText(text, name) {
  const front = splitFrontmatter(text)
  if (front.error !== undefined) throw new Error(front.error)
  const lines = text.split(/\r?\n/)
  const close = front.lines.length + 1
  const managed = lines.slice(1, close)
  const index = managed.findIndex(line => /^\s*name\s*:/.test(line))
  if (index >= 0) managed[index] = `name: ${skillYamlScalar(name)}`
  else managed.unshift(`name: ${skillYamlScalar(name)}`)
  return [lines[0], ...managed, ...lines.slice(close)].join('\n')
}

/** Move a skill to `<rootPath>/<name>/SKILL.md` (or `<name>.md` for flat files). */
async function renameSkill(settings, projects, input) {
  const { row, root, path } = await editableSkill(settings, projects, input?.id)
  const name = singleLine(input?.name, 'name', 64)
  if (!SKILL_DIR_NAME.test(name)) throw new Error('name must be kebab-case: lowercase letters, digits and dashes')
  const maybeRoot = input?.rootPath === undefined || String(input.rootPath).trim().length === 0
    ? root
    : writableRootFor(settings, projects, resolve(expandUser(String(input.rootPath).trim())))
  if (maybeRoot === undefined) throw new Error('the chosen folder is not inside a writable skill root')
  const directoryStyle = basename(path) === 'SKILL.md'
  const target = directoryStyle
    ? join(resolve(expandUser(String(input.rootPath ?? maybeRoot.path))), name, 'SKILL.md')
    : join(resolve(expandUser(String(input.rootPath ?? maybeRoot.path))), `${name}.md`)
  if (target === path) return path
  try {
    await stat(target)
    throw new Error(`a skill named ${name} already exists there`)
  } catch (error) {
    if (error?.code !== 'ENOENT') throw error
  }
  await mkdir(dirname(target), { recursive: true })
  await rename(path, target)
  const moved = await readFile(target, 'utf8')
  const rewritten = renamedSkillText(moved, name)
  if (rewritten !== moved) await atomicWrite(target, rewritten)
  if (directoryStyle) {
    try {
      const parent = dirname(path)
      const rest = await readdir(parent)
      if (rest.length === 0) await rmdir(parent)
    } catch {
      // leaving an empty directory behind is harmless
    }
  }
  return target
}

/** Copy one skill to a new name/location, rewriting its frontmatter name. */
async function duplicateSkill(settings, projects, input) {
  const { row, root, path } = await editableSkill(settings, projects, input?.id)
  const name = singleLine(input?.name, 'name', 64)
  if (!SKILL_DIR_NAME.test(name)) throw new Error('name must be kebab-case: lowercase letters, digits and dashes')
  const rootPath = input?.rootPath === undefined || String(input.rootPath).trim().length === 0
    ? resolve(root.path)
    : resolve(expandUser(String(input.rootPath).trim()))
  if (writableRootFor(settings, projects, rootPath) === undefined) throw new Error('the chosen folder is not inside a writable skill root')
  const directoryStyle = basename(path) === 'SKILL.md'
  const target = directoryStyle ? join(rootPath, name, 'SKILL.md') : join(rootPath, `${name}.md`)
  try {
    await stat(target)
    throw new Error(`a skill named ${name} already exists there`)
  } catch (error) {
    if (error?.code !== 'ENOENT') throw error
  }
  const text = await readFile(path, 'utf8')
  await mkdir(dirname(target), { recursive: true })
  await atomicWrite(target, renamedSkillText(text, name))
  return target
}

/** Delete one skill file; a directory left empty is removed too. */
async function deleteSkill(settings, projects, input) {
  const { path } = await editableSkill(settings, projects, input?.id)
  const directoryStyle = basename(path) === 'SKILL.md'
  await rm(path, { force: true })
  if (directoryStyle) {
    try {
      const parent = dirname(path)
      const rest = await readdir(parent)
      if (rest.length === 0) await rmdir(parent)
    } catch {
      // leftover directory is harmless
    }
  }
  return path
}

// ---------------------------------------------------------------------------
// Import & export (Claude/Cursor JSON, Codex TOML, this plugin's own JSON)
// ---------------------------------------------------------------------------

/** Strip a TOML comment outside of strings. */
function stripTomlComment(line) {
  let quote = null
  for (let index = 0; index < line.length; index += 1) {
    const char = line[index]
    if (quote !== null) {
      if (char === '\\' && quote === '"') { index += 1; continue }
      if (char === quote) quote = null
      continue
    }
    if (char === '"' || char === "'") { quote = char; continue }
    if (char === '#') return line.slice(0, index)
  }
  return line
}

/** Whether a TOML value is syntactically complete (brackets and quotes closed). */
function tomlValueComplete(value) {
  let square = 0
  let curly = 0
  let quote = null
  for (let index = 0; index < value.length; index += 1) {
    const char = value[index]
    if (quote !== null) {
      if (char === '\\' && quote === '"') { index += 1; continue }
      if (char === quote) quote = null
      continue
    }
    if (char === '"' || char === "'") quote = char
    else if (char === '[') square += 1
    else if (char === ']') square -= 1
    else if (char === '{') curly += 1
    else if (char === '}') curly -= 1
  }
  return quote === null && square <= 0 && curly <= 0
}

/** Split a TOML key path on dots, outside of quotes. */
function tomlKeyPath(text) {
  const parts = []
  let current = ''
  let quote = null
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index]
    if (quote !== null) {
      if (char === '\\' && quote === '"') { current += char + (text[index + 1] ?? ''); index += 1; continue }
      if (char === quote) { quote = null; continue }
      current += char
      continue
    }
    if (char === '"' || char === "'") { quote = char; continue }
    if (char === '.') { parts.push(current.trim()); current = ''; continue }
    current += char
  }
  if (current.trim().length > 0) parts.push(current.trim())
  return parts
}

/** Parse a TOML scalar/array/inline table into plain JS values. */
function parseTomlValue(text) {
  const value = text.trim()
  if (value.length === 0) throw new Error('empty TOML value')
  if (value.startsWith('"') && value.endsWith('"')) {
    try { return JSON.parse(value) } catch { return value.slice(1, -1) }
  }
  if (value.startsWith("'") && value.endsWith("'")) return value.slice(1, -1)
  if (value.startsWith('[') && value.endsWith(']')) {
    const inner = value.slice(1, -1)
    const items = splitTomlList(inner)
    return items.map(item => parseTomlValue(item))
  }
  if (value.startsWith('{') && value.endsWith('}')) {
    const map = {}
    for (const item of splitTomlList(value.slice(1, -1))) {
      const eq = findTopLevel(item, '=')
      if (eq < 0) throw new Error(`invalid TOML table entry: ${item}`)
      const key = tomlKeyPath(item.slice(0, eq)).join('.')
      map[key] = parseTomlValue(item.slice(eq + 1))
    }
    return map
  }
  if (value === 'true') return true
  if (value === 'false') return false
  if (/^[+-]?[0-9]+(\.[0-9]+)?$/.test(value)) return Number(value)
  return value
}

/** Find the first top-level occurrence of one character, outside quotes/brackets. */
function findTopLevel(text, target) {
  let quote = null
  let square = 0
  let curly = 0
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index]
    if (quote !== null) {
      if (char === '\\' && quote === '"') { index += 1; continue }
      if (char === quote) quote = null
      continue
    }
    if (char === '"' || char === "'") { quote = char; continue }
    if (char === '[') square += 1
    else if (char === ']') square -= 1
    else if (char === '{') curly += 1
    else if (char === '}') curly -= 1
    else if (char === target && square === 0 && curly === 0) return index
  }
  return -1
}

/** Split a TOML array/inline-table body on top-level commas. */
function splitTomlList(text) {
  const items = []
  let current = ''
  let quote = null
  let square = 0
  let curly = 0
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index]
    if (quote !== null) {
      if (char === '\\' && quote === '"') { current += char + (text[index + 1] ?? ''); index += 1; continue }
      if (char === quote) quote = null
      current += char
      continue
    }
    if (char === '"' || char === "'") { quote = char; current += char; continue }
    if (char === '[') square += 1
    else if (char === ']') square -= 1
    else if (char === '{') curly += 1
    else if (char === '}') curly -= 1
    else if (char === ',' && square === 0 && curly === 0) { items.push(current); current = ''; continue }
    current += char
  }
  if (current.trim().length > 0) items.push(current)
  return items
}

/** Parse the TOML subset Codex writes for `[mcp_servers.*]`. */
function parseToml(text) {
  const root = {}
  let current = root
  const lines = String(text).split(/\r?\n/)
  for (let index = 0; index < lines.length; index += 1) {
    const line = stripTomlComment(lines[index]).trim()
    if (line.length === 0) continue
    if (line.startsWith('[[')) throw new Error('array tables are not supported')
    if (line.startsWith('[') && line.endsWith(']')) {
      let table = root
      for (const part of tomlKeyPath(line.slice(1, -1))) {
        if (typeof table[part] !== 'object' || table[part] === null) table[part] = {}
        table = table[part]
      }
      current = table
      continue
    }
    const eq = findTopLevel(line, '=')
    if (eq < 0) continue
    const keyPath = tomlKeyPath(line.slice(0, eq))
    let valueText = line.slice(eq + 1).trim()
    while (!tomlValueComplete(valueText) && index + 1 < lines.length) {
      index += 1
      valueText += '\n' + stripTomlComment(lines[index]).trim()
    }
    const value = parseTomlValue(valueText)
    let target = current
    for (const part of keyPath.slice(0, -1)) {
      if (typeof target[part] !== 'object' || target[part] === null) target[part] = {}
      target = target[part]
    }
    target[keyPath[keyPath.length - 1]] = value
  }
  return root
}

/** A Codex `[mcp_servers.*]` table as this plugin's raw server shapes. */
function serversFromCodex(table) {
  const map = table?.mcp_servers
  if (map === null || typeof map !== 'object') throw new Error('no [mcp_servers.*] table found')
  const servers = []
  for (const [name, raw] of Object.entries(map)) {
    if (raw === null || typeof raw !== 'object') continue
    const headers = raw.http_headers ?? raw.headers ?? {}
    servers.push({
      name,
      transport: typeof raw.url === 'string' && raw.url.length > 0 ? 'streamable-http' : 'stdio',
      enabled: raw.enabled !== false,
      command: typeof raw.command === 'string' ? raw.command : '',
      args: Array.isArray(raw.args) ? raw.args.map(value => String(value)) : [],
      env: plainMap(raw.env),
      cwd: typeof raw.cwd === 'string' ? raw.cwd : '',
      url: typeof raw.url === 'string' ? raw.url : '',
      headers: plainMap(headers),
      toolCallTimeoutMs: typeof raw.tool_timeout_sec === 'number' ? Math.round(raw.tool_timeout_sec * 1000) : 60000,
    })
  }
  return servers
}

/** Claude/Cursor `mcpServers` JSON as this plugin's raw server shapes. */
function serversFromJson(parsed) {
  if (parsed === null || typeof parsed !== 'object') throw new Error('import JSON must be an object')
  if (typeof parsed.version === 'number' && Array.isArray(parsed.servers)) return parsed.servers
  const map = parsed.mcpServers ?? parsed.servers
  if (map === null || typeof map !== 'object' || Array.isArray(map)) throw new Error('no mcpServers object found')
  const servers = []
  for (const [name, raw] of Object.entries(map)) {
    if (raw === null || typeof raw !== 'object') continue
    servers.push({
      name,
      transport: typeof raw.url === 'string' && raw.url.length > 0 ? 'streamable-http' : 'stdio',
      enabled: raw.enabled !== false && raw.disabled !== true,
      command: typeof raw.command === 'string' ? raw.command : '',
      args: Array.isArray(raw.args) ? raw.args.map(value => String(value)) : [],
      env: plainMap(raw.env),
      cwd: typeof raw.cwd === 'string' ? raw.cwd : '',
      url: typeof raw.url === 'string' ? raw.url : '',
      headers: plainMap(raw.headers),
      toolCallTimeoutMs: typeof raw.toolCallTimeoutMs === 'number' ? raw.toolCallTimeoutMs : 60000,
    })
  }
  return servers
}

/** Parse an uploaded configuration blob into raw server shapes. */
function parseImport(text, format) {
  const trimmed = String(text ?? '').trim()
  if (trimmed.length === 0) throw new Error('nothing to import')
  let chosen = format
  if (chosen === undefined || chosen === null || chosen === 'auto') {
    if (trimmed.startsWith('{')) chosen = 'json'
    else if (trimmed.startsWith('[')) {
      // A TOML table header (`[mcp_servers.name]`) versus a JSON array.
      chosen = /^\[\s*[A-Za-z0-9_.\"'-]+\s*\]/.test(trimmed) && trimmed.includes('=') ? 'codex' : 'json'
    } else if (trimmed.includes('mcp_servers')) chosen = 'codex'
    else throw new Error('cannot detect the import format')
  }
  if (chosen === 'codex') return serversFromCodex(parseToml(trimmed))
  if (chosen === 'json') return serversFromJson(JSON.parse(trimmed))
  throw new Error(`unknown import format: ${String(format)}`)
}

/** Merge imported servers into the managed configuration. */
async function importServers(ctx, settings, projects, config, text, format) {
  const incoming = parseImport(text, format)
  const added = []
  const skipped = []
  const taken = new Set(config.servers.map(server => server.name))
  const composed = collectMcp(ctx, projects, config)
    .filter(row => row.managed !== true && row.serverName !== '(unnamed)')
    .map(row => row.serverName)
  for (const raw of incoming) {
    const server = normalizeServer(raw)
    if (server === undefined) {
      skipped.push({ name: typeof raw?.name === 'string' ? raw.name : '(unnamed)', reason: 'invalid definition' })
      continue
    }
    if (taken.has(server.name) || composed.includes(server.name)) {
      skipped.push({ name: server.name, reason: 'name already in use' })
      continue
    }
    config.servers.push(server)
    taken.add(server.name)
    added.push(server.name)
  }
  config.servers.sort((left, right) => left.name.localeCompare(right.name))
  if (added.length > 0) {
    await writeConfig(settings, config)
    await regenerateBlock(settings, config)
  }
  return { added, skipped }
}

/** The portable snapshot the export dialog shows and downloads. */
function exportSnapshot(config) {
  return {
    format: 'dsh-mcp-skills-board',
    version: 1,
    servers: config.servers,
  }
}

// ---------------------------------------------------------------------------
// MCP server configuration (source of truth)
// ---------------------------------------------------------------------------

/**
 * Read the sidecar. A missing file is an empty configuration; an unreadable or
 * malformed one is reported through `errors` and treated as empty so the page
 * still renders.
 */
async function readConfig(settings) {
  const path = configPath(settings)
  let text
  try {
    text = await readFile(path, 'utf8')
  } catch {
    return { servers: [], overrides: {}, errors: [] }
  }
  let parsed
  const errors = []
  try {
    parsed = JSON.parse(text)
  } catch (error) {
    return { servers: [], overrides: {}, errors: [`${CONFIG_NAME} is not valid JSON: ${messageOf(error)}`] }
  }
  const servers = []
  for (const [index, raw] of (Array.isArray(parsed?.servers) ? parsed.servers : []).entries()) {
    const server = normalizeServer(raw)
    if (server === undefined) {
      errors.push(`servers[${index}] is invalid and was ignored`)
      continue
    }
    servers.push(server)
  }
  const overrides = {}
  if (parsed?.overrides !== null && typeof parsed?.overrides === 'object') {
    for (const [id, disabled] of Object.entries(parsed.overrides)) {
      if (typeof id === 'string' && id.length > 0 && id.length <= 128 && typeof disabled === 'boolean') {
        overrides[id] = disabled
      }
    }
  }
  return { servers, overrides, errors }
}

/** Write the sidecar atomically with owner-only permissions. */
async function writeConfig(settings, config) {
  const path = configPath(settings)
  const document = {
    version: 1,
    servers: config.servers,
    overrides: config.overrides,
  }
  const text = JSON.stringify(document, null, 2) + '\n'
  await atomicWrite(path, text)
  try {
    await chmod(path, 0o600)
  } catch {
    // A filesystem without POSIX modes keeps whatever it gave us.
  }
}

/**
 * Validate and normalize one server definition. Returns undefined when the
 * input cannot be represented safely.
 */
function normalizeServer(raw) {
  if (raw === null || typeof raw !== 'object') return undefined
  const name = typeof raw.name === 'string' ? raw.name.trim() : ''
  if (!/^[A-Za-z0-9_-]{1,32}$/.test(name)) return undefined
  const transport = raw.transport === 'streamable-http' ? 'streamable-http' : raw.transport === 'stdio' ? 'stdio' : undefined
  if (transport === undefined) return undefined
  const enabled = raw.enabled !== false
  const toolCallTimeoutMs = normalizeTimeout(raw.toolCallTimeoutMs)
  const base = { name, transport, enabled, toolCallTimeoutMs }
  if (transport === 'stdio') {
    const command = typeof raw.command === 'string' ? raw.command.trim() : ''
    if (command.length === 0 || command.length > LIMITS.command) return undefined
    return {
      ...base,
      command,
      args: normalizeList(raw.args, LIMITS.args, LIMITS.arg),
      env: normalizeMap(raw.env, LIMITS.env),
      cwd: typeof raw.cwd === 'string' ? raw.cwd.trim().slice(0, 4096) : '',
      url: '',
      headers: {},
    }
  }
  const url = typeof raw.url === 'string' ? raw.url.trim() : ''
  if (!/^https?:\/\//.test(url) || url.length > LIMITS.url) return undefined
  return {
    ...base,
    command: '',
    args: [],
    env: {},
    cwd: '',
    url,
    headers: normalizeMap(raw.headers, LIMITS.headers),
  }
}

/** A timeout in the range the bridge accepts, or the default. */
function normalizeTimeout(value) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return 60000
  const rounded = Math.round(value)
  if (rounded < 1000 || rounded > LIMITS.timeout) return 60000
  return rounded
}

/** A bounded list of trimmed strings. */
function normalizeList(value, maxItems, maxLength) {
  if (!Array.isArray(value)) return []
  return value
    .slice(0, maxItems)
    .map(item => (typeof item === 'string' ? item.trim() : ''))
    .filter(item => item.length > 0 && item.length <= maxLength)
}

/** A bounded string-to-string map. */
function normalizeMap(value, maxItems) {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return {}
  const out = {}
  for (const [key, raw] of Object.entries(value).slice(0, maxItems)) {
    if (typeof key !== 'string' || key.length === 0 || key.length > 256) continue
    if (typeof raw !== 'string' || raw.length > 8192) continue
    out[key] = raw
  }
  return out
}

/** The entry id this page gives one managed server. */
function entryIdFor(name) {
  return `mcp-${name}`
}

// ---------------------------------------------------------------------------
// MCP actions
// ---------------------------------------------------------------------------

/** Flip one row. Managed rows move in the sidecar; foreign rows get an override. */
async function toggleMcp(ctx, settings, projects, config, id, enabled) {
  const rows = collectMcp(ctx, projects, config)
  const row = rows.find(candidate => candidate.id === id)
  if (row === undefined) throw new Error(`unknown MCP entry: ${id}`)
  // Managed rows are keyed by their generated entry id whether or not the
  // composition has caught up yet; everything else gets an override.
  const index = config.servers.findIndex(candidate => entryIdFor(candidate.name) === id)
  if (index >= 0) {
    config.servers[index].enabled = enabled
  } else {
    config.overrides[id] = enabled !== true
  }
  await writeConfig(settings, config)
  await regenerateBlock(settings, config)
}

/** Create or update one managed server. */
async function saveMcp(ctx, settings, projects, config, raw, previousName) {
  const server = normalizeServer(raw)
  if (server === undefined) throw new Error('invalid server definition')
  const existingIndex = previousName === undefined
    ? -1
    : config.servers.findIndex(candidate => candidate.name === previousName)
  if (previousName !== undefined && existingIndex < 0) throw new Error(`unknown managed server: ${previousName}`)
  if (config.servers.some((candidate, index) => index !== existingIndex && candidate.name === server.name)) {
    throw new Error(`a managed server already uses the name "${server.name}"`)
  }
  const composedNames = collectMcp(ctx, projects, config)
    .filter(row => row.managed !== true && row.serverName !== '(unnamed)')
    .map(row => row.serverName)
  if (composedNames.includes(server.name)) {
    throw new Error(`another composed MCP row already uses the server name "${server.name}"`)
  }
  if (existingIndex >= 0) {
    config.servers[existingIndex] = server
    if (previousName !== undefined && previousName !== server.name) delete config.overrides[entryIdFor(previousName)]
  } else {
    config.servers.push(server)
  }
  config.servers.sort((left, right) => left.name.localeCompare(right.name))
  await writeConfig(settings, config)
  await regenerateBlock(settings, config)
}

/** Remove one managed server; foreign rows are refused. */
async function removeMcp(settings, config, id) {
  const index = config.servers.findIndex(candidate => entryIdFor(candidate.name) === id)
  if (index < 0) throw new Error(`only servers added from this page can be removed: ${id}`)
  config.servers.splice(index, 1)
  delete config.overrides[id]
  await writeConfig(settings, config)
  await regenerateBlock(settings, config)
}

// ---------------------------------------------------------------------------
// MCP composition & patch block
// ---------------------------------------------------------------------------

/**
 * Every MCP server row currently composed, plus any managed server the
 * composition does not have yet (a write that has not been applied, or a
 * manually deleted block).
 */
function collectMcp(ctx, projects, config) {
  const loader = ctx.get('loader')
  const schemas = toolSchemas(ctx)
  const rows = []
  const seen = new Set()
  if (loader !== undefined && typeof loader.entries === 'function') {
    for (const entry of loader.entries()) {
      if (entry.options?.group) continue
      if (entry.options?.name !== MCP_MODULE) continue
      const declaredId = typeof entry.options.id === 'string' ? entry.options.id : entry.id
      const rawConfig = entry.options?.config ?? {}
      const serverName = typeof rawConfig.serverName === 'string' ? rawConfig.serverName : ''
      const prefix = serverName.length === 0 ? '' : `mcp__${serverName}__`
      const toolNames = prefix.length === 0 ? [] : schemas.filter(schema => schema.name.startsWith(prefix)).map(schema => schema.name)
      const managedServer = config.servers.find(server => entryIdFor(server.name) === declaredId)
      const managed = managedServer !== undefined
      seen.add(declaredId)
      rows.push(rowFor({
        id: declaredId,
        treeId: entry.id,
        serverName: serverName.length === 0 ? '(unnamed)' : serverName,
        // Managed rows show the sidecar definition: the composed entry holds the
        // evaluated config, where a `!!js` env value is no longer the source text.
        config: managedServer ?? rawConfig,
        enabled: entry.disabled !== true,
        phase: entry.fiber === undefined ? null : PHASES[entry.fiber.state] ?? null,
        toolNames,
        managed,
        missing: false,
        projects,
      }))
    }
  }
  for (const server of config.servers) {
    const id = entryIdFor(server.name)
    if (seen.has(id)) continue
    rows.push(rowFor({
      id,
      treeId: id,
      serverName: server.name,
      config: server,
      enabled: server.enabled,
      phase: null,
      toolNames: [],
      managed: true,
      missing: true,
      projects,
    }))
  }
  return rows.sort((left, right) => left.serverName.localeCompare(right.serverName))
}

/** Build one row's presentation fields. */
function rowFor(input) {
  const cwd = typeof input.config.cwd === 'string' && input.config.cwd.length > 0 ? resolve(input.config.cwd) : undefined
  const owner = cwd === undefined ? undefined : input.projects.find(project => isInside(project, cwd))
  return {
    id: input.id,
    entryId: input.id,
    treeId: input.treeId,
    groupId: owner === undefined ? GLOBAL_GROUP : projectGroupId(owner),
    serverName: input.serverName,
    transport: typeof input.config.transport === 'string' ? input.config.transport : 'stdio',
    detail: describeMcp(input.config),
    enabled: input.enabled,
    phase: input.phase,
    tools: input.toolNames.length,
    toolNames: input.toolNames,
    managed: input.managed,
    missing: input.missing,
    toolCallTimeoutMs: normalizeTimeout(input.config.toolCallTimeoutMs),
    config: {
      command: typeof input.config.command === 'string' ? input.config.command : '',
      args: Array.isArray(input.config.args) ? input.config.args.map(String) : [],
      env: plainMap(input.config.env),
      cwd: typeof input.config.cwd === 'string' ? input.config.cwd : '',
      url: typeof input.config.url === 'string' ? input.config.url : '',
      headers: plainMap(input.config.headers),
    },
  }
}

/** One-line transport description for a row's subtitle. */
function describeMcp(config) {
  if (config.transport === 'streamable-http') return String(config.url ?? '')
  const args = Array.isArray(config.args) ? config.args.map(String) : []
  const cwd = typeof config.cwd === 'string' && config.cwd.length > 0 ? ` (cwd: ${config.cwd})` : ''
  return [config.command, ...args].filter(part => typeof part === 'string' && part.length > 0).join(' ') + cwd
}

/** A string-to-string view of a loader map (values may already be evaluated). */
function plainMap(value) {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return {}
  const out = {}
  for (const [key, raw] of Object.entries(value)) out[key] = typeof raw === 'string' ? raw : String(raw)
  return out
}

/** The model-visible tool schemas of the global view. */
function toolSchemas(ctx) {
  const tools = ctx.get('tools')
  if (tools === undefined || typeof tools.schemas !== 'function') return []
  try {
    return tools.schemas()
  } catch {
    return []
  }
}

/**
 * Regenerate the managed block from the sidecar, preserving every other byte
 * of the profile patch file.
 */
async function regenerateBlock(settings, config) {
  const profile = await resolveProfile(settings)
  if (profile === undefined) {
    throw new Error(`no profile under ${join(settings.dshHome, 'profiles')} lists ${OWN_PACKAGE}; set config.patchPath`)
  }
  let original = ''
  try {
    original = await readFile(profile.patchPath, 'utf8')
  } catch {
    original = ''
  }
  const kept = []
  let inside = false
  for (const line of original.split(/\r?\n/)) {
    if (line.trim() === BLOCK_START) {
      inside = true
      continue
    }
    if (line.trim() === BLOCK_END) {
      inside = false
      continue
    }
    if (!inside) kept.push(line)
  }
  const body = kept.join('\n').replace(/\s+$/, '')
  // An explicit empty array (`[]`) cannot carry appended items; the block replaces it.
  const parts = body.length > 0 && body !== '[]' ? [body] : []
  const block = renderBlock(config)
  if (block !== '') parts.push(block)
  const next = parts.length === 0 ? '' : `${parts.join('\n\n')}\n`
  if (next === original) return
  await atomicWrite(profile.patchPath, next)
}

/** Render the managed block: one insert row per server, then foreign overrides. */
function renderBlock(config) {
  if (config.servers.length === 0 && Object.keys(config.overrides).length === 0) return ''
  const lines = [BLOCK_START]
  for (const server of config.servers) {
    lines.push('- insert:')
    lines.push(`    - id: ${yamlScalar(entryIdFor(server.name))}`)
    lines.push(`      name: ${yamlScalar(MCP_MODULE)}`)
    lines.push('      config:')
    lines.push(`        serverName: ${yamlScalar(server.name)}`)
    lines.push(`        transport: ${yamlScalar(server.transport)}`)
    if (server.transport === 'stdio') {
      lines.push(`        command: ${yamlScalar(server.command)}`)
      if (server.args.length > 0) {
        lines.push('        args:')
        for (const arg of server.args) lines.push(`          - ${yamlScalar(arg)}`)
      }
      if (Object.keys(server.env).length > 0) {
        lines.push('        env:')
        for (const [key, value] of Object.entries(server.env)) lines.push(`          ${yamlScalar(key)}: ${renderScalar(value)}`)
      }
      if (server.cwd.length > 0) lines.push(`        cwd: ${yamlScalar(server.cwd)}`)
    } else {
      lines.push(`        url: ${yamlScalar(server.url)}`)
      if (Object.keys(server.headers).length > 0) {
        lines.push('        headers:')
        for (const [key, value] of Object.entries(server.headers)) lines.push(`          ${yamlScalar(key)}: ${renderScalar(value)}`)
      }
    }
    if (typeof server.toolCallTimeoutMs === 'number') lines.push(`        toolCallTimeoutMs: ${server.toolCallTimeoutMs}`)
    lines.push('        failOnStartupError: false')
    lines.push(`      disabled: ${server.enabled ? 'false' : 'true'}`)
  }
  const overrides = Object.entries(config.overrides).sort(([left], [right]) => left.localeCompare(right))
  if (overrides.length > 0) {
    lines.push('# enablement overrides for rows declared outside this block')
    for (const [id, disabled] of overrides) {
      lines.push(`- id: ${yamlScalar(id)}`)
      lines.push(`  disabled: ${disabled ? 'true' : 'false'}`)
    }
  }
  lines.push(BLOCK_END)
  return lines.join('\n')
}

/** One YAML scalar; JSON string syntax is valid YAML double-quoted syntax. */
function yamlScalar(value) {
  return JSON.stringify(String(value))
}

/** `@env:NAME` becomes a live environment read instead of a stored secret. */
const ENV_REF = /^@env:([A-Za-z_][A-Za-z0-9_]*)$/

/** Render one map value, expanding the `@env:` reference form. */
function renderScalar(value) {
  const match = ENV_REF.exec(String(value ?? ''))
  return match === null ? yamlScalar(value) : `!!js process.env.${match[1]}`
}

// ---------------------------------------------------------------------------
// Profile resolution
// ---------------------------------------------------------------------------

/** Locate the profile this plugin is installed in. */
async function resolveProfile(settings) {
  if (settings.patchPath !== undefined) {
    return {
      name: basename(join(settings.patchPath, '..')),
      patchPath: settings.patchPath,
      patchReload: 'unknown',
      detected: false,
    }
  }
  const profilesDir = join(settings.dshHome, 'profiles')
  let names
  try {
    names = await readdir(profilesDir)
  } catch {
    return undefined
  }
  const candidates = []
  for (const entry of names) {
    try {
      const manifest = JSON.parse(await readFile(join(profilesDir, entry, 'package.json'), 'utf8'))
      const bundles = manifest?.dsh?.profile?.bundles
      if (!Array.isArray(bundles) || !bundles.includes(OWN_PACKAGE)) continue
      candidates.push({ name: entry, patchReload: stringOr(manifest?.dsh?.profile?.patchReload, 'startup') })
    } catch {
      continue
    }
  }
  const chosen = candidates.find(candidate => candidate.patchReload === 'live') ?? candidates[0]
  if (chosen === undefined) return undefined
  return {
    name: chosen.name,
    patchPath: join(profilesDir, chosen.name, 'cordis.patch.yml'),
    patchReload: chosen.patchReload,
    detected: true,
  }
}

/** One string value or a fallback. */
function stringOr(value, fallback) {
  return typeof value === 'string' && value.length > 0 ? value : fallback
}

// ---------------------------------------------------------------------------
// HTTP & filesystem helpers
// ---------------------------------------------------------------------------

/** Apply the composition's trust fence to one request. */
function refuse(ctx, req, res) {
  const connection = ctx.get('connection')
  if (connection === undefined || typeof connection.requestRejection !== 'function') {
    sendJson(res, 403, { code: 'no-trust-surface', message: 'this deployment composes no connection service' })
    return true
  }
  const rejection = connection.requestRejection(req)
  if (rejection === undefined) return false
  res.statusCode = rejection
  res.end()
  return true
}

/** JSON response; live facts are never cached. */
function sendJson(res, status, payload) {
  res.statusCode = status
  res.setHeader('content-type', 'application/json; charset=utf-8')
  res.setHeader('cache-control', 'no-store')
  res.end(JSON.stringify(payload))
}

/** 405 naming the route's one supported method. */
function sendMethodNotAllowed(res, allow) {
  res.statusCode = 405
  res.setHeader('allow', allow)
  res.end()
}

/** One query parameter of a request. */
function queryParam(req, name) {
  const url = typeof req.url === 'string' ? req.url : ''
  const query = url.indexOf('?')
  if (query < 0) return undefined
  return new URLSearchParams(url.slice(query + 1)).get(name) ?? undefined
}

/** The current project a request reports, as an absolute path. */
function requestedProject(value) {
  if (typeof value !== 'string' || value.length === 0 || value.length > MAX_CWD_BYTES) return undefined
  if (value.includes('\0')) return undefined
  return resolve(value)
}

/** Read a bounded request body as UTF-8 text. */
async function readBoundedBody(req) {
  const chunks = []
  let size = 0
  for await (const chunk of req) {
    size += chunk.byteLength
    if (size > MAX_BODY_BYTES) {
      req.resume()
      return null
    }
    chunks.push(chunk)
  }
  return Buffer.concat(chunks).toString('utf8')
}

/** Write a file through a sibling temp file and a rename. */
async function atomicWrite(path, content) {
  const temporary = `${path}.mcp-skills.tmp`
  await writeFile(temporary, content, 'utf8')
  await rename(temporary, path)
}

/** Readable message for one thrown value. */
function messageOf(error) {
  return error instanceof Error ? error.message : String(error)
}
