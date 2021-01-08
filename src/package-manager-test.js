import * as core from '@form8ion/core';
import {packageManagers} from '@form8ion/javascript-core';
import any from '@travi/any';
import sinon from 'sinon';
import {assert} from 'chai';
import determinePackageManager from './package-manager';

suite('package manager', () => {
  let sandbox;
  const monorepoRoot = any.string();

  setup(() => {
    sandbox = sinon.createSandbox();

    sandbox.stub(core, 'fileExists');
  });

  teardown(() => sandbox.restore());

  test('that `npm` is reported as the manager when a `package-lock.json` exists in the parent project', async () => {
    core.fileExists.withArgs(`${monorepoRoot}/package-lock.json`).resolves(true);

    assert.equal(await determinePackageManager(monorepoRoot), packageManagers.NPM);
  });

  test('that `yarn` is reported as the manager when a `yarn.lock` exists in the parent project', async () => {
    core.fileExists.withArgs(`${monorepoRoot}/yarn.lock`).resolves(true);

    assert.equal(await determinePackageManager(monorepoRoot), packageManagers.YARN);
  });

  test('that an error is thrown if the package manager cannot be determined', async () => {
    try {
      await determinePackageManager(monorepoRoot);

      throw new Error('An error should have been thrown when the package manager couldnt be determined');
    } catch (e) {
      assert.equal(
        e.message,
        'The package manager could not be determined for the project. No lockfile for `npm` or `yarn` was found.'
      );
    }
  });
});
