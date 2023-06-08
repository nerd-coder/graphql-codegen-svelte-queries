import { defineConfig } from 'rollup'
import typescript from '@rollup/plugin-typescript'
import filesize from 'rollup-plugin-filesize'
import nodeResolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'

import pkg from './package.json' assert { type: 'json' }

const sourcemap = true

export default defineConfig({
  input: './src/index.ts',
  output: [
    { file: pkg.module, format: 'es', sourcemap },
    { file: pkg.main, format: 'cjs', sourcemap },
  ],
  external: ['graphql'],
  plugins: [typescript({ exclude: ['tests/**'] }), filesize(), nodeResolve(), commonjs()],
})
