import js from '@eslint/js'
import globals from 'globals'
import pluginReact from 'eslint-plugin-react'
import pluginReactHooks from 'eslint-plugin-react-hooks'

const JS_FILES = ['**/*.{js,jsx,mjs,cjs}']

export default [
  {
    files: JS_FILES,
    ...js.configs.recommended,
  },
  {
    files: JS_FILES,
    languageOptions: {
      globals: globals.browser,
    },
  },
  {
    files: JS_FILES,
    ...pluginReact.configs.flat.recommended,
    rules: {
      ...pluginReact.configs.flat.recommended.rules,
      // The codebase is untyped JSX without propTypes; keep the rule off
      // until it is migrated to TS or propTypes.
      'react/prop-types': 'off',
    },
  },
  {
    files: JS_FILES,
    plugins: {
      'react-hooks': pluginReactHooks,
    },
    rules: {
      'react/react-in-jsx-scope': 'off',
      ...pluginReactHooks.configs.recommended.rules,
      // react-hooks v7 immutability analysis does not model that effect
      // callbacks run after the component body, so it flags const helpers
      // declared after useEffect as TDZ violations (false positives here).
      'react-hooks/immutability': 'off',
    },
    settings: {
      react: {
        version: '19.0',
      },
    },
  },
  {
    files: JS_FILES,
    rules: {
      // The style documented in AGENTS.md, kept honest here. These were prose
      // only for a long time, and nine files drifted to tabs, double quotes and
      // semicolons because nothing was checking. `avoidEscape` keeps a string
      // that has to contain a single quote readable instead of switching it to
      // double quotes, which would just move the problem.
      indent: ['error', 2],
      quotes: ['error', 'single', { avoidEscape: true }],
      semi: ['error', 'never'],
    },
  },
  {
    ignores: ['dist/', 'node_modules/'],
  },
]
