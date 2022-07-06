import {Given, Then} from '@cucumber/cucumber';
import * as td from 'testdouble';

Given('the monorepo uses {string} as the package manager', async function (manager) {
  this.packageManager = manager;
});

Then('npm is used to manage the new package', async function () {
  td.verify(
    this.execa.default(td.matchers.contains('. ~/.nvm/nvm.sh && nvm use && npm install')),
    {ignoreExtraArgs: true}
  );
});

Then('yarn is used to manage the new package', async function () {
  td.verify(
    this.execa.default(td.matchers.contains('. ~/.nvm/nvm.sh && nvm use && yarn add')),
    {ignoreExtraArgs: true}
  );
});
