"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.gasLimit = exports.gasInfofunc = void 0;
const request_promise_1 = __importDefault(require("request-promise"));
//가스 가격 정보
const gasInfofunc = () => __awaiter(void 0, void 0, void 0, function* () {
    const gasPriceInfo = yield request_promise_1.default(`https://api.etherscan.io/api?module=gastracker&action=gasoracle&apikey=${process.env.ETHER_SCAN_API_KEY}`);
    const gasPriceInfoJson = JSON.parse(gasPriceInfo);
    return gasPriceInfoJson;
});
exports.gasInfofunc = gasInfofunc;
const gasLimit = {
    SE: '21000',
    SG: '80000'
};
exports.gasLimit = gasLimit;
