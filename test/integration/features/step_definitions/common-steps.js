import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {visibilityOptions} from '@form8ion/core';

import {After, Before, Then, When} from '@cucumber/cucumber';
import stubbedFs from 'mock-fs';
import nock from 'nock';
import * as td from 'testdouble';
import any from '@travi/any';
import createDebugFor from 'debug';

let promptConstants, scaffold;
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
  ({promptConstants, scaffold} = await import('@form8ion/add-package-to-monorepo'));

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
  const {PACKAGE_DETAILS: packageDetailsQuestionNames} = promptConstants.questionNames;

  stubbedFs({
    node_modules: stubbedNodeModules,
    packages: {},
    ...'lerna' === this.monorepoType && {
      'lerna.json': JSON.stringify({...any.simpleObject(), packages: this.packagesDirectories})
    },
    'package.json': JSON.stringify({
      ...any.simpleObject(),
      ...'github.com' === this.vcsHost && {repository: `${this.repoOwner}/${this.repoName}`}
    }),
    ...'npm' === this.packageManager && {'package-lock.json': JSON.stringify(any.simpleObject())},
    ...'yarn' === this.packageManager && {'yarn.lock': any.string()}
  });

  try {
    this.results = await scaffold({
      plugins: {unitTestFrameworks: {}},
      configs: {...this.babelPreset && {babelPreset: this.babelPreset}}
    }, {
      logger,
      prompt: async promptDetails => {
        const {id} = promptDetails;

        switch (id) {
          case promptConstants.ids.PACKAGE_DETAILS:
            return {
              [packageDetailsQuestionNames.PROJECT_NAME]: this.projectName,
              [packageDetailsQuestionNames.DESCRIPTION]: this.projectDescription,
              [packageDetailsQuestionNames.VISIBILITY]: visibility,
              ...'OSS' === visibility && {
                [packageDetailsQuestionNames.LICENSE]: 'MIT',
                [packageDetailsQuestionNames.COPYRIGHT_HOLDER]: any.word(),
                [packageDetailsQuestionNames.COPYRIGHT_YEAR]: 2000
              },
              ...['ISS', 'CS'].includes(visibility) && {[packageDetailsQuestionNames.UNLICENSED]: true},
              ...this.targetDirectoryAnswer && {
                [packageDetailsQuestionNames.TARGET_PACKAGES_DIRECTORY]: this.targetDirectoryAnswer
              }
            };
          case promptConstants.ids.BASE_DETAILS: {
            const {
              AUTHOR_NAME,
              AUTHOR_EMAIL,
              AUTHOR_URL,
              UNIT_TESTS,
              INTEGRATION_TESTS,
              CONFIGURE_LINTING,
              SHOULD_BE_SCOPED,
              SCOPE,
              DIALECT,
              PROVIDE_EXAMPLE
            } = promptConstants.questionNames.BASE_DETAILS;

            return {
              [AUTHOR_NAME]: any.word(),
              [AUTHOR_EMAIL]: any.email(),
              [AUTHOR_URL]: any.url(),
              [UNIT_TESTS]: this.tested,
              [INTEGRATION_TESTS]: this.tested,
              [CONFIGURE_LINTING]: this.configureLinting,
              [SHOULD_BE_SCOPED]: shouldBeScoped,
              [SCOPE]: scope,
              [DIALECT]: this.dialect,
              [PROVIDE_EXAMPLE]: true
            };
          }
          default:
            throw new Error(`Unknown prompt: ${id}`);
        }
      }
    });
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
