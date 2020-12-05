import {assert} from 'chai';
import getConfig from './monorepo-config';

suite('monorepo config', () => {
  test('that the lerna config is parsed and valuable details are returned', async () => {
    assert.deepEqual(await getConfig(), {packagesDirectory: 'packages'});
  });
});
