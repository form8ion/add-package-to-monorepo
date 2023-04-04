import {describe, expect, it} from 'vitest';
import any from '@travi/any';

import normalizeDirectories from './packages-directories-normalizer.js';

describe('packages-directories normalizer', () => {
  it('should strip the `/*` from each directory', async () => {
    const normalizedDirectories = any.listOf(any.word);
    const directories = normalizedDirectories.map(directory => `${directory}/*`);

    expect(normalizeDirectories(directories)).toEqual(normalizedDirectories);
  });

  it('should not strip the `/` from the middle of a directory', async () => {
    const normalizedDirectories = any.listOf(() => `${any.word()}/${any.word()}`);
    const directories = normalizedDirectories.map(directory => `${directory}/*`);

    expect(normalizeDirectories(directories)).toEqual(normalizedDirectories);
  });

  it('should not strip a `/*` from the middle of a directory', async () => {
    const normalizedDirectories = any.listOf(() => `${any.word()}/*${any.word()}`);
    const directories = normalizedDirectories.map(directory => `${directory}/*`);

    expect(normalizeDirectories(directories)).toEqual(normalizedDirectories);
  });
});
