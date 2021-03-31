"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    basicConfig: () => {
        return {
            port: process.env.PORT || 12000,
            shutdownTimeout: 10000
        };
    }
};
