<!-- markdownlint-disable MD001 MD024 -->
# GIS Tools widget

### GEOVIA city custom widget, containing 3 tools inside it's accardion structure.

## Tool 1. Isochrone generator
#### Generates isochrone polygon for given duration and type of transport. Supports generating several polygons at the same time.

https://github.com/denismikulich91/gis-tools-widget/assets/105070976/43efe9dc-6d7f-4283-8dd2-6470e535f95c



## Tool 2. Route service
#### Generates best route between two different points representing start and finish of the path by choosen transport.

https://github.com/denismikulich91/gis-tools-widget/assets/105070976/2c7b6df4-9e67-4335-a37d-b4592c0b1fd6



## Tool 3. Weather service
#### Gives the current weather and  full address of the clicked area. Depending on the widget frame size can have full or short UI.

https://github.com/denismikulich91/gis-tools-widget/assets/105070976/ff1c6cc5-6e0f-4c49-88b2-cbba6aab4ca2



### In order to use tool get an API key on the https://openrouteservice.org/ website and paste it into API Service key field in the widget preferences.


## Commands for developers

| Command           | Description                                                       |
| ----------------- | ----------------------------------------------------------------- |
| `npm run start`   | Build app continuously and serve @ `http://localhost:8081/widget` |
| `npm run startS3` | Build app continuously to `/dist/` and serve through AWS S3       |
| `npm run build`   | Build app to `/dist/`                                             |
| `npm run lint`    | Run ESLint                                                        |
| `npm run lintFix` | Run ESLint and fix issues                                         |
