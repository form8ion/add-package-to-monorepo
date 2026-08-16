import * as core from '@form8ion/core';

import {describe, expect, it, vi} from 'vitest';
import any from '@travi/any';
import {when} from 'vitest-when';

import {PACKAGE_DETAILS_PROMPT_ID, questionNames} from './question-names.js';
import prompt from './questions.js';

vi.mock('@form8ion/core');

const {TARGET_PACKAGES_DIRECTORY} = questionNames[PACKAGE_DETAILS_PROMPT_ID];

describe('questions', () => {
  const answers = any.simpleObject();
  const coreQuestions = any.listOf(any.simpleObject, {size: any.integer({min: 2, max: 10})});
  const packagesDirectories = any.listOf(any.word, {size: any.integer({min: 2, max: 10})});
  const questions = [
    ...coreQuestions,
    {
      name: TARGET_PACKAGES_DIRECTORY,
      message: 'Which packages directory should be targeted?',
      type: 'list',
      choices: packagesDirectories
    }
  ];

  it('should gather information from the user', async () => {
    const copyrightHolder = any.word();
    const injectedPrompt = vi.fn();
    when(core.questionsForBaseDetails).calledWith(undefined, undefined, copyrightHolder).thenReturn(coreQuestions);
    when(injectedPrompt)
      .calledWith({id: PACKAGE_DETAILS_PROMPT_ID, questions})
      .thenResolve(answers);

    expect(await prompt({overrides: {copyrightHolder}, packagesDirectories}, injectedPrompt)).toEqual(answers);
  });

  it('should not result in an error when not providing `overrides`', async () => {
    const injectedPrompt = vi.fn();
    when(core.questionsForBaseDetails).calledWith(undefined, undefined, undefined).thenReturn(coreQuestions);
    when(injectedPrompt)
      .calledWith({id: PACKAGE_DETAILS_PROMPT_ID, questions})
      .thenResolve(answers);

    expect(await prompt({overrides: undefined, packagesDirectories}, injectedPrompt)).toEqual(answers);
  });

  it('should skip the question about target directory if only one possibility exists', async () => {
    const packagesDirectory = any.word();
    const injectedPrompt = vi.fn();
    const answersFromPrompt = any.simpleObject();
    when(core.questionsForBaseDetails).calledWith(undefined, undefined, undefined).thenReturn(coreQuestions);
    when(injectedPrompt)
      .calledWith({id: PACKAGE_DETAILS_PROMPT_ID, questions: coreQuestions})
      .thenResolve(answersFromPrompt);

    expect(await prompt({overrides: undefined, packagesDirectories: [packagesDirectory]}, injectedPrompt)).toEqual({
      ...answersFromPrompt,
      [TARGET_PACKAGES_DIRECTORY]: packagesDirectory
    });
  });
});
