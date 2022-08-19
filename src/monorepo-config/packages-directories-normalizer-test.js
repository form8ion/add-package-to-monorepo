import any from '@travi/any';
import {assert} from 'chai';

import normalizeDirectories from './packages-directories-normalizer';

suite('packages-directories normalizer', () => {
  test('that the `/*` is stripped from each directory', async () => {
    const normalizedDirectories = any.listOf(any.word);
    const directories = normalizedDirectories.map(directory => `${directory}/*`);

    assert.deepEqual(normalizeDirectories(directories), normalizedDirectories);
  });

  test('that the `/` is not stripped from the middle of a directory', async () => {
    const normalizedDirectories = any.listOf(() => `${any.word()}/${any.word()}`);
    const directories = normalizedDirectories.map(directory => `${directory}/*`);

    assert.deepEqual(normalizeDirectories(directories), normalizedDirectories);
  });

  test('that a `/*` is not stripped from the middle of a directory', async () => {
    const normalizedDirectories = any.listOf(() => `${any.word()}/*${any.word()}`);
    const directories = normalizedDirectories.map(directory => `${directory}/*`);

    assert.deepEqual(normalizeDirectories(directories), normalizedDirectories);
  });
});
