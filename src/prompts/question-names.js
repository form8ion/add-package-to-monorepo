import {questionNames as coreQuestionNames} from '@form8ion/core';
import {promptConstants as javascriptPromptConstants} from '@form8ion/javascript';

export const MONOREPO_DETAILS_PROMPT_ID = 'MONOREPO_DETAILS';

export const questionNames = {
  ...javascriptPromptConstants.questionNames,
  [MONOREPO_DETAILS_PROMPT_ID]: {
    ...coreQuestionNames,
    TARGET_PACKAGES_DIRECTORY: 'packagesDirectory'
  }
};

export const ids = {
  ...javascriptPromptConstants.ids,
  MONOREPO_DETAILS: MONOREPO_DETAILS_PROMPT_ID
};

export const promptConstants = {ids, questionNames};
