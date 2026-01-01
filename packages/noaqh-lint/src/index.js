/**
 * @noaqh/lint - Oxlint plugin for noaqh projects
 */

import noTryCatchInServer from "./rules/no-try-catch-in-server.js";

const plugin = {
  meta: {
    name: "@noaqh/lint",
    version: "1.0.0",
  },
  rules: {
    "no-try-catch-in-server": noTryCatchInServer,
  },
};

export default plugin;
