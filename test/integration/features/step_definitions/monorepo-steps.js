import {fileExists} from '@form8ion/core';
import {Given, Then} from '@cucumber/cucumber';
import {assert} from 'chai';
import td from 'testdouble';

Given('the monorepo is lerna', async function () {
  this.monorepoType = 'lerna';
  td.when(this.execa('npm', ['ls', 'husky', '--json'])).thenResolve({stdout: JSON.stringify({})});
});

Then('feedback is provided that the monorepo is unsupported', async function () {
  assert.equal(
    this.error.message,
    'Unable to determine monorepo type. Supported types include: Lerna. Are you scaffolding from the monorepo root?'
  );
});

Then('project-level tools are not installed for the new package', async function () {
  assert.isFalse(await fileExists(`${process.cwd()}/packages/${this.projectName}/.nvmrc`));
  assert.isFalse(await fileExists(`${process.cwd()}/packages/${this.projectName}/.huskyrc.json`));
  assert.isFalse(await fileExists(`${process.cwd()}/packages/${this.projectName}/.czrc`));
  assert.isFalse(await fileExists(`${process.cwd()}/packages/${this.projectName}/.commitlintrc.js`));
  assert.isFalse(await fileExists(`${process.cwd()}/packages/${this.projectName}/.gitattributes`));
  assert.isFalse(await fileExists(`${process.cwd()}/packages/${this.projectName}/.gitignore`));
});
