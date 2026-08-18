import pkg from '../package.json'
import { pluginManager } from 'perun-core'
import * as plugin from './index'
pluginManager.registerPlugin(pkg.name, plugin)