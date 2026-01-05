/**
 * @noaqh/lint - Oxlint plugin for noaqh projects
 */

import noTryCatchInServer from "./rules/no-try-catch-in-server.js";
import noPrismaInFeatures from "./rules/no-prisma-in-features.js";

const plugin = {
  meta: {
    name: "@noaqh/lint",
    version: "1.0.0",
  },
  rules: {
    "no-try-catch-in-server": noTryCatchInServer,
    "no-prisma-in-features": noPrismaInFeatures,
  },
};

export default plugin;
