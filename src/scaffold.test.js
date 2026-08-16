import {execa} from 'execa';
import * as core from '@form8ion/core';
import {scaffold as scaffoldJavascript, lift as liftJavascript} from '@form8ion/javascript';
import * as readmeScaffolder from '@form8ion/readme';

import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import any from '@travi/any';
import {when} from 'vitest-when';

import * as mkdir from '../thirdparty-wrappers/make-dir.js';
import * as monorepoConfig from './monorepo-config/config-reader.js';
import * as prompt from './prompts/questions.js';
import * as packageManager from './package-manager.js';
import {MONOREPO_DETAILS_PROMPT_ID, questionNames} from './prompts/question-names.js';
import injectJavascriptAnswersIntoPrompt from './javascript-answers-prompt.js';
import scaffold from './scaffold.js';

vi.mock('execa');
vi.mock('@form8ion/javascript');
vi.mock('@form8ion/readme');
vi.mock('@form8ion/results-reporter');
vi.mock('../thirdparty-wrappers/make-dir');
vi.mock('./monorepo-config/config-reader');
vi.mock('./prompts/questions');
vi.mock('./package-manager');
vi.mock('./javascript-answers-prompt.js');

const {TARGET_PACKAGES_DIRECTORY} = questionNames[MONOREPO_DETAILS_PROMPT_ID];

describe('scaffold', () => {
  let execaPipe;
  const originalProcessCwd = process.cwd;
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
  const liftResults = any.simpleObject();
  const dependencies = {
    ...any.simpleObject(),
    logger: {info: () => undefined},
    prompt: vi.fn()
  };

  beforeEach(() => {
    process.cwd = vi.fn();

    execaPipe = vi.fn();

    when(monorepoConfig.default)
      .calledWith(monorepoRoot, dependencies)
      .thenResolve({...any.simpleObject(), packagesDirectories, vcs});
    when(packageManager.default).calledWith(monorepoRoot).thenResolve(manager);
    when(execa)
      .calledWith(verificationCommand, {shell: true, cwd: pathWithinMonorepo})
      .thenReturn({stdout: {pipe: execaPipe}});
  });

  afterEach(() => {
    process.cwd = originalProcessCwd;
  });

  it('should scaffold the package in the `packages/` directory', async () => {
    const promptAnswers = {
      ...any.simpleObject(),
      [core.questionNames.PROJECT_NAME]: projectName,
      [core.questionNames.VISIBILITY]: visibility,
      [core.questionNames.LICENSE]: license,
      [core.questionNames.DESCRIPTION]: description,
      [TARGET_PACKAGES_DIRECTORY]: packagesDirectory
    };
    const copyrightHolder = any.word();
    const options = {...any.simpleObject(), overrides: {copyrightHolder}};
    const injectedJavascriptPrompt = vi.fn();
    process.cwd.mockReturnValue(monorepoRoot);
    when(prompt.default)
      .calledWith({overrides: {copyrightHolder}, packagesDirectories}, dependencies.prompt)
      .thenResolve(promptAnswers);
    when(injectJavascriptAnswersIntoPrompt)
      .calledWith(dependencies.prompt, manager)
      .thenReturn(injectedJavascriptPrompt);
    when(scaffoldJavascript)
      .calledWith({
        ...options,
        projectRoot,
        projectName,
        description,
        visibility,
        license,
        vcs,
        pathWithinParent: `${packagesDirectory}/${projectName}`
      }, {...dependencies, prompt: injectedJavascriptPrompt})
      .thenResolve(scaffoldResults);
    when(liftJavascript)
      .calledWith({
        projectRoot,
        results: scaffoldResults,
        vcs,
        pathWithinParent: `${packagesDirectory}/${projectName}`
      }, dependencies)
      .thenResolve(liftResults);

    expect(await scaffold(options, dependencies)).toEqual(scaffoldResults);
    expect(mkdir.default).toHaveBeenCalledWith(projectRoot);
    expect(readmeScaffolder.scaffold).toHaveBeenCalledWith({projectRoot, projectName, description}, dependencies);
    expect(readmeScaffolder.lift).toHaveBeenCalledWith({projectRoot, results: liftResults}, dependencies);
    expect(execaPipe).toHaveBeenCalledWith(process.stdout);
  });

  it('should determine the license as `UNLICENSED` when not chosen during prompting', async () => {
    const promptAnswers = {
      ...any.simpleObject(),
      [core.questionNames.PROJECT_NAME]: projectName,
      [core.questionNames.VISIBILITY]: visibility,
      [core.questionNames.DESCRIPTION]: description,
      [TARGET_PACKAGES_DIRECTORY]: packagesDirectory
    };
    const options = any.simpleObject();
    const injectedJavascriptPrompt = vi.fn();
    process.cwd.mockReturnValue(monorepoRoot);
    when(prompt.default)
      .calledWith({overrides: undefined, packagesDirectories}, dependencies.prompt)
      .thenResolve(promptAnswers);
    when(injectJavascriptAnswersIntoPrompt)
      .calledWith(dependencies.prompt, manager)
      .thenReturn(injectedJavascriptPrompt);
    when(scaffoldJavascript)
      .calledWith({
        ...options,
        projectRoot,
        projectName,
        description,
        visibility,
        license: 'UNLICENSED',
        vcs,
        pathWithinParent: `${packagesDirectory}/${projectName}`
      }, {...dependencies, prompt: injectedJavascriptPrompt})
      .thenResolve(scaffoldResults);

    expect(await scaffold(options, dependencies)).toEqual(scaffoldResults);
    expect(mkdir.default).toHaveBeenCalledWith(projectRoot);
  });
});
