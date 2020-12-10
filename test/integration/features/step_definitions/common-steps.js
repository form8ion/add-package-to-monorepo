import {resolve} from 'path';
import {promises as fs} from 'fs';
import {After, Before, When} from '@cucumber/cucumber';
import importFresh from 'import-fresh';
import stubbedFs from 'mock-fs';
import nock from 'nock';
import td from 'testdouble';
import any from '@travi/any';

const pathToNodeModules = [__dirname, '..', '..', '..', '..', 'node_modules'];
const stubbedNodeModules = stubbedFs.load(resolve(...pathToNodeModules));
const packagePreviewDirectory = '../__package_previews__/add-package-to-monorepo';
const debug = require('debug')('test');

Before(async function () {
  // work around for overly aggressive mock-fs, see:
  // https://github.com/tschaub/mock-fs/issues/213#issuecomment-347002795
  require('validate-npm-package-name'); // eslint-disable-line import/no-extraneous-dependencies

  this.shell = td.replace('shelljs');
  this.execa = td.replace('execa');

  stubbedFs({
    node_modules: stubbedNodeModules,
    packages: {},
    'package.json': JSON.stringify({}),
    [packagePreviewDirectory]: {
      '@form8ion': {
        'add-package-to-monorepo': {
          node_modules: {
            '.pnpm': {
              '@travi': {
                'javascript-scaffolder@11.13.0': {
                  node_modules: {
                    '@travi': {
                      'javascript-scaffolder': {
                        templates: {
                          'rollup.config.js': await fs.readFile(resolve(
                            ...pathToNodeModules,
                            '@travi/javascript-scaffolder/templates/rollup.config.js'
                          )),
                          'example.mustache': await fs.readFile(resolve(
                            ...pathToNodeModules,
                            '@travi/javascript-scaffolder/templates/example.mustache'
                          ))
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  });

  nock.disableNetConnect();
});

After(function () {
  nock.enableNetConnect();
  nock.cleanAll();
  stubbedFs.restore();
  td.reset();
});

When('the project is scaffolded', async function () {
  // busts whatever the caching issue is with shelljs at the step to determine the node version
  importFresh('@travi/javascript-scaffolder');
  // eslint-disable-next-line import/no-extraneous-dependencies,import/no-unresolved
  const {questionNames, scaffold} = require('@form8ion/add-package-to-monorepo');
  const visibility = any.fromList(['Public', 'Private']);
  const shouldBeScoped = any.boolean();
  const scope = shouldBeScoped || 'Private' === visibility ? any.word() : undefined;
  this.projectName = any.word();
  this.packageName = scope ? `@${scope}/${this.projectName}` : this.projectName;

  try {
    await scaffold({
      decisions: {
        [questionNames.PROJECT_NAME]: this.projectName,
        [questionNames.DESCRIPTION]: any.sentence(),
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
        [questionNames.TRANSPILE_LINT]: this.transpiled,
        [questionNames.SHOULD_BE_SCOPED]: shouldBeScoped,
        [questionNames.SCOPE]: scope
      },
      unitTestFrameworks: {}
    });
  } catch (e) {
    debug(e);
    this.error = e;
  }
});
