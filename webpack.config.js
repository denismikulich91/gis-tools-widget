const devConf = require("@widget-lab/widget-templates-webpack-configs/webpack.config.dev");
const devS3Conf = require("@widget-lab/widget-templates-webpack-configs/webpack.config.dev-s3");
const prod = require("@widget-lab/widget-templates-webpack-configs/webpack.config.prod");
const webpack = require("webpack");

const { VueLoaderPlugin } = require("vue-loader");

const { merge } = require("webpack-merge");
const path = require("path");

const vueConf = {
    module: {
        rules: [{ test: /\.vue$/, loader: "vue-loader", options: {
            hotReload: true // disables Hot Reload
          } }]
    },
    plugins: [
        new VueLoaderPlugin(),
        new webpack.DefinePlugin({
            __VUE_PROD_DEVTOOLS__: "false"
        })
    ]
};

const othersConf = {
    module: {
        rules: [
            {
                test: /\.(svg|eot|woff|ttf|svg|woff2)$/,
                use: [
                    {
                        loader: "file-loader",
                        options: {
                            name: "[name].[ext]",
                            outputPath: "static/fonts"
                        }
                    }
                ]
            },
            {
                test: /\.(jpe?g|png|gif|svg)$/i,
                use: [
                    {
                        loader: "file-loader",
                        options: {
                            name: "/src/static/images/[name].[ext]",
                            outputPath: "static/images"
                        }
                    }
                ]
            },
            {
                test: /\.s(c|a)ss$/,
                use: [
                    "vue-style-loader",
                    "css-loader",
                    {
                        loader: "sass-loader",
                        options: {
                            implementation: require("sass"),
                            sassOptions: {
                                indentedSyntax: true // optional
                            }
                        }
                    }
                ]
            },
            {
                test: /\.tsx?$/,
                loader: "ts-loader",
                options: {
                    transpileOnly: true,
                    appendTsSuffixTo: [/\.vue$/]
                },
                exclude: /node_modules/
            }
        ]
    }
};

/**
 * use this object to override our settings
 */
const myConf = {
    resolve: {
        extensions: [".js", ".vue", ".json", ".ts", ".jpg"],
        alias: {
            "@": path.resolve("src")
        }
    }
};

module.exports = [
    { name: "dev", ...merge(devConf, vueConf, othersConf, myConf) },
    { name: "devS3", ...merge(devS3Conf, vueConf, othersConf, myConf) },
    { name: "prod", ...merge(prod, vueConf, othersConf, myConf) }
];
