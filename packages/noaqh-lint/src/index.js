/**
 * @noaqh/lint - Oxlint plugin for noaqh projects
 */

import noTryCatchInServer from "./rules/no-try-catch-in-server.js";
import noPrismaInRoutes from "./rules/no-prisma-in-routes.js";

const plugin = {
  meta: {
    name: "@noaqh/lint",
    version: "1.0.0",
  },
  rules: {
    "no-try-catch-in-server": noTryCatchInServer,
    "no-prisma-in-routes": noPrismaInRoutes,
  },
};

export default plugin;
