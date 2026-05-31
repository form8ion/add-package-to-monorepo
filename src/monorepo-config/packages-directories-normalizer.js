export default function normalizePackagesDirectories(directories) {
  return directories.map(directory => directory.replace(/\/\*$/, ''));
}
