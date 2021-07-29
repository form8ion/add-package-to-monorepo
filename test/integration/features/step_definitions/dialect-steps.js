import {Given} from '@cucumber/cucumber';
import any from '@travi/any';

Given('the dialect is {string}', async function (dialect) {
  const {dialects} = require('@form8ion/javascript-core');

  this.dialect = dialect;

  if (dialects.BABEL === dialect) {
    this.babelPreset = {name: any.word(), packageName: any.word()};
  }
});
