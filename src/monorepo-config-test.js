import {promises as fs} from 'fs';
import * as core from '@form8ion/core';
import {assert} from 'chai';
import sinon from 'sinon';
import any from '@travi/any';
import getConfig from './monorepo-config';

suite('monorepo config', () => {
  let sandbox;

  setup(() => {
    sandbox = sinon.createSandbox();

    sandbox.stub(fs, 'readFile');
    sandbox.stub(core, 'fileExists');
  });

  teardown(() => sandbox.restore());

  test('that the lerna config is parsed and valuable details are returned', async () => {
    const monorepoRoot = any.string();
    core.fileExists.withArgs(`${monorepoRoot}/lerna.json`).resolves(true);

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
