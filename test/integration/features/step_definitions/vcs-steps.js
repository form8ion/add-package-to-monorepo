import {promises as fs} from 'fs';
import {Given} from '@cucumber/cucumber';
import any from '@travi/any';

Given('the project is versioned on GitHub', async function () {
  this.repoName = any.word();
  this.repoOwner = any.word();
  const pathToPackageFile = `${process.cwd()}/package.json`;
  const pkgContents = await fs.readFile(pathToPackageFile);

  await fs.writeFile(
    pathToPackageFile,
    JSON.stringify({...pkgContents, repository: `${this.repoOwner}/${this.repoName}`})
  );
});
