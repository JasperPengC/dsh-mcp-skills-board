import { mkdtemp, mkdir, writeFile, readFile, stat } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import assert from 'node:assert/strict'

const PLUGIN = new URL('../lib/index.js', import.meta.url).href
const home = await mkdtemp(join(tmpdir(), 'mcp-skills-test-'))
const profileDir = join(home, 'profiles', 'test')
await mkdir(profileDir, { recursive: true })
await writeFile(join(profileDir, 'package.json'), JSON.stringify({ name: 'p', dsh: { profile: { bundles: ['dsh-mcp-skills-board'], patchReload: 'live' } } }))
const patchPath = join(profileDir, 'cordis.patch.yml')
await writeFile(patchPath, '# user comment before\n- insert:\n    - id: keep-me\n      name: keep-me\n')

const routes = []
let rejection
let loaderEntries = []
const ctx = {
  inject(services, cb) { cb({ effect(fn) { fn(); return () => {} }, webServer: { register(def) { routes.push(def); return () => {} } } }) },
  effect(fn) { fn(); return () => {} },
  get(name) {
    if (name === 'connection') return { requestRejection: () => rejection }
    if (name === 'tools') return { schemas: () => [] }
    if (name === 'loader') return { entries: () => loaderEntries }
    return undefined
  },
}
const plugin = await import(PLUGIN + '?t=' + Date.now())
plugin.apply(ctx, { dshHome: home, projectRoot: home, skillRoots: [] })

async function call(method, path, body) {
  const req = {
    method,
    url: path,
    headers: { 'content-type': 'application/json' },
    async *[Symbol.asyncIterator]() { if (body !== undefined) yield Buffer.from(JSON.stringify(body)) },
  }
  const res = { statusCode: 0, headers: {}, payload: '', setHeader(k, v) { this.headers[k] = v }, end(payload) { this.payload = payload ?? '' } }
  const route = routes.find(candidate => candidate.path === path.split('?')[0])
  assert.ok(route, `route not registered: ${path}`)
  await route.handler(req, res)
  return { status: res.statusCode, json: res.payload ? JSON.parse(res.payload) : null }
}

// 1. state
let result = await call('GET', '/mcp-skills/state')
assert.equal(result.status, 200)
assert.equal(result.json.skills.length, 0)
assert.equal(result.json.profile.patchReload, 'live')
assert.equal(result.json.configPath, join(home, 'mcp-skills.json'))
console.log('1 state ok:', result.json.groups.map(g => g.id).join(','))

