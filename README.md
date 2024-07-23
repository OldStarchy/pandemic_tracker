# Pandemic Legacy City Tracker

During a game of Pandemic Legacy, players are required to draw "City" cards from an "Infection" deck to determine the location of outbreaks and other events.

This app helps to keep track of what cards are on the the Infection deck, and how likely each card is to be drawn next.

You may access the app [https://oldstarchy.github.io/pandemic_tracker/](https://oldstarchy.github.io/pandemic_tracker/).

If you have any BUG REPORTS or FEATURE REQUESTS, you may create an issue. Click the "Report an issue" link from within the app itself to tag the issue with the current app version.

For general comments and discussions, you can use the [Discussions page](https://github.com/OldStarchy/pandemic_tracker/discussions).

## Contributing

### React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

#### Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type aware lint rules:

- Configure the top-level `parserOptions` property like this:

```js
export default {
  // other rules...
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: ['./tsconfig.json', './tsconfig.node.json'],
    tsconfigRootDir: __dirname,
  },
}
```

- Replace `plugin:@typescript-eslint/recommended` to `plugin:@typescript-eslint/recommended-type-checked` or `plugin:@typescript-eslint/strict-type-checked`
- Optionally add `plugin:@typescript-eslint/stylistic-type-checked`
- Install [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react) and add `plugin:react/recommended` & `plugin:react/jsx-runtime` to the `extends` list
