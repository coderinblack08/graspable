const withTM = require("next-transpile-modules")(["ui"]);

module.exports = withTM({
  reactStrictMode: true,
  ignoreBuildErrors: true,
  experimental: {
    esmExternals: false,
  },
});
