/* eslint import/no-extraneous-dependencies: ['error', {'devDependencies': true}] */
import autoExternal from 'rollup-plugin-auto-external';
import babel from '@rollup/plugin-babel';

export default {
  input: 'src/index.js',
  plugins: [
    autoExternal(),
    babel({
      babelrc: false,
      exclude: ['./node_modules/**'],
      presets: [['@form8ion', {targets: {node: '12.20'}, modules: false}]]
    })
  ],
  output: [
    {file: 'lib/index.cjs.js', format: 'cjs', sourcemap: true},
    {file: 'lib/index.es.js', format: 'es', sourcemap: true}
  ]
};
