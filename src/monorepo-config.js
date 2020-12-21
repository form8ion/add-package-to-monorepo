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

  const {repository} = JSON.parse(await fs.readFile(`${monorepoRoot}/package.json`));

  if (repository) {
    const {user, project, type} = fromUrl(repository);

    return {packagesDirectory: 'packages', vcs: {owner: user, name: project, host: type}};
  }

  return {packagesDirectory: 'packages'};
}
