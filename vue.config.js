const process = require("node:process");

module.exports = {
  devServer: {
    allowedHosts: [".coder.dyakov.space"],
    client: {
      webSocketURL: "auto://0.0.0.0:0/ws",
    },
  },
  chainWebpack(config) {
    // Both BUILD_MODE values must satisfy the existing nginx app.js redirect.
    if (process.argv.includes("build")) {
      config.output.filename("js/[name].[contenthash:8].js");
      config.output.chunkFilename("js/[name].[contenthash:8].js");
    }
    config.plugins.delete("prefetch");
    config.module
      .rule("wasm-asset")
      .test(/\.wasm$/)
      .type("asset/resource");
  },
  transpileDependencies: ["vue-router"],
  pwa: {
    manifestCrossorigin: "use-credentials",
    workboxOptions: { exclude: [/\.map$/, /camera\..*\.js$/, /\.wasm$/] },
    name: "Бесплатный принтер физфака",
    themeColor: "#558ab2",
    msTileColor: "#558ab2",
    appleMobileWebAppCapable: "yes",
    appleMobileWebAppStatusBarStyle: "#558ab2",
  },
};
