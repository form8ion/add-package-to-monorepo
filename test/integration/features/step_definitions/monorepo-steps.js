import {fileExists} from '@form8ion/core';

import {Given, Then} from '@cucumber/cucumber';
import {assert} from 'chai';
import * as td from 'testdouble';
import any from '@travi/any';

Given('the monorepo is lerna', async function () {
  this.monorepoType = 'lerna';
  const error = new Error('Command failed with exit code 1: npm ls husky --json');
  error.exitCode = 1;
  error.stdout = JSON.stringify({});
  error.command = 'npm ls husky --json';

  td.when(this.execa('npm', ['ls', 'husky', '--json'])).thenReject(error);
});

Given('a single packages directory is defined', async function () {
  this.packagesDirectory = any.word();
  this.packagesDirectories = [`${this.packagesDirectory}/*`];
});

Given('multiple packages directories are defined', async function () {
  this.packagesDirectory = any.word();
  this.targetDirectoryAnswer = this.packagesDirectory;
  this.packagesDirectories = [...any.listOf(any.word), this.packagesDirectory, ...any.listOf(any.word)];
});

Then('feedback is provided that the monorepo is unsupported', async function () {
  assert.equal(
    this.error.message,
    'Unable to determine monorepo type. Supported types include: Lerna. Are you scaffolding from the monorepo root?'
  );
});

Then('project-level tools are not installed for the new package', async function () {
  assert.isFalse(await fileExists(`${this.packagesDirectory}/${this.projectName}/.nvmrc`));
  assert.isFalse(await fileExists(`${this.packagesDirectory}/${this.projectName}/.huskyrc.json`));
  assert.isFalse(await fileExists(`${this.packagesDirectory}/${this.projectName}/.czrc`));
  assert.isFalse(await fileExists(`${this.packagesDirectory}/${this.projectName}/.commitlintrc.js`));
  assert.isFalse(await fileExists(`${this.packagesDirectory}/${this.projectName}/.gitattributes`));
  assert.isFalse(await fileExists(`${this.packagesDirectory}/${this.projectName}/.gitignore`));
});
