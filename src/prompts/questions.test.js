import * as core from '@form8ion/core';
import * as overridablePrompts from '@form8ion/overridable-prompts';

import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import any from '@travi/any';
import {when} from 'jest-when';

import {questionNames} from './question-names';
import prompt from './questions';

describe('questions', () => {
  const answers = any.simpleObject();
  const coreQuestions = any.listOf(any.simpleObject, {size: any.integer({min: 2, max: 10})});
  const decisions = any.simpleObject();
  const packagesDirectories = any.listOf(any.word, {size: any.integer({min: 2, max: 10})});
  const questions = [
    ...coreQuestions,
    {
      name: questionNames.TARGET_PACKAGES_DIRECTORY,
      message: 'Which packages directory should be targeted?',
      type: 'list',
      choices: packagesDirectories
    }
  ];

  beforeEach(() => {
    vi.mock('@form8ion/core');
    vi.mock('@form8ion/overridable-prompts');
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should gather information from the user', async () => {
    const copyrightHolder = any.word();
    when(core.questionsForBaseDetails).calledWith(decisions, undefined, copyrightHolder).mockReturnValue(coreQuestions);
    when(overridablePrompts.prompt).calledWith(questions, decisions).mockResolvedValue(answers);

    expect(await prompt({decisions, overrides: {copyrightHolder}, packagesDirectories})).toEqual(answers);
  });

  it('should not result in an error when not providing `overrides`', async () => {
    when(core.questionsForBaseDetails).calledWith(decisions, undefined, undefined).mockReturnValue(coreQuestions);
    when(overridablePrompts.prompt).calledWith(questions, decisions).mockResolvedValue(answers);

    expect(await prompt({decisions, overrides: undefined, packagesDirectories})).toEqual(answers);
  });

  it('should skip the question about target directory if only one possibility exists', async () => {
    const packagesDirectory = any.word();
    when(core.questionsForBaseDetails).calledWith(decisions, undefined, undefined).mockReturnValue(coreQuestions);
    when(overridablePrompts.prompt).calledWith(
      [
        ...coreQuestions,
        {
          name: questionNames.TARGET_PACKAGES_DIRECTORY,
          message: 'Which packages directory should be targeted?',
          type: 'list',
          choices: [packagesDirectory]
        }
      ],
      {...decisions, [questionNames.TARGET_PACKAGES_DIRECTORY]: packagesDirectory}
    ).mockResolvedValue(answers);

    expect(await prompt({decisions, overrides: undefined, packagesDirectories: [packagesDirectory]})).toEqual(answers);
  });
});
