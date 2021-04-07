"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Web3Conn = void 0;
const web3_1 = __importDefault(require("web3"));
class Web3Conn {
    constructor() {
        this.infura = `https://ropsten.infura.io/v3/${process.env.INFURA_KEY_ROPSTEN}`;
        this.web3 = new web3_1.default(new web3_1.default.providers.HttpProvider(this.infura));
        if (!Web3Conn.instance) {
            Web3Conn.instance = this;
        }
        return Web3Conn.instance;
    }
}
exports.Web3Conn = Web3Conn;
