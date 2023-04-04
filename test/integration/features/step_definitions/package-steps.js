import {promises as fs} from 'node:fs';

import {fileExists} from '@form8ion/core';

import {Given, Then} from '@cucumber/cucumber';
import {assert} from 'chai';

Given('the package will not be tested or linted', async function () {
  this.tested = false;
  this.configureLinting = false;
});

Given('the package will be tested', async function () {
  this.tested = true;
  this.configureLinting = true;
});

Then('the package is added to the monorepo', async function () {
  const {name, description} = JSON.parse(
    await fs.readFile(`${this.packagesDirectory}/${this.projectName}/package.json`, 'utf-8')
  );

  assert.equal(name, this.packageName);
  assert.equal(description, this.projectDescription);
});

Then('the project is configured as a package', async function () {
  const packageContents = JSON.parse(await fs.readFile(
    `${this.packagesDirectory}/${this.projectName}/package.json`,
    'utf-8'
  ));

  assert.equal(packageContents.main, './lib/index.js');
  assert.equal(packageContents.module, './lib/index.mjs');
});

Then('the project is configured as a config package', async function () {
  assert.isTrue(await fileExists(`${this.packagesDirectory}/${this.projectName}/index.js`));
});

Then('the package will have no repository details defined', async function () {
  assert.isUndefined(
    JSON.parse(await fs.readFile(`${this.packagesDirectory}/${this.projectName}/package.json`, 'utf-8')).repository
  );
});

Then('the package will have repository details defined', async function () {
  assert.deepEqual(
    JSON.parse(await fs.readFile(`${this.packagesDirectory}/${this.projectName}/package.json`)).repository,
    {
      type: 'git',
      url: `https://github.com/${this.repoOwner}/${this.repoName}.git`,
      directory: `${this.packagesDirectory}/${this.projectName}`
    }
  );
});
