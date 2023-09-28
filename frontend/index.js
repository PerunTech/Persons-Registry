/**
 * Import all internal indexes, thus including the code in the final build.
 * export all content representing the surface of your plugin API. Noone is expected to call, but wth.
 * Wait to be called for render, Core will call you.
 */
import PersonWrapper from './person-registry/PersonWrapper'
import PersonInfo from './person-registry/PersonInfo'
import Connector from './person-registry/components/Connector'

const routes = [{
    name: 'persons-registry-person',
    path: '/main/persons-registry',
    render: PersonWrapper,
    isExact: true
  } , {
    name: 'persons-registry-person-info',
    path: '/main/persons-registry/person/:objId/:personType/:name',
    render: PersonInfo,
    isExact: false
  }

]

export {PersonWrapper, PersonInfo, routes, Connector}
