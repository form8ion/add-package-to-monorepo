import {promptConstants as jsPromptConstants} from '@form8ion/javascript';
import {projectTypes} from '@form8ion/javascript-core';

const {
  [jsPromptConstants.ids.JAVASCRIPT_BASE_DETAILS]: baseDetailsQuestionNames
} = jsPromptConstants.questionNames;

export default function injectJavascriptAnswersIntoPrompt(prompt, packageManager) {
  return async promptDetails => {
    const {id, questions} = promptDetails;

    if (jsPromptConstants.ids.JAVASCRIPT_BASE_DETAILS === id) {
      const forcedAnswers = {
        [baseDetailsQuestionNames.PROJECT_TYPE]: projectTypes.PACKAGE,
        [baseDetailsQuestionNames.PACKAGE_MANAGER]: packageManager
      };
      const remainingQuestions = questions.filter(({name}) => !(name in forcedAnswers));

      return {...await prompt({...promptDetails, questions: remainingQuestions}), ...forcedAnswers};
    }

    return prompt(promptDetails);
  };
}
