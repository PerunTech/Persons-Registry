/**
* MANDATORY PARAMETERS
* @param {string} checkLabel - type of label
* @param {string} context - imported context from component where LabelsExport is used
* OPTIONAL PARAMETERS
* @param {string} moduleNameParam - name of the module where label is used
*/

export const labelsManager = {
  importLabel (checkLabel, moduleNameParam, context) {
    if (checkLabel && context) {
      if (moduleNameParam) {
        return context.intl.formatMessage({ id: `perun.${moduleNameParam}.${checkLabel}`, defaultMessage: `perun.${moduleNameParam}.${checkLabel}` })
      } else {
        return context.intl.formatMessage({ id: `perun.generalLabel.${checkLabel}`, defaultMessage: `perun.generalLabel.${checkLabel}` })
      }
    } else {
      console.warn('Check your params')
    }
  }
}