import {questionNames as coreQuestionNames} from '@form8ion/core';
import {promptConstants as javascriptPromptConstants} from '@form8ion/javascript';

export const PACKAGE_DETAILS_PROMPT_ID = 'PACKAGE_DETAILS';

export const questionNames = {
  ...javascriptPromptConstants.questionNames,
  [PACKAGE_DETAILS_PROMPT_ID]: {
    ...coreQuestionNames,
    TARGET_PACKAGES_DIRECTORY: 'packagesDirectory'
  }
};

export const ids = {
  ...javascriptPromptConstants.ids,
  PACKAGE_DETAILS: PACKAGE_DETAILS_PROMPT_ID
};

export const promptConstants = {ids, questionNames};
