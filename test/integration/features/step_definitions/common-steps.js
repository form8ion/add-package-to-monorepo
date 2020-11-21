import {resolve} from 'path';
import {promises as fs} from 'fs';
import {After, Before, When} from '@cucumber/cucumber';
import stubbedFs from 'mock-fs';
import importFresh from 'import-fresh';
import nock from 'nock';
import td from 'testdouble';
import any from '@travi/any';

let jsQuestionNames;
const pathToNodeModules = [__dirname, '..', '..', '..', '..', 'node_modules'];
const stubbedNodeModules = stubbedFs.load(resolve(...pathToNodeModules));
const packagePreviewDirectory = '../__package_previews__/add-package-to-monorepo';
const debug = require('debug')('test');

Before(function () {
  // work around for overly aggressive mock-fs, see:
  // https://github.com/tschaub/mock-fs/issues/213#issuecomment-347002795
  require('validate-npm-package-name'); // eslint-disable-line import/no-extraneous-dependencies

  this.shell = td.replace('shelljs');
  this.execa = td.replace('execa');

  const jsScaffolder = importFresh('@travi/javascript-scaffolder');
  jsQuestionNames = jsScaffolder.questionNames;

  nock.disableNetConnect();
});

After(function () {
  nock.enableNetConnect();
  nock.cleanAll();
  stubbedFs.restore();
  td.reset();
});

When('the project is scaffolded', async function () {
  // eslint-disable-next-line import/no-extraneous-dependencies,import/no-unresolved
  const {questionNames, scaffold} = require('@form8ion/add-package-to-monorepo');
  this.projectName = any.word();
  this.packageName = any.word();

  stubbedFs({
    node_modules: stubbedNodeModules,
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
    },
    packages: {}
  });

  try {
    await scaffold({
      decisions: {
        [questionNames.PROJECT_NAME]: this.projectName,
        [jsQuestionNames.NODE_VERSION_CATEGORY]: 'LTS',
        [jsQuestionNames.AUTHOR_NAME]: any.word(),
        [jsQuestionNames.AUTHOR_EMAIL]: any.email(),
        [jsQuestionNames.AUTHOR_URL]: any.url(),
        [jsQuestionNames.UNIT_TESTS]: this.tested,
        [jsQuestionNames.INTEGRATION_TESTS]: this.tested,
        [jsQuestionNames.TRANSPILE_LINT]: this.transpiled
      },
      unitTestFrameworks: {}
    });
  } catch (e) {
    debug(e);
    throw e;
  }
});
