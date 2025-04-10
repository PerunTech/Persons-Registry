/**
 * A function used for restricting the type of value a user can enter in an
 * input of type 'text' (example: only a numeric value or a numeric value in
 * a certain range)
 * @param  {HTMLInputElement} input The input whose value we want to restrict
 * @param  {RegExp} inputFilter The filter which will be applied to the input
 * (the filter will be a regular expression)
 */
export function setInputFilter(input, inputFilter) {
  ['input', 'keydown', 'keyup', 'mousedown', 'mouseup', 'select', 'contextmenu', 'drop'].forEach(function (event) {
    input.addEventListener(event, function () {
      if (inputFilter(this.value)) {
        this.oldValue = this.value
        this.oldSelectionStart = this.selectionStart
        this.oldSelectionEnd = this.selectionEnd
      } else if (Object.prototype.hasOwnProperty.call(this, 'oldValue')) {
        this.value = this.oldValue
        this.setSelectionRange(this.oldSelectionStart, this.oldSelectionEnd)
      } else {
        this.value = ''
      }
    })
  })
}

export const getDynamicKey = () => {
  return (+ new Date() + Math.floor(Math.random() * 999999)).toString(36)
}