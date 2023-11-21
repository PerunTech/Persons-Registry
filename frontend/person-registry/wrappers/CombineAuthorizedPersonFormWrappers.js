import { React } from 'perun-core'
import { PersonIdNoFieldFormWrapper, ModifyAuthrorizedPersonFormWrapper } from '.'

const CombineAuthorizedPersonFormWrappers = (props) => {
  return (
    <PersonIdNoFieldFormWrapper {...props}>
      <ModifyAuthrorizedPersonFormWrapper {...props}>
        {props.children}
      </ModifyAuthrorizedPersonFormWrapper>
    </PersonIdNoFieldFormWrapper>
  )
}

export default CombineAuthorizedPersonFormWrappers