import {promises as fs} from 'fs';
import {fileExists} from '@form8ion/core';
import {Given, Then} from '@cucumber/cucumber';
import {assert} from 'chai';

Given('the package will not be tested or transpiled', async function () {
  this.tested = false;
  this.transpiled = false;
});

Given('the package will be tested', async function () {
  this.tested = true;
  this.transpiled = true;
});

Then('the package is added to the monorepo', async function () {
  assert.equal(
    JSON.parse(await fs.readFile(`${process.cwd()}/packages/${this.projectName}/package.json`)).name,
    this.projectName
  );
});

Then('the project is configured as a package', async function () {
  const packageContents = JSON.parse(await fs.readFile(`${process.cwd()}/packages/${this.projectName}/package.json`));

  assert.equal(packageContents.main, 'lib/index.cjs.js');
  assert.equal(packageContents.module, 'lib/index.es.js');
});

Then('the project is configured as a config package', async function () {
  assert.isTrue(await fileExists(`${process.cwd()}/packages/${this.projectName}/index.js`));
});