// 2. add a stdio server
result = await call('POST', '/mcp-skills/action', {
  action: 'mcp-save',
  server: { name: 'github', transport: 'stdio', enabled: true, command: 'npx', args: ['-y', '@modelcontextprotocol/server-github'], env: { GITHUB_TOKEN: 'x' }, cwd: '', url: '', headers: {}, toolCallTimeoutMs: 60000 },
})
assert.equal(result.status, 200, JSON.stringify(result.json))
assert.equal(result.json.mcp.length, 1)
assert.equal(result.json.mcp[0].serverName, 'github')
assert.equal(result.json.mcp[0].missing, true)
assert.equal(result.json.mcp[0].managed, true)
const config = JSON.parse(await readFile(join(home, 'mcp-skills.json'), 'utf8'))
assert.equal(config.servers.length, 1)
const mode = (await stat(join(home, 'mcp-skills.json'))).mode & 0o777
assert.equal(mode, 0o600, 'config permissions')
let patch = await readFile(patchPath, 'utf8')
assert.match(patch, /keep-me/)
assert.match(patch, /# >>> dsh-mcp-skills/)
assert.match(patch, /id: "mcp-github"/)
console.log('2 add ok; patch mode/block ok')

// 3. toggle off
result = await call('POST', '/mcp-skills/action', { action: 'mcp-toggle', id: 'mcp-github', enabled: false })
assert.equal(result.status, 200)
assert.equal(result.json.mcp[0].enabled, false)
patch = await readFile(patchPath, 'utf8')
assert.match(patch, /disabled: true/)
console.log('3 toggle ok')

// 4. edit + rename
result = await call('POST', '/mcp-skills/action', {
  action: 'mcp-save', previousName: 'github',
  server: { name: 'github-2', transport: 'stdio', enabled: true, command: 'npx', args: [], env: {}, cwd: '', url: '', headers: {}, toolCallTimeoutMs: 30000 },
})
assert.equal(result.status, 200, JSON.stringify(result.json))
patch = await readFile(patchPath, 'utf8')
assert.match(patch, /id: "mcp-github-2"/)
assert.doesNotMatch(patch, /id: "mcp-github"/)
console.log('4 edit+rename ok')

// 5. duplicate name rejected
result = await call('POST', '/mcp-skills/action', {
  action: 'mcp-save',
  server: { name: 'github-2', transport: 'stdio', enabled: true, command: 'echo', args: [], env: {}, cwd: '', url: '', headers: {} },
})
assert.equal(result.status, 409)
console.log('5 duplicate rejected ok')

// 6. remove
result = await call('POST', '/mcp-skills/action', { action: 'mcp-remove', id: 'mcp-github-2' })
assert.equal(result.status, 200)
assert.equal(result.json.mcp.length, 0)
patch = await readFile(patchPath, 'utf8')
assert.doesNotMatch(patch, /# >>> dsh-mcp-skills/)
assert.match(patch, /# user comment before/)
assert.match(patch, /keep-me/)
console.log('6 remove ok; user content preserved')

// 7. skills
await mkdir(join(home, 'skills', 'demo'), { recursive: true })
await writeFile(join(home, 'skills', 'demo', 'SKILL.md'), '---\nname: demo\ndescription: A demo skill\nwhenToUse: testing\n---\nBody line\n')
result = await call('GET', '/mcp-skills/state')
assert.equal(result.json.skills.length, 1)
assert.equal(result.json.skills[0].name, 'demo')
assert.equal(result.json.skills[0].modelInvocable, true)
const skillPath = join(home, 'skills', 'demo', 'SKILL.md')
result = await call('POST', '/mcp-skills/action', { action: 'skill', id: skillPath, model: false, user: true })
assert.equal(result.status, 200)
assert.equal(result.json.skills[0].modelInvocable, false)
assert.match(await readFile(skillPath, 'utf8'), /disable-model-invocation: true/)
console.log('7 skill toggle ok')

// 8. badge http server
result = await call('POST', '/mcp-skills/action', {
  action: 'mcp-save',
  server: { name: 'web', transport: 'streamable-http', enabled: false, command: '', args: [], env: {}, cwd: '', url: 'https://example.com/mcp', headers: { Authorization: 'Bearer t' }, toolCallTimeoutMs: 60000 },
})
assert.equal(result.status, 200, JSON.stringify(result.json))
patch = await readFile(patchPath, 'utf8')
assert.match(patch, /transport: "streamable-http"/)
assert.match(patch, /url: "https:\/\/example.com\/mcp"/)
console.log('8 http server ok')

// 9. auth rejection
rejection = 401
result = await call('GET', '/mcp-skills/state')
assert.equal(result.status, 401)
rejection = undefined
console.log('9 auth fence ok')

// 10. skill create
result = await call('GET', '/mcp-skills/state')
assert.ok(Array.isArray(result.json.roots))
assert.equal(result.json.roots.find(root => root.id === 'user-dsh').writable, true)
result = await call('POST', '/mcp-skills/action', {
  action: 'skill-create',
  root: 'user-dsh',
  name: 'release-helper',
  description: '帮助整理发布说明',
  whenToUse: '准备发版时',
  body: '# 发布说明\n\n按提交记录整理。',
  model: true,
  user: true,
})
assert.equal(result.status, 200, JSON.stringify(result.json))
const createdPath = join(home, 'skills', 'release-helper', 'SKILL.md')
const created = await readFile(createdPath, 'utf8')
assert.match(created, /^---\nname: release-helper\n/)
assert.match(created, /description: 帮助整理发布说明/)
assert.match(created, /whenToUse: 准备发版时/)
assert.match(created, /# 发布说明/)
assert.equal(result.json.skills.length, 2)
console.log('10 skill create ok')

// 11. skill read + save (unknown frontmatter keys are preserved)
await writeFile(createdPath, created.replace('---\n\n', 'license: MIT\n---\n\n'))
result = await call('POST', '/mcp-skills/action', { action: 'skill-read', id: createdPath })
assert.equal(result.status, 200, JSON.stringify(result.json))
assert.equal(result.json.skill.name, 'release-helper')
assert.match(result.json.skill.body, /# 发布说明/)
result = await call('POST', '/mcp-skills/action', {
  action: 'skill-save',
  id: createdPath,
  description: '更新后的描述',
  whenToUse: '',
  body: '新的正文',
  model: false,
  user: true,
})
assert.equal(result.status, 200, JSON.stringify(result.json))
const saved = await readFile(createdPath, 'utf8')
assert.match(saved, /description: 更新后的描述/)
assert.match(saved, /disable-model-invocation: true/)
assert.match(saved, /license: MIT/)
assert.match(saved, /新的正文/)
assert.doesNotMatch(saved, /whenToUse:/)

// 12. invalid skill name is refused
result = await call('POST', '/mcp-skills/action', { action: 'skill-create', root: 'user-dsh', name: 'Bad Name', description: 'x', model: true, user: true })
assert.equal(result.status, 409)
console.log('11-12 skill read/save/validation ok')

// 13. folder browse route
await mkdir(join(home, 'browse-dir', 'sub'), { recursive: true })
result = await call('GET', `/mcp-skills/browse?path=${encodeURIComponent(join(home, 'browse-dir'))}`)
assert.equal(result.status, 200, JSON.stringify(result.json))
assert.equal(result.json.path, join(home, 'browse-dir'))
assert.ok(result.json.entries.some(entry => entry.name === 'sub' && entry.path === join(home, 'browse-dir', 'sub')))
assert.ok(Array.isArray(result.json.roots) && result.json.roots.length > 0)
console.log('13 browse ok')

// 14. create a skill inside a chosen subfolder of a writable root
await mkdir(join(home, 'skills', 'team'), { recursive: true })
result = await call('POST', '/mcp-skills/action', {
  action: 'skill-create',
  rootPath: join(home, 'skills', 'team'),
  name: 'browse-made',
  description: '在子目录里创建',
  model: true,
  user: true,
})
assert.equal(result.status, 200, JSON.stringify(result.json))
assert.ok((await stat(join(home, 'skills', 'team', 'browse-made', 'SKILL.md'))).isFile())

result = await call('POST', '/mcp-skills/action', {
  action: 'skill-create',
  rootPath: join(home, 'outside'),
  name: 'nope',
  description: 'x',
  model: true,
  user: true,
})
assert.equal(result.status, 409)
console.log('14 chosen-folder create ok')


// 15. @env references stay out of the patch file
result = await call('POST', '/mcp-skills/action', {
  action: 'mcp-save',
  server: { name: 'envref', transport: 'stdio', enabled: true, command: 'npx', args: [], env: { TOKEN: '@env:GITHUB_TOKEN' }, cwd: '', url: '', headers: {}, toolCallTimeoutMs: 60000 },
})
assert.equal(result.status, 200, JSON.stringify(result.json))
patch = await readFile(patchPath, 'utf8')
assert.match(patch, /"TOKEN": !!js process\.env\.GITHUB_TOKEN/)
assert.doesNotMatch(patch, /"@env:/)
console.log('15 env reference ok')

// 16. JSON import (Claude/Cursor shape) + duplicate skip
result = await call('POST', '/mcp-skills/action', {
  action: 'mcp-import',
  text: JSON.stringify({ mcpServers: {
    imported_stdio: { command: 'npx', args: ['-y', 'pkg'], env: { A: '1' } },
    imported_http: { url: 'https://example.com/mcp', headers: { Authorization: 'Bearer t' } },
  } }),
})
assert.equal(result.status, 200, JSON.stringify(result.json))
assert.deepEqual(result.json.importResult.added.sort(), ['imported_http', 'imported_stdio'])
assert.equal(result.json.importResult.skipped.length, 0)
result = await call('POST', '/mcp-skills/action', {
  action: 'mcp-import',
  text: JSON.stringify({ mcpServers: { imported_stdio: { command: 'npx' } } }),
})
assert.equal(result.json.importResult.added.length, 0)
assert.equal(result.json.importResult.skipped[0].reason, 'name already in use')
console.log('16 json import ok')

// 17. Codex TOML import
const codexToml = `
[mcp_servers.codex_demo]
command = "npx"
args = ["-y", "@example/server"]
env = { DEMO = "1" }
enabled = false
tool_timeout_sec = 45

[mcp_servers.codex_http]
url = "https://example.com/mcp"
http_headers = { Authorization = "Bearer t" }
`
result = await call('POST', '/mcp-skills/action', { action: 'mcp-import', text: codexToml })
assert.equal(result.status, 200, JSON.stringify(result.json))
assert.deepEqual(result.json.importResult.added.sort(), ['codex_demo', 'codex_http'])
patch = await readFile(patchPath, 'utf8')
assert.match(patch, /transport: "streamable-http"/)
assert.match(patch, /toolCallTimeoutMs: 45000/)
console.log('17 codex toml import ok')

// 18. export snapshot
result = await call('POST', '/mcp-skills/action', { action: 'mcp-export' })
assert.equal(result.status, 200)
assert.equal(result.json.export.format, 'dsh-mcp-skills-board')
const exported = result.json.export.servers.find(server => server.name === 'envref')
assert.ok(exported, 'export includes envref')
assert.equal(exported.env.TOKEN, '@env:GITHUB_TOKEN')
console.log('18 export ok')

// 19. skill rename / duplicate / delete
await mkdir(join(home, 'skills', 'ops-skill'), { recursive: true })
const opsFile = join(home, 'skills', 'ops-skill', 'SKILL.md')
await writeFile(opsFile, '---\nname: ops-skill\ndescription: ops\nlicense: MIT\n---\nBody\n')
result = await call('POST', '/mcp-skills/action', { action: 'skill-rename', id: opsFile, name: 'ops-renamed' })
assert.equal(result.status, 200, JSON.stringify(result.json))
const renamed = join(home, 'skills', 'ops-renamed', 'SKILL.md')
assert.ok((await stat(renamed)).isFile())
const renamedText = await readFile(renamed, 'utf8')
assert.match(renamedText, /^---\nname: ops-renamed\n/)
assert.match(renamedText, /license: MIT/)

result = await call('POST', '/mcp-skills/action', { action: 'skill-duplicate', id: renamed, name: 'ops-copy' })
assert.equal(result.status, 200, JSON.stringify(result.json))
const copied = join(home, 'skills', 'ops-copy', 'SKILL.md')
assert.match(await readFile(copied, 'utf8'), /name: ops-copy/)

result = await call('POST', '/mcp-skills/action', { action: 'skill-delete', id: copied })
assert.equal(result.status, 200, JSON.stringify(result.json))
let gone = false
try { await stat(copied) } catch { gone = true }
assert.ok(gone, 'deleted file is gone')
console.log('19 skill rename/copy/delete ok')

// 20. composed managed row reports the sidecar source text, not the evaluated config
loaderEntries = [{
  id: 'tree-envref',
  options: {
    id: 'mcp-envref',
    name: '@deepseek-ai/dsh-mcp-client',
    config: { serverName: 'envref', transport: 'stdio', command: 'npx', args: [], env: { TOKEN: { expression: 'process.env.GITHUB_TOKEN' } }, toolCallTimeoutMs: 60000 },
  },
  disabled: false,
}]
result = await call('GET', '/mcp-skills/state')
const envrefRow = result.json.mcp.find(row => row.serverName === 'envref')
assert.ok(envrefRow, 'composed managed row is present')
assert.equal(envrefRow.managed, true)
assert.equal(envrefRow.config.env.TOKEN, '@env:GITHUB_TOKEN', 'sidecar value wins over the evaluated config')
loaderEntries = []
console.log('20 composed row keeps sidecar values ok')

console.log('\nALL HOST TESTS PASSED')
