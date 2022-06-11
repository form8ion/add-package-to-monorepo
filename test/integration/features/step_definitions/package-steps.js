import {promises as fs} from 'fs';
import {fileExists} from '@form8ion/core';
import {Given, Then} from '@cucumber/cucumber';
import {assert} from 'chai';
import td from 'testdouble';

Given('the package will not be tested or linted', async function () {
  this.tested = false;
  this.configureLinting = false;
});

Given('the package will be tested', async function () {
  this.tested = true;
  this.configureLinting = true;
});

Then('the package is added to the monorepo', async function () {
  const {packageManagers: {YARN, NPM}} = require('@form8ion/javascript-core');
  const {name, description} = JSON.parse(
    await fs.readFile(`${process.cwd()}/packages/${this.projectName}/package.json`, 'utf-8')
  );

  assert.equal(name, this.packageName);
  assert.equal(description, this.projectDescription);
  td.verify(this.execa(
    `${YARN === this.packageManager ? YARN : `${NPM} run`} generate:md && ${this.packageManager} test`,
    {shell: true, cwd: `packages/${this.projectName}`}
  ));
});

Then('the project is configured as a package', async function () {
  const packageContents = JSON.parse(await fs.readFile(
    `${process.cwd()}/packages/${this.projectName}/package.json`,
    'utf-8'
  ));

  assert.equal(packageContents.main, './lib/index.cjs.js');
  assert.equal(packageContents.module, './lib/index.es.js');
});

Then('the project is configured as a config package', async function () {
  assert.isTrue(await fileExists(`${process.cwd()}/packages/${this.projectName}/index.js`));
});

Then('the package will have no repository details defined', async function () {
  assert.isUndefined(
    JSON.parse(await fs.readFile(`${process.cwd()}/packages/${this.projectName}/package.json`, 'utf-8')).repository
  );
});

Then('the package will have repository details defined', async function () {
  assert.deepEqual(
    JSON.parse(await fs.readFile(`${process.cwd()}/packages/${this.projectName}/package.json`)).repository,
    {
      type: 'git',
      url: `https://github.com/${this.repoOwner}/${this.repoName}.git`,
      directory: `packages/${this.projectName}`
    }
  );
});
