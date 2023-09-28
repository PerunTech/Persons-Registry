import { redux } from 'perun-core'

export function logOut (svSession) {
  const url = window.server + '/SvSecurity/logout/' + svSession
  redux.store.dispatch(redux.logoutUser(url))
}