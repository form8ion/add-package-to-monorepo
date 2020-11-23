import * as javascriptScaffolder from '@travi/javascript-scaffolder';
import * as core from '@form8ion/core';
import {projectTypes} from '@form8ion/javascript-core';
import * as prompts from '@form8ion/overridable-prompts';
import {assert} from 'chai';
import sinon from 'sinon';
import any from '@travi/any';
import * as mkdir from '../thirdparty-wrappers/make-dir';
import scaffold from './scaffold';

suite('scaffold', () => {
  let sandbox;

  setup(() => {
    sandbox = sinon.createSandbox();

    sandbox.stub(process, 'cwd');
    sandbox.stub(mkdir, 'default');
    sandbox.stub(core, 'questionsForBaseDetails');
    sandbox.stub(prompts, 'prompt');
    sandbox.stub(javascriptScaffolder, 'scaffold');
  });

  teardown(() => sandbox.restore());

  test('that the package is scaffolded in the packages/ directory', async () => {
    const monorepoRoot = any.simpleObject();
    const projectName = any.word();
    const projectRoot = `${monorepoRoot}/packages/${projectName}`;
    const scaffoldResults = any.simpleObject();
    const visibility = any.word();
    const license = any.word();
    const promptAnswers = {
      ...any.simpleObject(),
      [core.questionNames.PROJECT_NAME]: projectName,
      [core.questionNames.VISIBILITY]: visibility,
      [core.questionNames.LICENSE]: license
    };
    const decisions = any.simpleObject();
    const copyrightHolder = any.word();
    const options = {...any.simpleObject(), decisions, overrides: {copyrightHolder}};
    const questions = any.listOf(any.simpleObject);
    core.questionsForBaseDetails.withArgs(decisions, undefined, copyrightHolder).returns(questions);
    prompts.prompt.withArgs(questions, decisions).resolves(promptAnswers);
    javascriptScaffolder.scaffold
      .withArgs({
        ...options,
        projectRoot,
        projectName,
        visibility,
        license,
        decisions: {...options.decisions, [javascriptScaffolder.questionNames.PROJECT_TYPE]: projectTypes.PACKAGE}
      })
      .resolves(scaffoldResults);
    process.cwd.returns(monorepoRoot);

    assert.deepEqual(await scaffold(options), scaffoldResults);
    assert.calledWith(mkdir.default, projectRoot);
  });

  test('that overrides are optional in the provided options', async () => {
    const monorepoRoot = any.simpleObject();
    const projectName = any.word();
    const projectRoot = `${monorepoRoot}/packages/${projectName}`;
    const scaffoldResults = any.simpleObject();
    const visibility = any.word();
    const license = any.word();
    const promptAnswers = {
      ...any.simpleObject(),
      [core.questionNames.PROJECT_NAME]: projectName,
      [core.questionNames.VISIBILITY]: visibility,
      [core.questionNames.LICENSE]: license
    };
    const decisions = any.simpleObject();
    const options = {...any.simpleObject(), decisions};
    const questions = any.listOf(any.simpleObject);
    core.questionsForBaseDetails.withArgs(decisions, undefined, undefined).returns(questions);
    prompts.prompt.withArgs(questions, decisions).resolves(promptAnswers);
    javascriptScaffolder.scaffold
      .withArgs({
        ...options,
        projectRoot,
        projectName,
        visibility,
        license,
        decisions: {...options.decisions, [javascriptScaffolder.questionNames.PROJECT_TYPE]: projectTypes.PACKAGE}
      })
      .resolves(scaffoldResults);
    process.cwd.returns(monorepoRoot);

    assert.deepEqual(await scaffold(options), scaffoldResults);
    assert.calledWith(mkdir.default, projectRoot);
  });
});
