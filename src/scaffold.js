import {execa} from 'execa';
import deepmerge from 'deepmerge';
import {questionNames as coreQuestionNames} from '@form8ion/core';
import {lift, scaffold} from '@form8ion/javascript';
import {lift as liftReadme, scaffold as scaffoldReadme} from '@form8ion/readme';

import mkdir from '../thirdparty-wrappers/make-dir.js';
import getMonorepoConfig from './monorepo-config/config-reader.js';
import prompt from './prompts/questions.js';
import {MONOREPO_DETAILS_PROMPT_ID, questionNames} from './prompts/question-names.js';
import determinePackageManager from './package-manager.js';
import injectJavascriptAnswersIntoPrompt from './javascript-answers-prompt.js';

const {TARGET_PACKAGES_DIRECTORY} = questionNames[MONOREPO_DETAILS_PROMPT_ID];

export default async function scaffoldMonorepo(options, dependencies) {
  const monorepoRoot = process.cwd();
  const {overrides} = options;
  const {logger} = dependencies;
  const {packagesDirectories, vcs} = await getMonorepoConfig(monorepoRoot, dependencies);
  const answers = await prompt({overrides, packagesDirectories}, dependencies.prompt);

  const {
    [coreQuestionNames.PROJECT_NAME]: projectName,
    [coreQuestionNames.VISIBILITY]: visibility,
    [coreQuestionNames.LICENSE]: chosenLicense,
    [coreQuestionNames.DESCRIPTION]: description,
    [TARGET_PACKAGES_DIRECTORY]: packagesDirectory
  } = answers;
  const pathWithinMonorepo = `${packagesDirectory}/${projectName}`;
  const projectRoot = `${monorepoRoot}/${pathWithinMonorepo}`;

  await mkdir(projectRoot);

  await scaffoldReadme({projectRoot, projectName, description}, dependencies);

  const packageManager = await determinePackageManager(monorepoRoot);
  const scaffoldResults = await scaffold(deepmerge(
    options,
    {
      projectRoot,
      projectName,
      description,
      visibility,
      license: chosenLicense || 'UNLICENSED',
      vcs,
      pathWithinParent: pathWithinMonorepo
    }
  ), {
    ...dependencies,
    prompt: injectJavascriptAnswersIntoPrompt(dependencies.prompt, packageManager)
  });

  const liftResults = await lift(
    {projectRoot, results: scaffoldResults, vcs, pathWithinParent: pathWithinMonorepo},
    dependencies
  );

  await liftReadme({projectRoot, results: liftResults}, dependencies);

  logger.info('Verifying the generated project');

  const subprocess = execa(scaffoldResults.verificationCommand, {shell: true, cwd: pathWithinMonorepo});
  subprocess.stdout.pipe(process.stdout);
  await subprocess;

  return scaffoldResults;
}
