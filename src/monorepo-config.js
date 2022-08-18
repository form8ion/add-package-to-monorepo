import {promises as fs} from 'fs';
import {info} from '@travi/cli-messages';
import {fileExists} from '@form8ion/core';
import {fromUrl} from '../thirdparty-wrappers/hosted-git-info';

export default async function (monorepoRoot) {
  info('Inspecting existing monorepo');

  if (!await fileExists(`${monorepoRoot}/lerna.json`)) {
    throw new Error(
      'Unable to determine monorepo type. Supported types include: Lerna. Are you scaffolding from the monorepo root?'
    );
  }

  info('Found `lerna.json`', {level: 'secondary'});

  const [packageContent, lernaContent] = await Promise.all([
    fs.readFile(`${monorepoRoot}/package.json`),
    fs.readFile(`${monorepoRoot}/lerna.json`)
  ]);
  const {repository} = JSON.parse(packageContent);
  const {packages: packagesDirectories} = JSON.parse(lernaContent);
  const packagesDirectory = packagesDirectories[0].replace(/\/\*/, '');

  if (repository) {
    const {user, project, type} = fromUrl(repository);

    return {packagesDirectory, vcs: {owner: user, name: project, host: type}};
  }

  return {packagesDirectory};
}
