export default function (directories) {
  return directories.map(directory => directory.replace(/\/\*$/, ''));
}
