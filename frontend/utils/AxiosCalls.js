/**
* MANDATORY PARAMETERS
* @param {array} urlArr - array of ws
* @param {string} session - props svSession
* @param {string} methodType - 'post' or 'get' method for axios
* @param {function} hasCallback - callback function to execute something
* OPTIONAL PARAMETERS
* @param {object} form_params - form_params for 'post' method
*/
import { axios, elements, redux } from 'perun-core'
const { alertUserResponse } = elements

export function axiosCall(urlArr, session, hasCallback, methodType, form_params) {
  redux.store.dispatch({ type: 'SEARCH_LOADING', payload: true })
  if (urlArr) {
    for (let i = 0; i < urlArr.length; i++) {
      axios({
        method: methodType,
        data: form_params ? JSON.stringify(form_params) : null,
        url: urlArr[i],
        headers: methodType === 'get' ? null : { 'Content-Type': 'application/x-www-form-urlencoded' }
      }).then(function (response) {
        if (response?.data) {
          let takeLast = urlArr[i].split('/').pop()
          let personType
          if (takeLast.length === 1 && takeLast.match(/[a-z]/i)) {
            personType = takeLast
          }
          hasCallback(response.data, urlArr.length - 1, i, personType)
        }
        redux.store.dispatch({ type: 'SEARCH_LOADING_FINISHED', payload: false })
      }).catch(function (error) {
        console.error(error)
        redux.store.dispatch({ type: 'SEARCH_LOADING_FINISHED', payload: false })
        alertUserResponse({ response: error })
        if (error.response && error.response.data && error.response.data.type) {
          hasCallback(error.response.data, urlArr.length - 1, i)
        }
      })
    }
  } else {
    console.warn('Check your params')
  }
}