
import json from '@rollup/plugin-json';
import { terser } from 'rollup-plugin-terser';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import pkg from './package.json'

export default {
  input: 'src/sqrm.js',
  output: [{
    file: `build/sqrm-${pkg.version}.js`,
    name: 'sqrm',
    format: 'es',
    sourcemap: true
  }, {
    file: `build/sqrm-${pkg.version}.min.js`,
    name: 'sqrm',
    format: 'es',
    plugins: [terser()],
    sourcemap: true
  },{
    file: `build/sqrm-${pkg.version}.iife.js`,
    name: 'sqrm',
    format: 'iife',
    sourcemap: true
  }],
  plugins: [json(),nodeResolve(),commonjs()]
};