/**
* MANDATORY PARAMETERS
* @param {array} urlArr - array of ws
* @param {string} session - props svSession
* @param {string} methodType - 'post' or 'get' method for axios
* @param {function} hasCallback - callback function to execute something
* OPTIONAL PARAMETERS
* @param {object} form_params - form_params for 'post' method
*/

import {axios, elements} from 'perun-core'
const {alertUser} = elements
import { logOut } from './LogOut'

export function axiosCall (urlArr, session, hasCallback, methodType, form_params) {
  if (urlArr) {
    for (let i = 0; i < urlArr.length; i++) {
      axios({
        method: methodType,
        data: form_params ? form_params : null,
        url: urlArr[i],
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      }).then(function (response) {
        if (response.data) {
          if (response.data.type === 'ERROR' && response.data.title === 'Невалидна сесија') {
            alertUser(true, response.data.type.toLowerCase(), response.data.title, response.data.message)
            logOut(session)
          } else {
            let takeLast = urlArr[i].split('/').pop()
            let personType
            if (takeLast.length === 1 && takeLast.match(/[a-z]/i)) {
              personType = takeLast
            }
            hasCallback(response.data, urlArr.length-1, i, personType)
          }
        }
      }).catch(function (error) {
        if (error.response && error.response.data && error.response.data.type) {
          hasCallback(error.response.data, urlArr.length-1, i)
        }
      })
    }
  } else {
    console.warn('Check your params')
  }
}