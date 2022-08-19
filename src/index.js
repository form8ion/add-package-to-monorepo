import {questionNames as coreQuestionNames} from '@form8ion/core';
import {questionNames as jsQuestionNames} from '@form8ion/javascript';

import {questionNames as localQuestionNames} from './prompts/question-names';

export {default as scaffold} from './scaffold';
export const questionNames = {
  ...coreQuestionNames,
  ...jsQuestionNames,
  ...localQuestionNames
};
