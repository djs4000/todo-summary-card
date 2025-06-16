import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import { terser } from 'rollup-plugin-terser';

export default {
  input: 'src/my-todo-card.ts',
  output: {
    dir: 'dist',
    format: 'es',
    sourcemap: true
  },
  plugins: [
    resolve(),
    typescript({
      tsconfig: './tsconfig.json'
    }),
    terser()
  ]
};
