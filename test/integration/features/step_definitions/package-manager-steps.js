import {packageManagers} from '@form8ion/javascript-core';

import {Given, Then} from '@cucumber/cucumber';
import * as td from 'testdouble';

Given('the monorepo uses {string} as the package manager', async function (manager) {
  const {YARN, NPM} = packageManagers;
  this.packageManager = manager;

  td.when(
    this.execa(`${YARN === this.packageManager ? YARN : `${NPM} run`} generate:md && ${this.packageManager} test`),
    {ignoreExtraArgs: true}
  ).thenReturn({stdout: {pipe: () => undefined}});
});

Then('npm is used to manage the new package', async function () {
  td.verify(this.execa(td.matchers.contains('. ~/.nvm/nvm.sh && nvm use && npm install')), {ignoreExtraArgs: true});
});

Then('yarn is used to manage the new package', async function () {
  td.verify(this.execa(td.matchers.contains('. ~/.nvm/nvm.sh && nvm use && yarn add')), {ignoreExtraArgs: true});
});
