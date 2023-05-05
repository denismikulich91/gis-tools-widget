<!-- markdownlint-disable MD001 MD024 -->

# Widget Template with Vue 3 & Quasar

## Installation

### Get the sources

You can download the [template zip](https://btcc.s3-eu-west-1.amazonaws.com/widget-lab/templates/vue3-quasar.zip) and unzip it wherever you prefer.

### Install the development dependencies

Open a terminal in the location you've put the downloaded / cloned sources:

If you never installed one of the Widget Lab component, add our npm repository to your configuration:

```bash
npm config set @widget-lab:registry https://itgit.dsone.3ds.com/api/v4/packages/npm/
npm config set "//itgit.dsone.3ds.com/api/v4/packages/npm/:_authToken" "61qKzSxnrLqyeyBy1H-o"
```

Then

```bash
npm install
```

For further documentation, installation, configuration, please refer to the [Widget Template Vue.js light documentation](https://itgit.dsone.3ds.com/widget-lab/widget-template-vue-light/blob/master/Configuration.md)

## Introduction

This widget is an extension of [Widget Template Vue.js light](https://itgit.dsone.3ds.com/widget-lab/widget-template-vue-light).

This template is meant to ease the development of 3DDashboard Widgets.

![Screen Capture](https://btcc.s3-eu-west-1.amazonaws.com/WidgetLab/ressources/WidgetTemplateDemoQuasarV1.gif)

With this template we focused on having the best possible development experience compatible with the 3DDashboard infrastructure. Hence we provide not only a code sample but a full development environment based on widgets & web development best practices:

- Continuous Integration (GitLab CI)
- Build with bundling (webpack)
- Linting (eslint) and formatting (Prettier)

Using this environment has many advantages :

- Ability do develop _outside_ of the 3DDashboard
- Hot & Live Reload: as soon as you modify a file, the change is applied in your web browser without a single action (even if your 3DEXPERIENCE Platform is on the cloud)
- Compliance with the latest front-end technologies (it's time to forget jQuery!)
- Ability to use the browser's debugger even in "modules"

Basically, you will be able to develop a widget like any other web application!

But that comes with a small price: some setup is required...

## Added features (from light version)

We added these development best practices and UI framework:

- Continuous Integration (GitLab CI)
- [Quasar](https://quasar.dev/introduction-to-quasar) - This UI Framework will drastically save your time. Nevertheless, it's optional so feel free to remove the dependency and use your favorite.

## All commandss

| Command           | Description                                                       |
| ----------------- | ----------------------------------------------------------------- |
| `npm run start`   | Build app continuously and serve @ `http://localhost:8081/widget` |
| `npm run startS3` | Build app continuously to `/dist/` and serve through AWS S3       |
| `npm run build`   | Build app to `/dist/`                                             |
| `npm run lint`    | Run ESLint                                                        |
| `npm run lintFix` | Run ESLint and fix issues                                         |
