import {questionsForBaseDetails} from '@form8ion/core';

import {PACKAGE_DETAILS_PROMPT_ID, questionNames} from './question-names.js';

const {TARGET_PACKAGES_DIRECTORY} = questionNames[PACKAGE_DETAILS_PROMPT_ID];

export default async function promptForPackageDetails(
  {overrides: {copyrightHolder} = {}, packagesDirectories},
  prompt
) {
  const baseDetailsQuestions = questionsForBaseDetails(undefined, undefined, copyrightHolder);
  const targetPackagesDirectoryQuestion = {
    name: TARGET_PACKAGES_DIRECTORY,
    message: 'Which packages directory should be targeted?',
    type: 'list',
    choices: packagesDirectories
  };

  if (1 === packagesDirectories.length) {
    return {
      ...await prompt({id: PACKAGE_DETAILS_PROMPT_ID, questions: baseDetailsQuestions}),
      [TARGET_PACKAGES_DIRECTORY]: packagesDirectories[0]
    };
  }

  return prompt({
    id: PACKAGE_DETAILS_PROMPT_ID,
    questions: [...baseDetailsQuestions, targetPackagesDirectoryQuestion]
  });
}
