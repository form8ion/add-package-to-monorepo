import deepmerge from 'deepmerge';
import {scaffold, questionNames as jsQuestionNames} from '@travi/javascript-scaffolder';
import {projectTypes} from '@form8ion/javascript-core';
import {questionNames} from './question-names';

export default function (options) {
  const projectName = options.decisions[questionNames.PROJECT_NAME];

  return scaffold(deepmerge(
    options,
    {
      projectRoot: `${process.cwd()}/packages/${projectName}`,
      projectName,
      visibility: 'Public',
      license: 'MIT',
      decisions: {[jsQuestionNames.PROJECT_TYPE]: projectTypes.PACKAGE}
    }
  ));
}
