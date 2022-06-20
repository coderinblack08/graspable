module.exports = {
  extends: ["next", "prettier"],
  settings: {
    next: {
      rootDir: ["apps/*/", "packages/*/"],
    },
  },
  rules: {
    "@next/next/no-html-link-for-pages": "off",
    "react/display-name": "off",
    "react-hooks/rules-of-hooks": "off",
    "react/jsx-key": "off",
  },
};
