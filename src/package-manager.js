import {fileExists} from '@form8ion/core';
import {packageManagers} from '@form8ion/javascript-core';

export default async function (monorepoRoot) {
  const [packageLockExists, yarnLockExists] = await Promise.all([
    fileExists(`${monorepoRoot}/package-lock.json`),
    fileExists(`${monorepoRoot}/yarn.lock`)
  ]);

  if (packageLockExists) return packageManagers.NPM;
  if (yarnLockExists) return packageManagers.YARN;

  throw new Error(
    'The package manager could not be determined for the project. No lockfile for `npm` or `yarn` was found.'
  );
}
