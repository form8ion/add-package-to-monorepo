import {resolve} from 'path';
import {After, Before, When} from '@cucumber/cucumber';
import importFresh from 'import-fresh';
import clearModule from 'clear-module';
import stubbedFs from 'mock-fs';
import nock from 'nock';
import td from 'testdouble';
import any from '@travi/any';

const pathToNodeModules = [__dirname, '..', '..', '..', '..', 'node_modules'];
const stubbedNodeModules = stubbedFs.load(resolve(...pathToNodeModules));
const debug = require('debug')('test');

Before(async function () {
  // work around for overly aggressive mock-fs, see:
  // https://github.com/tschaub/mock-fs/issues/213#issuecomment-347002795
  require('validate-npm-package-name'); // eslint-disable-line import/no-extraneous-dependencies

  this.execa = td.replace('execa');

  nock.disableNetConnect();
});

After(function () {
  nock.enableNetConnect();
  nock.cleanAll();
  stubbedFs.restore();
  td.reset();
  clearModule('@form8ion/add-package-to-monorepo');
  clearModule('@form8ion/lift-javascript');
  clearModule('@form8ion/javascript-core');
  clearModule('@form8ion/husky');
  clearModule('@form8ion/core');
  clearModule('execa');
});

When('the project is scaffolded', async function () {
  // eslint-disable-next-line import/no-extraneous-dependencies,import/no-unresolved
  const {questionNames, scaffold} = importFresh('@form8ion/add-package-to-monorepo');
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
    debug(e);
    this.error = e;
  }
});
