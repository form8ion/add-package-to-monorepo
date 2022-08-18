import any from '@travi/any';
import {assert} from 'chai';

import normalizeDirectories from './packages-directories-normalizer';

suite('packages-directories normalizer', () => {
  test('that the `/*` is stripped from each directory', async () => {
    const normalizedDirectories = any.listOf(any.word);
    const directories = normalizedDirectories.map(directory => `${directory}/*`);

    assert.deepEqual(normalizeDirectories(directories), normalizedDirectories);
  });
});
