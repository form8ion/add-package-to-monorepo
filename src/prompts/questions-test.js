import * as core from '@form8ion/core';
import * as overridablePrompts from '@form8ion/overridable-prompts';

import sinon from 'sinon';
import any from '@travi/any';
import {assert} from 'chai';

import prompt from './questions';
import {questionNames} from './question-names';

suite('questions', () => {
  let sandbox;
  const answers = any.simpleObject();
  const coreQuestions = any.listOf(any.simpleObject, {size: any.integer({min: 2, max: 10})});
  const decisions = any.simpleObject();
  const packagesDirectories = any.listOf(any.word);
  const questions = [
    ...coreQuestions,
    {
      name: questionNames.TARGET_PACKAGES_DIRECTORY,
      message: 'Which packages directory should be targeted?',
      type: 'list',
      choices: packagesDirectories
    }
  ];

  setup(() => {
    sandbox = sinon.createSandbox();

    sandbox.stub(core, 'questionsForBaseDetails');
    sandbox.stub(overridablePrompts, 'prompt');
  });

  teardown(() => sandbox.restore());

  test('that information is gathered from the user', async () => {
    const copyrightHolder = any.word();
    core.questionsForBaseDetails.withArgs(decisions, undefined, copyrightHolder).returns(coreQuestions);
    overridablePrompts.prompt.withArgs(questions, decisions).resolves(answers);

    assert.deepEqual(
      await prompt({decisions, overrides: {copyrightHolder}, packagesDirectories}),
      answers
    );
  });

  test('that not providing `overrides` does not result in an error', async () => {
    core.questionsForBaseDetails.withArgs(decisions, undefined, undefined).returns(coreQuestions);
    overridablePrompts.prompt.withArgs(questions, decisions).resolves(answers);

    assert.deepEqual(
      await prompt({decisions, overrides: undefined, packagesDirectories}),
      answers
    );
  });

  test('that the question about target directory is skipped if only one possibility exists', async () => {
    const packagesDirectory = any.word();
    core.questionsForBaseDetails.withArgs(decisions, undefined, undefined).returns(coreQuestions);
    overridablePrompts.prompt
      .withArgs(
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
      )
      .resolves(answers);

    assert.deepEqual(
      await prompt({decisions, overrides: undefined, packagesDirectories: [packagesDirectory]}),
      answers
    );
  });
});
