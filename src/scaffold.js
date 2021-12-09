import deepmerge from 'deepmerge';
import {questionNames, questionsForBaseDetails} from '@form8ion/core';
import {projectTypes} from '@form8ion/javascript-core';
import {prompt} from '@form8ion/overridable-prompts';
import {scaffold, questionNames as jsQuestionNames} from '@form8ion/javascript';
import {info} from '@travi/cli-messages';
import {lift as liftReadme, scaffold as scaffoldReadme} from '@form8ion/readme';
import {reportResults} from '@form8ion/results-reporter';
import mkdir from '../thirdparty-wrappers/make-dir';
import execa from '../thirdparty-wrappers/execa';
import getMonorepoConfig from './monorepo-config';
import determinePackageManager from './package-manager';

export default async function (options) {
  const monorepoRoot = process.cwd();
  const {overrides, decisions} = options;
  const questions = questionsForBaseDetails(decisions, undefined, overrides?.copyrightHolder);
  const {packagesDirectory, vcs} = await getMonorepoConfig(monorepoRoot);
  const answers = await prompt(questions, decisions);

  const {
    [questionNames.PROJECT_NAME]: projectName,
    [questionNames.VISIBILITY]: visibility,
    [questionNames.LICENSE]: chosenLicense,
    [questionNames.DESCRIPTION]: description
  } = answers;
  const pathWithinMonorepo = `${packagesDirectory}/${projectName}`;
  const projectRoot = `${monorepoRoot}/${pathWithinMonorepo}`;

  await mkdir(projectRoot);

  await scaffoldReadme({projectRoot, projectName, description});

  const results = await scaffold(deepmerge(
    options,
    {
      projectRoot,
      projectName,
      description,
      visibility,
      license: chosenLicense || 'UNLICENSED',
      decisions: {
        [jsQuestionNames.PROJECT_TYPE]: projectTypes.PACKAGE,
        [jsQuestionNames.PACKAGE_MANAGER]: await determinePackageManager(monorepoRoot)
      },
      vcs,
      pathWithinParent: pathWithinMonorepo
    }
  ));

  await liftReadme({projectRoot, results});

  info('Verifying the generated project');

  const subprocess = execa(results.verificationCommand, {shell: true, cwd: pathWithinMonorepo});
  subprocess.stdout.pipe(process.stdout);
  await subprocess;

  reportResults({nextSteps: results.nextSteps});

  return results;
}
