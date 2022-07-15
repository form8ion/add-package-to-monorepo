import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

import {After, Before, When} from '@cucumber/cucumber';
import stubbedFs from 'mock-fs';
import nock from 'nock';
import * as td from 'testdouble';
import any from '@travi/any';
import debug from 'debug';

// work around for overly aggressive mock-fs, see:
// https://github.com/tschaub/mock-fs/issues/213#issuecomment-347002795
import validate_npm_package_name from 'validate-npm-package-name';

let questionNames, scaffold;
const __dirname = dirname(fileURLToPath(import.meta.url));
const pathToNodeModules = [__dirname, '..', '..', '..', '..', 'node_modules'];
const stubbedNodeModules = stubbedFs.load(resolve(...pathToNodeModules));
const debugTest = debug('test');

Before(async function () {
  // validate_npm_package_name(any.word());

  this.execa = await td.replaceEsm('@form8ion/execa-wrapper');

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
  const visibility = any.fromList(['Public', 'Private']);
  const shouldBeScoped = any.boolean();
  const scope = shouldBeScoped || 'Private' === visibility ? any.word() : undefined;
  this.projectName = any.word();
  this.projectDescription = any.sentence();
  this.packageName = scope ? `@${scope}/${this.projectName}` : this.projectName;

  stubbedFs({
    node_modules: stubbedNodeModules,
    packages: {},
    ...'lerna' === this.monorepoType && {'lerna.json': JSON.stringify(any.simpleObject())},
    'package.json': JSON.stringify({
      ...any.simpleObject(),
      ...'GitHub' === this.vcsHost && {repository: `${this.repoOwner}/${this.repoName}`}
    }),
    ...'npm' === this.packageManager && {'package-lock.json': JSON.stringify(any.simpleObject())},
    ...'yarn' === this.packageManager && {'yarn.lock': any.string()}
  });

  try {
    await scaffold({
      decisions: {
        [questionNames.PROJECT_NAME]: this.projectName,
        [questionNames.DESCRIPTION]: this.projectDescription,
        [questionNames.VISIBILITY]: visibility,
        ...'Public' === visibility && {
          [questionNames.LICENSE]: 'MIT',
          [questionNames.COPYRIGHT_HOLDER]: any.word(),
          [questionNames.COPYRIGHT_YEAR]: 2000
        },
        ...'Private' === visibility && {[questionNames.UNLICENSED]: true},
        [questionNames.AUTHOR_NAME]: any.word(),
        [questionNames.AUTHOR_EMAIL]: any.email(),
        [questionNames.AUTHOR_URL]: any.url(),
        [questionNames.UNIT_TESTS]: this.tested,
        [questionNames.INTEGRATION_TESTS]: this.tested,
        [questionNames.CONFIGURE_LINTING]: this.configureLinting,
        [questionNames.SHOULD_BE_SCOPED]: shouldBeScoped,
        [questionNames.SCOPE]: scope,
        [questionNames.DIALECT]: this.dialect
      },
      unitTestFrameworks: {},
      configs: {...this.babelPreset && {babelPreset: this.babelPreset}}
    });
  } catch (e) {
    debugTest(e);
    this.error = e;
  }
});