import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import { terser } from 'rollup-plugin-terser';

export default {
  input: 'src/my-todo-card.ts',
  output: {
    file: 'dist/my-todo-card.js',
    format: 'es'
  },
  plugins: [
    resolve(),
    typescript(),
    terser()
  ]
};
