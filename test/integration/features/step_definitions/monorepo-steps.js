import {promises as fs} from 'fs';
import {fileExists} from '@form8ion/core';
import {Given, Then} from '@cucumber/cucumber';
import {assert} from 'chai';

Given('the monorepo is lerna', async function () {
  await fs.writeFile(`${process.cwd()}/lerna.json`, JSON.stringify({}));
});

Then('feedback is provided that the monorepo is unsupported', async function () {
  assert.equal(
    this.error.message,
    'Unable to determine monorepo type. Supported types include: Lerna. Are you scaffolding from the monorepo root?'
  );
});

Then('project-level tools are not installed for the new package', async function () {
  assert.isFalse(await fileExists(`${process.cwd()}/packages/${this.projectName}/.nvmrc`));
  assert.isFalse(await fileExists(`${process.cwd()}/packages/${this.projectName}/.gitattributes`));
  assert.isFalse(await fileExists(`${process.cwd()}/packages/${this.projectName}/.gitignore`));
});
