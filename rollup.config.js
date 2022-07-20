
import json from '@rollup/plugin-json';
import { terser } from 'rollup-plugin-terser';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

export default {
  input: 'src/main.js',
  output: [{
    file: 'build/main.js',
    name: 'sqrm',
    format: 'iife',
    sourcemap: true
  }, {
    file: 'build/main.min.js',
    format: 'iife',
    name: 'sqrm',
    plugins: [terser()],
    sourcemap: true
  }],
  plugins: [json(),nodeResolve(),commonjs()]
};