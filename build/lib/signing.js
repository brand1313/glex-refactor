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
const data_1 = require("./data");
// ABI가 import로 하면 'Types of property 'stateMutability' are incompatible.' 에러를 일으킨다.
// 그래서 require로 불러온다.
// tokenData.ts 안에서도 export가 아니라 module.exports로 내보낸다.
// import tokenObj from '../lib/tokenData';
const tokenObj = require('./tokenData');
/**
 * util 함수를 모아놓은 클래스이기 때문에 굳이 싱글톤을 할 필요없다.
 */
class SigningUtil extends web3Conn_1.Web3Conn {
    constructor() {
        super();
        this.getTokenInfo = () => {
            return this.VKFFtoken;
        };
        this.getNonce = (senderAddr) => __awaiter(this, void 0, void 0, function* () {
            const nonce = yield this.web3.eth.getTransactionCount(senderAddr);
            return nonce;
        });
        this.getPrivateKey = (addr) => __awaiter(this, void 0, void 0, function* () {
            return process.env.PRIVATE_KEY;
        });
        // //컨트랙트 메소드 ABI 구하는 메소드
        // getFunctionABI =  async (category:string):Promise<any> => {
        //     return 
        // }
        this.generateRawTransaction = (sender, receiver, category, amount) => __awaiter(this, void 0, void 0, function* () {
            // getNonce, getPrivateKey가 모두 Promise<string>를 반환하는 async함수인데 await없이 
            // await 없이 받으면 promise 객체가 되어 사용할 수 없다. 그래서 아래 코드는 잘못되었다. 
            // const nonce:Promise<string> = this.getNonce(sender);
            // const privateKey:Promise<string> = this.getPrivateKey(sender);
            var _a;
            //await을 붙임으로써 단지 string 타입으로만 받을 수 있다.
            const nonce = yield this.getNonce(sender);
            const rawTransaction = {
                nonce: nonce,
                to: receiver,
                chainId: parseInt(process.env.CHAIN_ID_ROPSTEN, 10),
                gas: data_1.gasLimit[category],
                gasPrice: ((_a = (yield data_1.gasInfofunc()).result) === null || _a === void 0 ? void 0 : _a.FastGasPrice) + '000000000',
            };
            if (category === 'SE') {
                let value = yield this.web3.utils.toWei(amount, "ether");
                rawTransaction.value = value;
            }
            else if (category === 'SV') {
                try {
                    console.log('vkff전송');
                    const transferFunc = yield this.VKFFtoken.methods.transfer(receiver, amount);
                    const funcABI = yield transferFunc.encodeABI();
                    rawTransaction.data = funcABI;
                    return rawTransaction;
                }
                catch (error) {
                    console.log(`에러 : ${error.message}`);
                    return error.message;
                }
            }
        });
        this.signTransaction = (rawTx, sender) => __awaiter(this, void 0, void 0, function* () {
            const senderPvKey = yield this.getPrivateKey(sender);
            const signed = yield this.web3.eth.accounts.signTransaction(rawTx, senderPvKey);
            return signed;
        });
        //encodedRawTx : signTransaction 함수에서 리턴된 RLPEncodedTransaction의 raw transaction
        this.sendSignTransaction = (encodedRawTx) => __awaiter(this, void 0, void 0, function* () {
            const sendSignedTransaction = yield this.web3.eth.sendSignedTransaction(encodedRawTx);
            return sendSignedTransaction;
        });
        this.VKFFtoken = new this.web3.eth.Contract(tokenObj.ABI, tokenObj.CONTRACT_ADDRESS, {
            from: process.env.OWNER
        });
    }
}
exports.SigningUtil = SigningUtil;
