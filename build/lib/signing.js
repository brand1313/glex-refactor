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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SigningUtil = void 0;
const web3Conn_1 = require("./web3Conn");
class SigningUtil extends web3Conn_1.Web3Conn {
    constructor() {
        super();
        if (!SigningUtil.signingUtilInstance) {
            SigningUtil.signingUtilInstance = this;
        }
        return SigningUtil.signingUtilInstance;
    }
    getNonce(senderAddr) {
        return __awaiter(this, void 0, void 0, function* () {
            const nonce = yield this.web3.eth.getBlockTransactionCount(senderAddr);
            return nonce.toString();
        });
    }
    getPrivateKey(addr) {
        return __awaiter(this, void 0, void 0, function* () {
            return 'test';
        });
    }
    //컨트랙트 메소드 ABI 구하는 메소드
    getFunctionABI(category) {
        return __awaiter(this, void 0, void 0, function* () {
            return 'test';
        });
    }
    generateRawTransaction(sender, receiver, category, value) {
        return __awaiter(this, void 0, void 0, function* () {
            // const nonce:Promise<string> = this.getNonce(sender);
            // const privateKey:Promise<string> = this.getPrivateKey(sender);
            // const rawTransaction:RawTransaction = {
            //     nonce : nonce,
            //     to: receiver,
            //     chainId: process.env.CHAIN_ID_ROPSTEN!,
            //     gas: gasLimit[category],
            //     gasPrice: (await gasInfofunc()).result?.FastGasPrice! + '000000000', 
            // }
            // if(category === 'SE'){
            //     rawTransaction.value = value;
            // }
            // else if(category === 'SG'){
            //     rawTransaction.data = 'test';
            // }
            // return rawTransaction;
            return 'test';
        });
    }
    signTransaction() {
        return __awaiter(this, void 0, void 0, function* () {
        });
    }
    sendSignTransaction() {
        return __awaiter(this, void 0, void 0, function* () {
        });
    }
}
exports.SigningUtil = SigningUtil;
