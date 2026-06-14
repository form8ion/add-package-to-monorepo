import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {visibilityOptions} from '@form8ion/core';

import {After, Before, Then, When} from '@cucumber/cucumber';
import stubbedFs from 'mock-fs';
import nock from 'nock';
import * as td from 'testdouble';
import any from '@travi/any';
import createDebugFor from 'debug';

let questionNames, scaffold;
const __dirname = dirname(fileURLToPath(import.meta.url));                  // eslint-disable-line no-underscore-dangle
const pathToNodeModules = [__dirname, '..', '..', '..', '..', 'node_modules'];
const stubbedNodeModules = stubbedFs.load(resolve(...pathToNodeModules));
const debug = createDebugFor('test:common-steps');
const logger = {
  success: debug,
  info: debug,
  warn: debug,
  error: debug
};

Before(async function () {
  ({execa: this.execa} = (await td.replaceEsm('execa')));

  // eslint-disable-next-line import/no-extraneous-dependencies,import/no-unresolved
  ({questionNames, scaffold} = await import('@form8ion/add-package-to-monorepo'));

  nock.disableNetConnect();
});

After(function () {
  nock.enableNetConnect();
  nock.cleanAll();
  stubbedFs.restore();
  td.reset();
});

When('the project is scaffolded', async function () {
  const visibility = any.fromList(Object.keys(visibilityOptions));
  const shouldBeScoped = any.boolean();
  const scope = shouldBeScoped || ['ISS', 'CS'].includes(visibility) ? any.word() : undefined;
  this.projectName = any.word();
  this.projectDescription = any.sentence();
  this.packageName = scope ? `@${scope}/${this.projectName}` : this.projectName;

  stubbedFs({
    node_modules: stubbedNodeModules,
    packages: {},
    ...'lerna' === this.monorepoType && {
      'lerna.json': JSON.stringify({...any.simpleObject(), packages: this.packagesDirectories})
    },
    'package.json': JSON.stringify({
      ...any.simpleObject(),
      ...'GitHub' === this.vcsHost && {repository: `${this.repoOwner}/${this.repoName}`}
    }),
    ...'npm' === this.packageManager && {'package-lock.json': JSON.stringify(any.simpleObject())},
    ...'yarn' === this.packageManager && {'yarn.lock': any.string()}
  });

  try {
    this.results = await scaffold({
      decisions: {
        [questionNames.PROJECT_NAME]: this.projectName,
        [questionNames.DESCRIPTION]: this.projectDescription,
        [questionNames.VISIBILITY]: visibility,
        [questionNames.PROVIDE_EXAMPLE]: true,
        ...'OSS' === visibility && {
          [questionNames.LICENSE]: 'MIT',
          [questionNames.COPYRIGHT_HOLDER]: any.word(),
          [questionNames.COPYRIGHT_YEAR]: 2000
        },
        ...['ISS', 'CS'].includes(visibility) && {[questionNames.UNLICENSED]: true},
        [questionNames.AUTHOR_NAME]: any.word(),
        [questionNames.AUTHOR_EMAIL]: any.email(),
        [questionNames.AUTHOR_URL]: any.url(),
        [questionNames.UNIT_TESTS]: this.tested,
        [questionNames.INTEGRATION_TESTS]: this.tested,
        [questionNames.CONFIGURE_LINTING]: this.configureLinting,
        [questionNames.SHOULD_BE_SCOPED]: shouldBeScoped,
        [questionNames.SCOPE]: scope,
        [questionNames.DIALECT]: this.dialect,
        ...this.targetDirectoryAnswer && {[questionNames.TARGET_PACKAGES_DIRECTORY]: this.targetDirectoryAnswer}
      },
      plugins: {unitTestFrameworks: {}},
      configs: {...this.babelPreset && {babelPreset: this.babelPreset}}
    }, {logger});
  } catch (e) {
    debug(e);
    this.error = e;
  }
});

Then('no error is thrown', async function () {
  if (this.error) {
    throw this.error;
  }
});
