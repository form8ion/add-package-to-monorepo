import {promises as fs} from 'fs';
import * as core from '@form8ion/core';

import {assert} from 'chai';
import sinon from 'sinon';
import any from '@travi/any';

import * as hostedGitInfo from '../../thirdparty-wrappers/hosted-git-info';
import * as packagesDirectoriesNormalizer from './packages-directories-normalizer';
import getConfig from './config-reader';

suite('config reader', () => {
  let sandbox;
  const monorepoRoot = any.string();
  const rawPackagesDirectories = any.listOf(any.word);
  const normalizedPackagesDirectories = any.listOf(any.word);

  setup(() => {
    sandbox = sinon.createSandbox();

    sandbox.stub(fs, 'readFile');
    sandbox.stub(hostedGitInfo, 'fromUrl');
    sandbox.stub(core, 'fileExists');
    sandbox.stub(packagesDirectoriesNormalizer, 'default');
  });

  teardown(() => sandbox.restore());

  test('that the monorepo details are returned from the `lerna.json` and `package.json`', async () => {
    core.fileExists.withArgs(`${monorepoRoot}/lerna.json`).resolves(true);
    const repoOwner = any.word();
    const repoName = any.word();
    const repoHost = any.word();
    const repository = any.string();
    fs.readFile.withArgs(`${monorepoRoot}/package.json`).resolves(JSON.stringify({repository}));
    fs.readFile.withArgs(`${monorepoRoot}/lerna.json`).resolves(JSON.stringify({packages: rawPackagesDirectories}));
    hostedGitInfo.fromUrl.withArgs(repository).returns({user: repoOwner, project: repoName, type: repoHost});
    packagesDirectoriesNormalizer.default.withArgs(rawPackagesDirectories).returns(normalizedPackagesDirectories);

    assert.deepEqual(
      await getConfig(monorepoRoot),
      {packagesDirectories: normalizedPackagesDirectories, vcs: {host: repoHost, owner: repoOwner, name: repoName}}
    );
  });

  test('that no vcs details if the project does not define a repository', async () => {
    core.fileExists.withArgs(`${monorepoRoot}/lerna.json`).resolves(true);
    fs.readFile.withArgs(`${monorepoRoot}/package.json`).resolves(JSON.stringify({}));
    fs.readFile.withArgs(`${monorepoRoot}/lerna.json`).resolves(JSON.stringify({packages: rawPackagesDirectories}));
    packagesDirectoriesNormalizer.default.withArgs(rawPackagesDirectories).returns(normalizedPackagesDirectories);

    assert.deepEqual(await getConfig(monorepoRoot), {packagesDirectories: normalizedPackagesDirectories});
  });

  test('that an error is thrown for an unknown monorepo type', async () => {
    core.fileExists.resolves(false);

    try {
      await getConfig();

      throw new Error('should have thrown an error');
    } catch (e) {
      assert.equal(
        e.message,
        'Unable to determine monorepo type. Supported types include: Lerna. Are you scaffolding from the monorepo root?'
      );
    }
  });
});