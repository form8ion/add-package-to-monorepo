import {questionsForBaseDetails} from '@form8ion/core';
import {prompt} from '@form8ion/overridable-prompts';
import {questionNames} from './question-names';

export default async function ({decisions, overrides: {copyrightHolder} = {}, packagesDirectories}) {
  const questions = questionsForBaseDetails(decisions, undefined, copyrightHolder);

  const answers = await prompt(questions, decisions);

  return {...answers, [questionNames.PACKAGES_DIRECTORY]: packagesDirectories[0]};
}
