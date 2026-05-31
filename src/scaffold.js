import {execa} from 'execa';
import deepmerge from 'deepmerge';
import {questionNames as coreQuestionNames} from '@form8ion/core';
import {projectTypes} from '@form8ion/javascript-core';
import {lift, questionNames as jsQuestionNames, scaffold} from '@form8ion/javascript';
import {lift as liftReadme, scaffold as scaffoldReadme} from '@form8ion/readme';
import {reportResults} from '@form8ion/results-reporter';

import mkdir from '../thirdparty-wrappers/make-dir.js';
import getMonorepoConfig from './monorepo-config/config-reader.js';
import prompt from './prompts/questions.js';
import {questionNames} from './prompts/question-names.js';
import determinePackageManager from './package-manager.js';

export default async function scaffoldMonorepo(options, dependencies) {
  const monorepoRoot = process.cwd();
  const {overrides, decisions} = options;
  const {logger} = dependencies;
  const {packagesDirectories, vcs} = await getMonorepoConfig(monorepoRoot, dependencies);
  const answers = await prompt({decisions, overrides, packagesDirectories});

  const {
    [coreQuestionNames.PROJECT_NAME]: projectName,
    [coreQuestionNames.VISIBILITY]: visibility,
    [coreQuestionNames.LICENSE]: chosenLicense,
    [coreQuestionNames.DESCRIPTION]: description,
    [questionNames.TARGET_PACKAGES_DIRECTORY]: packagesDirectory
  } = answers;
  const pathWithinMonorepo = `${packagesDirectory}/${projectName}`;
  const projectRoot = `${monorepoRoot}/${pathWithinMonorepo}`;

  await mkdir(projectRoot);

  await scaffoldReadme({projectRoot, projectName, description});

  const scaffoldResults = await scaffold(deepmerge(
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
  ), dependencies);

  const liftResults = await lift(
    {projectRoot, results: scaffoldResults, vcs, pathWithinParent: pathWithinMonorepo},
    dependencies
  );

  await liftReadme({projectRoot, results: liftResults});

  logger.info('Verifying the generated project');

  const subprocess = execa(scaffoldResults.verificationCommand, {shell: true, cwd: pathWithinMonorepo});
  subprocess.stdout.pipe(process.stdout);
  await subprocess;

  reportResults({nextSteps: scaffoldResults.nextSteps});

  return scaffoldResults;
}
