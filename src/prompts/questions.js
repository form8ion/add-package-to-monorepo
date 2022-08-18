import {questionsForBaseDetails} from '@form8ion/core';
import {prompt} from '@form8ion/overridable-prompts';

export default function ({decisions, overrides: {copyrightHolder} = {}}) {
  const questions = questionsForBaseDetails(decisions, undefined, copyrightHolder);

  return prompt(questions, decisions);
}
