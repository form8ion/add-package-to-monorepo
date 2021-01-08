import deepmerge from 'deepmerge';
import {questionNames, questionsForBaseDetails} from '@form8ion/core';
import {projectTypes} from '@form8ion/javascript-core';
import {prompt} from '@form8ion/overridable-prompts';
import {scaffold, questionNames as jsQuestionNames} from '@travi/javascript-scaffolder';
import mkdir from '../thirdparty-wrappers/make-dir';
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
    [questionNames.LICENSE]: chosenLicense
  } = answers;
  const pathWithinMonorepo = `${packagesDirectory}/${projectName}`;
  const projectRoot = `${monorepoRoot}/${pathWithinMonorepo}`;

  await mkdir(projectRoot);

  return scaffold(deepmerge(
    options,
    {
      projectRoot,
      projectName,
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
}
