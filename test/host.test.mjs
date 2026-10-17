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
const ctx = {
  inject(services, cb) { cb({ effect(fn) { fn(); return () => {} }, webServer: { register(def) { routes.push(def); return () => {} } } }) },
  effect(fn) { fn(); return () => {} },
  get(name) {
    if (name === 'connection') return { requestRejection: () => rejection }
    if (name === 'tools') return { schemas: () => [] }
    if (name === 'loader') return { entries: () => [] }
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
  const route = routes.find(candidate => candidate.path === path)
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

console.log('\nALL HOST TESTS PASSED')
