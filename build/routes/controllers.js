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
                throw new Error(error);
            }
            finally {
                this.dbConn.end();
            }
        });
        this.getRawTx = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const signUtil = new signing_1.SigningUtil();
            //get 메소드의 params 또는 쿼리로 보낼 것
            //post 메소드도 고려
            console.log(yield signUtil.generateRawTransaction(process.env.OWNER, process.env.OWNER, 'SE', '2'));
            res.json(yield signUtil.generateRawTransaction(process.env.OWNER, process.env.OWNER, 'SE', '2'));
        });
        this.gasInfo = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const gasPriceInfo = yield data_1.gasInfofunc();
            res.json(gasPriceInfo);
        });
        this.feeTable = (req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            const gasPriceInfo = yield data_1.gasInfofunc();
            const proposeGas = parseInt(((_a = gasPriceInfo.result) === null || _a === void 0 ? void 0 : _a.FastGasPrice) + '000000000');
            let spendWei_SG = proposeGas * parseInt(data_1.gasLimit.SG, 10) * 100;
            let spendEth_SG = (parseFloat(this.web3.utils.fromWei(spendWei_SG.toString(), "ether")) / 100).toString();
            let spendWei_SE = proposeGas * parseInt(data_1.gasLimit.SE, 10) * 100;
            let spendEth_SE = (parseFloat(this.web3.utils.fromWei(spendWei_SE.toString(), "ether")) / 100).toString();
            const feeTable = {
                SG: (Math.round(parseFloat(spendEth_SG) * 10000) / 10000).toString(),
                SE: (Math.round(parseFloat(spendEth_SE) * 10000) / 10000).toString(), //이더전송 
            };
            console.log(feeTable);
            res.json(feeTable);
        });
        this.getEthBalance = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const userAccount = req.params.user_account;
            const ethBalanceWei = yield this.web3.eth.getBalance(userAccount);
            const ethBalanceEth = yield this.web3.utils.fromWei(ethBalanceWei, 'ether');
            console.log(ethBalanceEth);
            res.json(ethBalanceEth);
        });
        this.getInstance = () => __awaiter(this, void 0, void 0, function* () {
            return this;
        });
        this.controller = express_1.default.Router();
        // this.infura = `https://mainnet.infura.io/v3/${process.env.INFURA_KEY}` //메인넷
        // this.infura = `https://ropsten.infura.io/v3/${process.env.INFURA_KEY_ROPSTEN}` //테스트넷
        // this.web3 = new Web3(new Web3.providers.HttpProvider(this.infura));
        this.dbConn = dbconn_1.default();
        this.controller.get("/feeTable", this.feeTable);
        this.controller.get("/gasInfo", this.gasInfo);
        this.controller.get("/getEthBalance/:user_account", this.getEthBalance);
        this.controller.get("/dbtest", this.dbTest);
        this.controller.get("/getRawTx", this.getRawTx);
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
