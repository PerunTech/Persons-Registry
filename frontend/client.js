import pkg from '../package.json'
import { pluginManager } from 'perun-core'
import * as plugin from './index'

// The shell reaches a plugin two different ways and this file has to satisfy
// both. ModuleMenu asks pluginManager, which skips anything already registered,
// so registering here is what keeps it from fetching a second copy. Router
// instead reads `window[<context>]` off the script it loaded, so the bundle has
// to expose the same routes as a value -- production's entry (index.js) does
// that by being the plugin, and this entry does it by re-exporting one.
export * from './index'

pluginManager.registerPlugin(pkg.name, plugin)
