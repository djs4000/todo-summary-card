import resolve from 'rollup-plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';

export default {
  input: 'src/my-todo-card.ts',
  output: {
    file: 'dist/my-todo-card.js',
    format: 'esm'
  },
  plugins: [
    resolve(),
    terser()
  ]
};
