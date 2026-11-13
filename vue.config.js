module.exports = {
  chainWebpack(config) {
    config.plugins.delete("prefetch");
    config.module
      .rule("wasm-asset")
      .test(/\.wasm$/)
      .type("asset/resource");
  },
  transpileDependencies: ["vue-router"],
  pwa: {
    workboxOptions: { exclude: [/\.map$/, /camera\..*\.js$/, /\.wasm$/] },
    name: "Бесплатный принтер физфака",
    themeColor: "#558ab2",
    msTileColor: "#558ab2",
    appleMobileWebAppCapable: "yes",
    appleMobileWebAppStatusBarStyle: "#558ab2",
  },
};
