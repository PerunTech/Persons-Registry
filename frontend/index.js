/**
 * Import all internal indexes, thus including the code in the final build.
 * export all content representing the surface of your plugin API. Noone is expected to call, but wth.
 * Wait to be called for render, Core will call you.
 */
import Person from './components/Person'
import PersonInfo from './components/PersonInfo'
import Connector from './utils/Connector'

const routes = [{
  name: 'persons-registry-person',
  path: '/main/persons-registry',
  render: Person,
  isExact: true
}, {
  name: 'persons-registry-person-info',
  path: '/main/persons-registry/person/:objId/:personType/:name/:component',
  render: PersonInfo,
  isExact: false
}

]

export { Person, PersonInfo, routes, Connector }
