import {Given} from '@cucumber/cucumber';
import any from '@travi/any';
import {dialects} from '@form8ion/javascript-core';

Given('the dialect is {string}', async function (dialect) {
  this.dialect = dialect;

  if (dialects.BABEL === dialect) {
    this.babelPreset = {name: any.word(), packageName: any.word()};
  }
});
