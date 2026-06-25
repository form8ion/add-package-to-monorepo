import {promises as fs} from 'fs';
import parseGitUrl from 'git-url-parse';

import {fileExists} from '@form8ion/core';

import normalizePackagesDirectories from './packages-directories-normalizer.js';

export default async function readConfig(monorepoRoot, {logger}) {
  logger.info('Inspecting existing monorepo');

  if (!await fileExists(`${monorepoRoot}/lerna.json`)) {
    throw new Error(
      'Unable to determine monorepo type. Supported types include: Lerna. Are you scaffolding from the monorepo root?'
    );
  }

  logger.info('Found `lerna.json`', {level: 'secondary'});

  const [packageContent, lernaContent] = await Promise.all([
    fs.readFile(`${monorepoRoot}/package.json`),
    fs.readFile(`${monorepoRoot}/lerna.json`)
  ]);
  const {repository} = JSON.parse(packageContent);
  const {packages: rawPackagesDirectories} = JSON.parse(lernaContent);
  const packagesDirectories = normalizePackagesDirectories(rawPackagesDirectories);

  if (repository) {
    const {owner, name, host} = parseGitUrl(repository);

    return {packagesDirectories, vcs: {owner, name, host}};
  }

  return {packagesDirectories};
}
