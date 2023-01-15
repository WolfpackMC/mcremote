"use strict";
exports.__esModule = true;
var client_1 = require("@prisma/client");
var client = globalThis.prisma || new client_1.PrismaClient();
if (process.env.NODE_ENV !== "production")
    globalThis.prisma = client;
exports["default"] = client;
