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

  // Intercept POST requests from payment gateways (like Cashfree) to frontend routes
  // and redirect them as GET requests to avoid 405 Method Not Allowed.
  app.post("*", (req, res, next) => {
    // Ignore API routes if they need POST
    if (!req.path.startsWith("/drupal-api")) {
      return res.redirect(302, req.originalUrl);
    }
    next();
  });
};
