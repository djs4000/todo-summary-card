import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
//import { terser } from 'rollup-plugin-terser';

export default {
  input: "src/my-todo-card.ts", // or your actual entry point
  output: {
    file: "dist/my-todo-card.js",
    format: "es",
    sourcemap: true,
    inlineDynamicImports: true,
  },
  plugins: [
    resolve({
      browser: true,
      moduleDirectories: ["node_modules"],
      exportConditions: ["browser", "module"],
      extensions: [".js", ".ts"],
    }),
    commonjs(),
    json(),
    typescript({ tsconfig: "./tsconfig.json" }),
    //terser()
  ],
  external: [
    'custom-card-helpers',
    'custom-card-helpers/lib/components/ha-textfield.js',
    'custom-card-helpers/lib/components/ha-checkbox.js',
    'custom-card-helpers/lib/components/ha-formfield.js',
    'custom-card-helpers/lib/components/ha-entity-picker.js',
  ]
};
