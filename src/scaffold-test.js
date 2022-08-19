import * as javascriptScaffolder from '@form8ion/javascript';
import * as readmeScaffolder from '@form8ion/readme';
import * as core from '@form8ion/core';
import {projectTypes} from '@form8ion/javascript-core';
import * as resultsReporter from '@form8ion/results-reporter';

import {assert} from 'chai';
import sinon from 'sinon';
import any from '@travi/any';

import * as mkdir from '../thirdparty-wrappers/make-dir';
import * as execa from '../thirdparty-wrappers/execa';
import * as monorepoConfig from './monorepo-config/config-reader';
import * as prompt from './prompts/questions';
import * as packageManager from './package-manager';
import scaffold from './scaffold';
import {questionNames} from './prompts/question-names';

suite('scaffold', () => {
  let sandbox, execaPipe;
  const monorepoRoot = any.string();
  const projectName = any.word();
  const description = any.sentence();
  const packagesDirectories = any.listOf(any.word);
  const packagesDirectory = any.string();
  const pathWithinMonorepo = `${packagesDirectory}/${projectName}`;
  const projectRoot = `${monorepoRoot}/${pathWithinMonorepo}`;
  const nextSteps = any.listOf(any.word);
  const visibility = any.word();
  const license = any.word();
  const manager = any.word();
  const vcs = any.simpleObject();
  const verificationCommand = any.string();
  const scaffoldResults = {...any.simpleObject(), nextSteps, verificationCommand};

  setup(() => {
    sandbox = sinon.createSandbox();

    sandbox.stub(process, 'cwd');
    sandbox.stub(mkdir, 'default');
    sandbox.stub(javascriptScaffolder, 'scaffold');
    sandbox.stub(readmeScaffolder, 'scaffold');
    sandbox.stub(readmeScaffolder, 'lift');
    sandbox.stub(monorepoConfig, 'default');
    sandbox.stub(prompt, 'default');
    sandbox.stub(packageManager, 'default');
    sandbox.stub(resultsReporter, 'reportResults');
    sandbox.stub(execa, 'default');

    monorepoConfig.default.withArgs(monorepoRoot).resolves({...any.simpleObject(), packagesDirectories, vcs});
    packageManager.default.withArgs(monorepoRoot).resolves(manager);

    execaPipe = sinon.spy();
    execa.default
      .withArgs(verificationCommand, {shell: true, cwd: pathWithinMonorepo})
      .returns({stdout: {pipe: execaPipe}});
  });

  teardown(() => sandbox.restore());

  test('that the package is scaffolded in the packages/ directory', async () => {
    const promptAnswers = {
      ...any.simpleObject(),
      [core.questionNames.PROJECT_NAME]: projectName,
      [core.questionNames.VISIBILITY]: visibility,
      [core.questionNames.LICENSE]: license,
      [core.questionNames.DESCRIPTION]: description,
      [questionNames.PACKAGES_DIRECTORY]: packagesDirectory
    };
    const decisions = any.simpleObject();
    const copyrightHolder = any.word();
    const options = {...any.simpleObject(), decisions, overrides: {copyrightHolder}};
    prompt.default.withArgs({decisions, overrides: {copyrightHolder}, packagesDirectories}).resolves(promptAnswers);
    javascriptScaffolder.scaffold
      .withArgs({
        ...options,
        projectRoot,
        projectName,
        description,
        visibility,
        license,
        decisions: {
          ...options.decisions,
          [javascriptScaffolder.questionNames.PROJECT_TYPE]: projectTypes.PACKAGE,
          [javascriptScaffolder.questionNames.PACKAGE_MANAGER]: manager
        },
        vcs,
        pathWithinParent: `${packagesDirectory}/${projectName}`
      })
      .resolves(scaffoldResults);
    process.cwd.returns(monorepoRoot);

    assert.deepEqual(await scaffold(options), scaffoldResults);
    assert.calledWith(mkdir.default, projectRoot);
    assert.calledWith(readmeScaffolder.scaffold, {projectRoot, projectName, description});
    assert.calledWith(readmeScaffolder.lift, {projectRoot, results: scaffoldResults});
    assert.calledWith(resultsReporter.reportResults, {nextSteps});
    assert.calledWith(execaPipe, process.stdout);
  });

  test('that license is determined to be `UNLICENSED` when not chosen during prompting', async () => {
    const promptAnswers = {
      ...any.simpleObject(),
      [core.questionNames.PROJECT_NAME]: projectName,
      [core.questionNames.VISIBILITY]: visibility,
      [core.questionNames.DESCRIPTION]: description,
      [questionNames.PACKAGES_DIRECTORY]: packagesDirectory
    };
    const decisions = any.simpleObject();
    const options = {...any.simpleObject(), decisions};
    prompt.default.withArgs({decisions, overrides: undefined, packagesDirectories}).resolves(promptAnswers);
    javascriptScaffolder.scaffold
      .withArgs({
        ...options,
        projectRoot,
        projectName,
        description,
        visibility,
        license: 'UNLICENSED',
        decisions: {
          ...options.decisions,
          [javascriptScaffolder.questionNames.PROJECT_TYPE]: projectTypes.PACKAGE,
          [javascriptScaffolder.questionNames.PACKAGE_MANAGER]: manager
        },
        vcs,
        pathWithinParent: `${packagesDirectory}/${projectName}`
      })
      .resolves(scaffoldResults);
    process.cwd.returns(monorepoRoot);

    assert.deepEqual(await scaffold(options), scaffoldResults);
    assert.calledWith(mkdir.default, projectRoot);
  });
});
