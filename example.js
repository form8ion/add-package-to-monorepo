// #### Import
// remark-usage-ignore-next
import stubbedFs from 'mock-fs';
import yargs from 'yargs';
import {scaffold} from './lib/index.js';

// remark-usage-ignore-next
stubbedFs();

// #### Register with yargs
yargs
  .scriptName('form8ion-utils')
  .usage('Usage: $0 <cmd> [args]')
  .command('add-package', 'Add a JavaScript package to an existing monorepo', () => scaffold({
    decisions: {},
    overrides: {copyrightHolder: 'Foo Bar'}
  }))
  .help('h')
  .alias('h', 'help')
  .argv;
