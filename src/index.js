import {questionNames as coreQuestionNames} from '@form8ion/core';
import {questionNames as jsQuestionNames} from '@form8ion/javascript';

import {questionNames as localQuestionNames} from './prompts/question-names.js';

export {default as scaffold} from './scaffold.js';
export const questionNames = {
  ...coreQuestionNames,
  ...jsQuestionNames,
  ...localQuestionNames
};
