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
exports.routerInit = exports.Controllers = void 0;
const express_1 = __importDefault(require("express"));
// import Web3 from 'web3';
const data_1 = require("../lib/data");
const dbconn_1 = __importDefault(require("../lib/dbconn"));
const web3Conn_1 = require("../lib/web3Conn");
const signing_1 = require("../lib/signing");
class Controllers extends web3Conn_1.Web3Conn {
    constructor() {
        super();
        this.dbTest = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const allUser = yield this.dbConn.query('SELECT * FROM member LIMIT 0,10');
                console.log(allUser[0]);
                res.json(allUser[0]);
            }
            catch (error) {
                // throw new Error(error.message);
                console.log(error.message);
            }
            finally {
                this.dbConn.end();
            }
        });
        this.getRawTx = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const { sender, receiver, category, amount } = req.body;
            try {
                const result = yield this.signUtil.generateRawTransaction(sender, receiver, category, amount);
                res.json(result);
            }
            catch (error) {
                // throw new Error(error.message);
                console.log(error.message);
            }
        });
        this.getNextNonce = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const { sender } = req.body;
            try {
                const nonce = yield this.signUtil.getNonce(sender);
                console.log(nonce);
                res.json(nonce);
            }
            catch (error) {
                // throw new Error(error.message);
                console.log(error.message);
            }
        });
        this.gasInfo = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const gasPriceInfo = yield data_1.gasInfofunc();
                res.json(gasPriceInfo);
            }
            catch (error) {
                // throw new Error(error.message);
                console.log(error.message);
            }
        });
        this.getToken = (req, res) => {
            const VKFF = this.signUtil.getTokenInfo();
            console.log(VKFF);
            return;
        };
        this.feeTable = (req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const gasPriceInfo = yield data_1.gasInfofunc();
                const proposeGas = parseInt(((_a = gasPriceInfo.result) === null || _a === void 0 ? void 0 : _a.FastGasPrice) + '000000000');
                let spendWei_SG = proposeGas * parseInt(data_1.gasLimit.SV, 10) * 100;
                let spendEth_SG = (parseFloat(this.web3.utils.fromWei(spendWei_SG.toString(), "ether")) / 100).toString();
                let spendWei_SE = proposeGas * parseInt(data_1.gasLimit.SE, 10) * 100;
                let spendEth_SE = (parseFloat(this.web3.utils.fromWei(spendWei_SE.toString(), "ether")) / 100).toString();
                const feeTable = {
                    SG: (Math.round(parseFloat(spendEth_SG) * 10000) / 10000).toString(),
                    SE: (Math.round(parseFloat(spendEth_SE) * 10000) / 10000).toString(), //이더전송 
                };
                console.log(feeTable);
                res.json(feeTable);
            }
            catch (error) {
                // throw new Error(error.message);
                console.log(error.message);
            }
        });
        this.getEthBalance = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const userAccount = req.params.user_account;
            try {
                const ethBalanceWei = yield this.web3.eth.getBalance(userAccount);
                const ethBalanceEth = yield this.web3.utils.fromWei(ethBalanceWei, 'ether');
                console.log(ethBalanceEth);
                res.json(ethBalanceEth);
            }
            catch (error) {
                // throw new Error(error.message);
                console.log(error.message);
            }
        });
        this.getSignedTransaction = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const { sender, receiver, category, amount } = req.body;
            try {
                const rawTx = yield this.signUtil.generateRawTransaction(sender, receiver, category, amount);
                const signedTransaction = yield this.signUtil.signTransaction(rawTx, sender);
                res.json(signedTransaction);
            }
            catch (error) {
                // throw new Error(error.message);
                console.log(error.message);
            }
        });
        this.sendTransaction = (req, res) => __awaiter(this, void 0, void 0, function* () {
            // req.setTimeout(1000); //이렇게 함으로써 요청마다 개별적으로 타임아웃을 설정할 수 있다.
            const { sender, receiver, category } = req.body;
            const amount = req.body.amount + '000000000000000000';
            try {
                const rawTx = yield this.signUtil.generateRawTransaction(sender, receiver, category, amount);
                const signedTransaction = yield this.signUtil.signTransaction(rawTx, sender);
                const resultOfSendTransaction = yield this.signUtil.sendSignTransaction(signedTransaction.rawTransaction);
                console.log(resultOfSendTransaction);
                res.json(resultOfSendTransaction);
            }
            catch (error) {
                // throw new Error(error.message);
                if (error.message.indexOf('nonce too low') !== -1) {
                    console.error('Error - 낮은 nonce로 인한 에러');
                }
                else {
                    console.error(error.message);
                }
            }
        });
        this.getInstance = () => __awaiter(this, void 0, void 0, function* () {
            return this;
        });
        this.controller = express_1.default.Router();
        this.dbConn = dbconn_1.default();
        this.signUtil = new signing_1.SigningUtil();
        this.controller.get("/dbtest", this.dbTest);
        this.controller.get("/feeTable", this.feeTable);
        this.controller.get("/gasInfo", this.gasInfo);
        this.controller.get("/getEthBalance/:user_account", this.getEthBalance);
        this.controller.post("/getrawtx", this.getRawTx);
        this.controller.post("/getnonce", this.getNextNonce);
        this.controller.get("/gettokeninfo", this.getToken);
        this.controller.post("/signtransaction", this.getSignedTransaction);
        this.controller.post("/sendtransaction", this.sendTransaction);
        if (!Controllers.controllerInstance) {
            Controllers.controllerInstance = this;
        }
        return Controllers.controllerInstance;
    }
}
exports.Controllers = Controllers;
const routerInit = () => __awaiter(void 0, void 0, void 0, function* () {
    const router = new Controllers();
    return yield router.getInstance();
});
exports.routerInit = routerInit;
