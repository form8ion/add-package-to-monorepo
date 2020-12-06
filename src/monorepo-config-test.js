import {promises as fs} from 'fs';
import * as core from '@form8ion/core';
import {assert} from 'chai';
import sinon from 'sinon';
import any from '@travi/any';
import * as hostedGitInfo from '../thirdparty-wrappers/hosted-git-info';
import getConfig from './monorepo-config';

suite('monorepo config', () => {
  let sandbox;
  const monorepoRoot = any.string();

  setup(() => {
    sandbox = sinon.createSandbox();

    sandbox.stub(fs, 'readFile');
    sandbox.stub(hostedGitInfo, 'fromUrl');
    sandbox.stub(core, 'fileExists');
  });

  teardown(() => sandbox.restore());

  test('that the monorepo details are returned from the `lerna.json` and `package.json`', async () => {
    core.fileExists.withArgs(`${monorepoRoot}/lerna.json`).resolves(true);
    const repoOwner = any.word();
    const repoName = any.word();
    const repository = any.string();
    fs.readFile.withArgs(`${monorepoRoot}/package.json`).resolves(JSON.stringify({repository}));
    hostedGitInfo.fromUrl.withArgs(repository).returns({owner: repoOwner, name: repoName});

    assert.deepEqual(
      await getConfig(monorepoRoot),
      {packagesDirectory: 'packages', vcs: {host: 'GitHub', owner: repoOwner, name: repoName}}
    );
  });

  test('that no vcs details if the project does not define a repository', async () => {
    core.fileExists.withArgs(`${monorepoRoot}/lerna.json`).resolves(true);
    fs.readFile.withArgs(`${monorepoRoot}/package.json`).resolves(JSON.stringify({}));

    assert.deepEqual(await getConfig(monorepoRoot), {packagesDirectory: 'packages'});
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
