import {promises as fs} from 'fs';
import {Then} from '@cucumber/cucumber';
import {assert} from 'chai';

Then('the package is added to the monorepo', async function () {
  assert.equal(
    JSON.parse(await fs.readFile(`${process.cwd()}/packages/${this.projectName}/package.json`)).name,
    this.projectName
  );
});
