import {promises as fs} from 'node:fs';
import hostedGitInfo from 'hosted-git-info';
import * as core from '@form8ion/core';

import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import any from '@travi/any';
import {when} from 'jest-when';

import * as packagesDirectoriesNormalizer from './packages-directories-normalizer';
import getConfig from './config-reader';

describe('config reader', () => {
  const monorepoRoot = any.string();
  const rawPackagesDirectories = any.listOf(any.word);
  const normalizedPackagesDirectories = any.listOf(any.word);

  beforeEach(() => {
    vi.mock('node:fs');
    vi.mock('hosted-git-info');
    vi.mock('@form8ion/core');
    vi.mock('./packages-directories-normalizer');
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should return the monorepo details from the `lerna.json` and `package.json`', async () => {
    const repoOwner = any.word();
    const repoName = any.word();
    const repoHost = any.word();
    const repository = any.string();
    when(core.fileExists).calledWith(`${monorepoRoot}/lerna.json`).mockResolvedValue(true);
    when(fs.readFile).calledWith(`${monorepoRoot}/package.json`).mockResolvedValue(JSON.stringify({repository}));
    when(fs.readFile)
      .calledWith(`${monorepoRoot}/lerna.json`)
      .mockResolvedValue(JSON.stringify({packages: rawPackagesDirectories}));
    when(hostedGitInfo.fromUrl)
      .calledWith(repository)
      .mockReturnValue({user: repoOwner, project: repoName, type: repoHost});
    when(packagesDirectoriesNormalizer.default)
      .calledWith(rawPackagesDirectories)
      .mockReturnValue(normalizedPackagesDirectories);

    expect(await getConfig(monorepoRoot)).toEqual({
      packagesDirectories: normalizedPackagesDirectories,
      vcs: {host: repoHost, owner: repoOwner, name: repoName}
    });
  });

  it('should not return vcs details if the project does not define a repository', async () => {
    when(core.fileExists).calledWith(`${monorepoRoot}/lerna.json`).mockResolvedValue(true);
    when(fs.readFile).calledWith(`${monorepoRoot}/package.json`).mockResolvedValue(JSON.stringify({}));
    when(fs.readFile)
      .calledWith(`${monorepoRoot}/lerna.json`)
      .mockResolvedValue(JSON.stringify({packages: rawPackagesDirectories}));
    when(packagesDirectoriesNormalizer.default)
      .calledWith(rawPackagesDirectories)
      .mockReturnValue(normalizedPackagesDirectories);

    expect(await getConfig(monorepoRoot)).toEqual({packagesDirectories: normalizedPackagesDirectories});
  });

  it('should throw an error for an unknown monorepo type', async () => {
    await expect(() => getConfig()).rejects.toThrowError(
      'Unable to determine monorepo type. Supported types include: Lerna. Are you scaffolding from the monorepo root?'
    );
  });
});
