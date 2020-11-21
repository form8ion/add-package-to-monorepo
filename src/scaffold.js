import deepmerge from 'deepmerge';
import {scaffold, questionNames as jsQuestionNames} from '@travi/javascript-scaffolder';
import {projectTypes} from '@form8ion/javascript-core';
import mkdir from '../thirdparty-wrappers/make-dir';
import {questionNames} from './question-names';

export default async function (options) {
  const projectName = options.decisions[questionNames.PROJECT_NAME];
  const projectRoot = `${process.cwd()}/packages/${projectName}`;

  await mkdir(projectRoot);

  return scaffold(deepmerge(
    options,
    {
      projectRoot,
      projectName,
      visibility: 'Public',
      license: 'MIT',
      decisions: {[jsQuestionNames.PROJECT_TYPE]: projectTypes.PACKAGE}
    }
  ));
}
