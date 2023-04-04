import * as javascriptScaffolder from '@form8ion/javascript';
import * as readmeScaffolder from '@form8ion/readme';
import * as core from '@form8ion/core';
import {projectTypes} from '@form8ion/javascript-core';
import * as resultsReporter from '@form8ion/results-reporter';

import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import any from '@travi/any';
import {when} from 'jest-when';

import * as mkdir from '../thirdparty-wrappers/make-dir.js';
import * as execa from '../thirdparty-wrappers/execa.js';
import * as monorepoConfig from './monorepo-config/config-reader.js';
import * as prompt from './prompts/questions.js';
import * as packageManager from './package-manager.js';
import {questionNames} from './prompts/question-names.js';
import scaffold from './scaffold.js';

vi.mock('@form8ion/javascript');
vi.mock('@form8ion/readme');
vi.mock('@form8ion/results-reporter');
vi.mock('../thirdparty-wrappers/make-dir');
vi.mock('../thirdparty-wrappers/execa');
vi.mock('./monorepo-config/config-reader');
vi.mock('./prompts/questions');
vi.mock('./package-manager');
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

  beforeEach(() => {
    process.cwd = vi.fn();

    execaPipe = vi.fn();

    when(monorepoConfig.default)
      .calledWith(monorepoRoot)
      .mockResolvedValue({...any.simpleObject(), packagesDirectories, vcs});
    when(packageManager.default).calledWith(monorepoRoot).mockResolvedValue(manager);
    when(execa.default)
      .calledWith(verificationCommand, {shell: true, cwd: pathWithinMonorepo})
      .mockReturnValue({stdout: {pipe: execaPipe}});
  });

  afterEach(() => {
    vi.clearAllMocks();

    execaPipe = originalProcessCwd;
  });

  it('should scaffold the package in the `packages/` directory', async () => {
    const promptAnswers = {
      ...any.simpleObject(),
      [core.questionNames.PROJECT_NAME]: projectName,
      [core.questionNames.VISIBILITY]: visibility,
      [core.questionNames.LICENSE]: license,
      [core.questionNames.DESCRIPTION]: description,
      [questionNames.TARGET_PACKAGES_DIRECTORY]: packagesDirectory
    };
    const decisions = any.simpleObject();
    const copyrightHolder = any.word();
    const options = {...any.simpleObject(), decisions, overrides: {copyrightHolder}};
    process.cwd.mockReturnValue(monorepoRoot);
    when(prompt.default)
      .calledWith({decisions, overrides: {copyrightHolder}, packagesDirectories})
      .mockResolvedValue(promptAnswers);
    when(javascriptScaffolder.scaffold)
      .calledWith({
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
      .mockResolvedValue(scaffoldResults);

    expect(await scaffold(options)).toEqual(scaffoldResults);
    expect(mkdir.default).toHaveBeenCalledWith(projectRoot);
    expect(readmeScaffolder.scaffold).toHaveBeenCalledWith({projectRoot, projectName, description});
    expect(readmeScaffolder.lift).toHaveBeenCalledWith({projectRoot, results: scaffoldResults});
    expect(resultsReporter.reportResults).toHaveBeenCalledWith({nextSteps});
    expect(execaPipe).toHaveBeenCalledWith(process.stdout);
  });

  it('should determine the license as `UNLICENSED` when not chosen during prompting', async () => {
    const promptAnswers = {
      ...any.simpleObject(),
      [core.questionNames.PROJECT_NAME]: projectName,
      [core.questionNames.VISIBILITY]: visibility,
      [core.questionNames.DESCRIPTION]: description,
      [questionNames.TARGET_PACKAGES_DIRECTORY]: packagesDirectory
    };
    const decisions = any.simpleObject();
    const options = {...any.simpleObject(), decisions};
    process.cwd.mockReturnValue(monorepoRoot);
    when(prompt.default)
      .calledWith({decisions, overrides: undefined, packagesDirectories})
      .mockResolvedValue(promptAnswers);
    when(javascriptScaffolder.scaffold)
      .calledWith({
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
      .mockResolvedValue(scaffoldResults);

    expect(await scaffold(options)).toEqual(scaffoldResults);
    expect(mkdir.default).toHaveBeenCalledWith(projectRoot);
  });
});
