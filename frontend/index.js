import { Search } from './components/Search'
import { DynamicRegistry } from './components/DynamicRegistry'
const routes = [
  {
    name: 'person-registry-person',
    path: '/main/persons-registry',
    render: Search,
    isExact: true
  },
  {
    name: 'person-registry-person-info',
    path: '/main/persons-registry/:tableName/:objectId/:component',
    render: DynamicRegistry,
    isExact: true
  }
]
export { routes }
