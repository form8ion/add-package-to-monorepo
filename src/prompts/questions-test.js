import * as core from '@form8ion/core';
import * as overridablePrompts from '@form8ion/overridable-prompts';

import sinon from 'sinon';
import any from '@travi/any';
import {assert} from 'chai';

import prompt from './questions';

suite('questions', () => {
  let sandbox;
  const answers = any.simpleObject();
  const questions = any.simpleObject();
  const decisions = any.simpleObject();

  setup(() => {
    sandbox = sinon.createSandbox();

    sandbox.stub(core, 'questionsForBaseDetails');
    sandbox.stub(overridablePrompts, 'prompt');
  });

  teardown(() => sandbox.restore());

  test('that information is gathered from the user', async () => {
    const copyrightHolder = any.word();
    core.questionsForBaseDetails.withArgs(decisions, undefined, copyrightHolder).returns(questions);
    overridablePrompts.prompt.withArgs(questions, decisions).resolves(answers);

    assert.deepEqual(await prompt({decisions, overrides: {copyrightHolder}}), answers);
  });

  test('that not providing `overrides` does not result in an error', async () => {
    core.questionsForBaseDetails.withArgs(decisions, undefined, undefined).returns(questions);
    overridablePrompts.prompt.withArgs(questions, decisions).resolves(answers);

    assert.deepEqual(await prompt({decisions, overrides: undefined}), answers);
  });
});
