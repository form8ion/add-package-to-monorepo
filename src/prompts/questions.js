import {questionsForBaseDetails} from '@form8ion/core';
import {prompt} from '@form8ion/overridable-prompts';

import {questionNames} from './question-names.js';

export default function ({decisions, overrides: {copyrightHolder} = {}, packagesDirectories}) {
  const questions = questionsForBaseDetails(decisions, undefined, copyrightHolder);

  return prompt(
    [
      ...questions,
      {
        name: questionNames.TARGET_PACKAGES_DIRECTORY,
        message: 'Which packages directory should be targeted?',
        type: 'list',
        choices: packagesDirectories
      }
    ],
    {
      ...decisions,
      ...1 === packagesDirectories.length && {[questionNames.TARGET_PACKAGES_DIRECTORY]: packagesDirectories[0]}
    }
  );
}
