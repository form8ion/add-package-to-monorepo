import {info} from '@travi/cli-messages';
import {fileExists} from '@form8ion/core';

export default async function (monorepoRoot) {
  info('Inspecting existing monorepo');

  if (!await fileExists(`${monorepoRoot}/lerna.json`)) {
    throw new Error(
      'Unable to determine monorepo type. Supported types include: Lerna. Are you scaffolding from the monorepo root?'
    );
  }

  info('Found `lerna.json`', {level: 'secondary'});

  return {packagesDirectory: 'packages'};
}
