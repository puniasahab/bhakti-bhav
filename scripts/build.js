const Module = require("module");
const webpack = require("webpack");

process.env.BABEL_ENV = "production";
process.env.NODE_ENV = "production";

const webpackConfigPath = require.resolve("react-scripts/config/webpack.config");
const createWebpackConfig = require(webpackConfigPath);
const originalLoad = Module._load;

Module._load = function loadWithMergedChunks(request, parent, isMain) {
  const loaded = originalLoad.apply(this, arguments);
  const resolved = Module._resolveFilename(request, parent, isMain);

  if (resolved !== webpackConfigPath) {
    return loaded;
  }

  return (webpackEnv) => {
    const config = createWebpackConfig(webpackEnv);

    if (webpackEnv === "production") {
      config.optimization.runtimeChunk = false;
      config.plugins.push(
        new webpack.optimize.LimitChunkCountPlugin({
          maxChunks: 1,
        })
      );
    }

    return config;
  };
};

require("react-scripts/scripts/build");
