// #### Import
// remark-usage-ignore-next
import stubbedFs from 'mock-fs';
import yargs from 'yargs';
import {hideBin} from 'yargs/helpers';
import {promptConstants as javascriptPromptConstants} from '@form8ion/javascript';
import {dialects} from '@form8ion/javascript-core';
import {promptConstants, scaffold} from './lib/index.js';

// remark-usage-ignore-next
stubbedFs();

// #### Register with yargs
yargs(hideBin(process.argv))
  .scriptName('form8ion-utils')
  .usage('Usage: $0 <cmd> [args]')
  .command(
    'add-package',
    'Add a JavaScript package to an existing monorepo',
    () => scaffold(
      {overrides: {copyrightHolder: 'Foo Bar'}},
      {
        logger: {
          info: () => undefined,
          warn: () => undefined,
          error: () => undefined,
          success: () => undefined
        },
        prompt: ({id}) => {
          switch (id) {
            case promptConstants.ids.MONOREPO_DETAILS: {
              const {
                PROJECT_NAME,
                DESCRIPTION,
                VISIBILITY,
                LICENSE,
                COPYRIGHT_HOLDER,
                COPYRIGHT_YEAR,
                TARGET_PACKAGES_DIRECTORY
              } = promptConstants.questionNames.MONOREPO_DETAILS;

              return {
                [PROJECT_NAME]: 'foo',
                [DESCRIPTION]: 'a description of the project',
                [VISIBILITY]: 'OSS',
                [LICENSE]: 'MIT',
                [COPYRIGHT_HOLDER]: 'John Smith',
                [COPYRIGHT_YEAR]: '2022',
                [TARGET_PACKAGES_DIRECTORY]: 'packages'
              };
            }
            case javascriptPromptConstants.ids.BASE_DETAILS: {
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
              } = javascriptPromptConstants.questionNames.BASE_DETAILS;

              return {
                [AUTHOR_NAME]: 'John Smith',
                [AUTHOR_EMAIL]: 'john@smith.org',
                [AUTHOR_URL]: 'https://smith.org',
                [UNIT_TESTS]: true,
                [INTEGRATION_TESTS]: false,
                [CONFIGURE_LINTING]: true,
                [SHOULD_BE_SCOPED]: true,
                [SCOPE]: 'org-name',
                [DIALECT]: dialects.ESM,
                [PROVIDE_EXAMPLE]: false
              };
            }
            default:
              throw new Error(`Unknown prompt: ${id}`);
          }
        }
      }
    )
  )
  .help('h')
  .alias('h', 'help')
  .argv;
