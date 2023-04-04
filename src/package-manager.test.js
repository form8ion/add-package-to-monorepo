import * as core from '@form8ion/core';
import {packageManagers} from '@form8ion/javascript-core';

import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import any from '@travi/any';
import {when} from 'jest-when';

import determinePackageManager from './package-manager.js';

describe('package manager', () => {
  const monorepoRoot = any.string();

  beforeEach(() => {
    vi.mock('@form8ion/core');

    when(core.fileExists).calledWith(`${monorepoRoot}/package-lock.json`).mockResolvedValue(false);
    when(core.fileExists).calledWith(`${monorepoRoot}/yarn.lock`).mockResolvedValue(false);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should report `npm` as the manager when a `package-lock.json` exists in the parent project', async () => {
    when(core.fileExists).calledWith(`${monorepoRoot}/package-lock.json`).mockResolvedValue(true);

    expect(await determinePackageManager(monorepoRoot)).toEqual(packageManagers.NPM);
  });

  it('should report `yarn` as the manager when a `yarn.lock` exists in the parent project', async () => {
    when(core.fileExists).calledWith(`${monorepoRoot}/yarn.lock`).mockResolvedValue(true);

    expect(await determinePackageManager(monorepoRoot)).toEqual(packageManagers.YARN);
  });

  it('should throw an error if the package manager cannot be determined', async () => {
    await expect(() => determinePackageManager(monorepoRoot)).rejects.toThrowError(
      'The package manager could not be determined for the project. No lockfile for `npm` or `yarn` was found.'
    );
  });
});
