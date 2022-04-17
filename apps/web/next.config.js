const withTM = require("next-transpile-modules")(["ui"]);

module.exports = withTM({
  reactStrictMode: true,
  experimental: {
    esmExternals: false,
  },
});
