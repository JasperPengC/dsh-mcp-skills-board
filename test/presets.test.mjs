import { mkdtemp, mkdir, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import assert from 'node:assert/strict'

const PLUGIN = new URL('../lib/index.js', import.meta.url).href
const home = await mkdtemp(join(tmpdir(), 'mcp-skills-preset-'))
const profileDir = join(home, 'profiles', 'test')
await mkdir(profileDir, { recursive: true })
await writeFile(join(profileDir, 'package.json'), JSON.stringify({ name: 'p', dsh: { profile: { bundles: ['dsh-mcp-skills-board'], patchReload: 'live' } } }))
await writeFile(join(profileDir, 'cordis.patch.yml'), '[]\n')
await mkdir(join(home, 'skills', 'demo'), { recursive: true })
await writeFile(join(home, 'skills', 'demo', 'SKILL.md'), '---\nname: demo\ndescription: disk skill\n---\nbody\n')

const routes = []
const presetSkill = { name: 'office-docx', description: 'Word docs', whenToUse: 'docx', invocation: { modelInvocable: true, userInvocable: true }, source: 'custom', provider: 'filesystem', path: '/bundle/skills/office-docx/SKILL.md' }
const ambient = { name: 'demo', description: 'disk skill', invocation: { modelInvocable: true, userInvocable: true }, source: 'user-dsh', provider: 'filesystem' }
const ctx = {
  inject(services, cb) { cb({ effect(fn) { fn(); return () => {} }, webServer: { register(def) { routes.push(def); return () => {} } } }) },
  effect(fn) { fn(); return () => {} },
  get(name) {
    if (name === 'connection') return { requestRejection: () => undefined }
    if (name === 'tools') return { schemas: () => [] }
    if (name === 'loader') return { entries: () => [] }
    if (name === 'agentPresets') return { list: async () => [{ id: 'standard', name: '标准模式' }], acquireScope: async () => ({ key: 'scope-standard', [Symbol.asyncDispose]: async () => {} }) }
    if (name === 'skills') return { list: async (options) => (options && options.scope ? [presetSkill, ambient] : [ambient]) }
    return undefined
  },
}
const plugin = await import(PLUGIN + '?t=' + Date.now())
plugin.apply(ctx, { dshHome: home, projectRoot: home, skillRoots: [] })

const req = { method: 'GET', url: '/mcp-skills/state', headers: {}, async *[Symbol.asyncIterator]() {} }
const res = { statusCode: 0, headers: {}, payload: '', setHeader() {}, end(payload) { this.payload = payload } }
await routes.find(r => r.path === '/mcp-skills/state').handler(req, res)
const payload = JSON.parse(res.payload)
assert.equal(res.statusCode, 200)
const names = payload.skills.map(s => s.name).sort()
assert.deepEqual(names, ['demo', 'office-docx'], 'disk + preset skills, ambient not duplicated')
const preset = payload.skills.find(s => s.name === 'office-docx')
assert.equal(preset.readOnly, true)
assert.equal(preset.groupId, 'preset:standard')
assert.equal(preset.modelInvocable, true)
assert.ok(payload.groups.some(g => g.id === 'preset:standard' && g.label === '标准模式'))
console.log('preset collection OK:', names.join(', '), '| groups:', payload.groups.map(g => g.id).join(', '))
