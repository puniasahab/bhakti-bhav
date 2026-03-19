const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
  app.use(
    "/drupal-api",
    createProxyMiddleware({
      target: "https://drupal.df3.club",
      changeOrigin: true,
      pathRewrite: (path) => path.replace(/^\/drupal-api/, ""),
      secure: false,
      headers: {
        Accept: "application/vnd.api+json",
      },
    })
  );
};
