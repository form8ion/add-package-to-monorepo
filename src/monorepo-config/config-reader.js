import {promises as fs} from 'fs';

import {info} from '@travi/cli-messages';
import {fileExists} from '@form8ion/core';

import {fromUrl} from '../../thirdparty-wrappers/hosted-git-info';
import normalizePackagesDirectories from './packages-directories-normalizer';

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
  const {packages: rawPackagesDirectories} = JSON.parse(lernaContent);
  const packagesDirectories = normalizePackagesDirectories(rawPackagesDirectories);

  if (repository) {
    const {user, project, type} = fromUrl(repository);

    return {packagesDirectories, vcs: {owner: user, name: project, host: type}};
  }

  return {packagesDirectories};
}
