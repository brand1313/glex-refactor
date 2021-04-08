import express, {Request, Response, NextFunction} from 'express';
// import Web3 from 'web3';
import { gasInfofunc, gasLimit } from '../lib/data';
import { GasInfo, FeeTable } from '../lib/interfaces';
import mysqlConnect from '../lib/dbconn';
import { Web3Conn } from '../lib/web3Conn';
import {SigningUtil} from '../lib/signing';

class Controllers extends Web3Conn {

    private static controllerInstance:Controllers;

    private controller:express.IRouter;
    private dbConn;
    private signUtil:SigningUtil;

    constructor(){
        super();
        this.controller = express.Router();
        this.dbConn = mysqlConnect();
        this.signUtil = new SigningUtil();

        this.controller.get("/dbtest",this.dbTest);
        this.controller.get("/feeTable",this.feeTable);
        this.controller.get("/gasInfo",this.gasInfo);
        this.controller.get("/getEthBalance/:user_account",this.getEthBalance);
        this.controller.post("/getrawtx",this.getRawTx);
        this.controller.post("/getnonce",this.getNextNonce);
        this.controller.get("/gettokeninfo",this.getToken);

        this.controller.post("/signtransaction",this.getSignedTransaction);
        this.controller.post("/sendtransaction",this.sendTransaction);
        
    
        if(!Controllers.controllerInstance){
            Controllers.controllerInstance = this;
        }

        return Controllers.controllerInstance;
    }
    
    dbTest = async (req:Request, res:Response) => {
        
        try {
            const allUser = await this.dbConn.query('SELECT * FROM member LIMIT 0,10');
            console.log(allUser[0]);
            res.json(allUser[0]);
        } catch (error) {
            // throw new Error(error.message);
            console.log(error.message);
        } finally {
            this.dbConn.end();
        }
        
    }

    getRawTx = async (req:Request, res:Response) => {

        const {sender, receiver, category, amount} = req.body;
        
        try {
            const result = await this.signUtil.generateRawTransaction(sender, receiver, category, amount);
            res.json(result);
        } catch (error) {
            // throw new Error(error.message);
            console.log(error.message);
        }
    }

    getNextNonce = async (req:Request, res:Response) => {
        const { sender } = req.body;

        try {
            const nonce = await this.signUtil.getNonce(sender);
    
            console.log(nonce);
            res.json(nonce);
        } catch (error) {
            // throw new Error(error.message);
            console.log(error.message);
        }
    }

    gasInfo = async (req:Request, res:Response) => {
        
        try {
            const gasPriceInfo:GasInfo = await gasInfofunc();
            res.json(gasPriceInfo);
        } catch (error) {
            // throw new Error(error.message);
            console.log(error.message);   
        }

    }

    getToken = (req:Request, res:Response) => {
        const VKFF = this.signUtil.getTokenInfo();
        console.log(VKFF);
        return;
    }

    feeTable = async (req:Request, res:Response) => {
        
        try {
            const gasPriceInfo:GasInfo = await gasInfofunc();
            const proposeGas:number = parseInt(gasPriceInfo.result?.FastGasPrice+'000000000');
            
            let spendWei_SG:number = proposeGas * parseInt(gasLimit.SV,10) * 100;
            let spendEth_SG:string = (parseFloat(this.web3.utils.fromWei(spendWei_SG.toString(),"ether")) / 100).toString();
    
            let spendWei_SE:number = proposeGas * parseInt(gasLimit.SE,10) * 100;
            let spendEth_SE:string = (parseFloat(this.web3.utils.fromWei(spendWei_SE.toString(),"ether")) / 100).toString();
    
            const feeTable:FeeTable = {
                SG : (Math.round(parseFloat(spendEth_SG)*10000)/10000).toString(), //토큰전송 
                SE : (Math.round(parseFloat(spendEth_SE)*10000)/10000).toString(), //이더전송 
            }
    
            console.log(feeTable);
            res.json(feeTable);
            
        } catch (error) {
            // throw new Error(error.message);
            console.log(error.message);  
        }
    }
    
    getEthBalance = async (req:Request, res:Response) => {

        const userAccount:string = req.params.user_account;
        
        try {
            const ethBalanceWei:string = await this.web3.eth.getBalance(userAccount);
    
            const ethBalanceEth:string = await this.web3.utils.fromWei(ethBalanceWei, 'ether');
    
            console.log(ethBalanceEth);
            res.json(ethBalanceEth);
            
        } catch (error) {
            // throw new Error(error.message);
            console.log(error.message);
        }
    }

    getSignedTransaction = async (req:Request, res:Response) => {
        const { sender, receiver, category, amount } = req.body;
        
        try {
            const rawTx  = await this.signUtil.generateRawTransaction(sender, receiver, category, amount);
            
            const signedTransaction = await this.signUtil.signTransaction(rawTx!, sender);
    
            res.json(signedTransaction);
        } catch (error) {
            // throw new Error(error.message);
            console.log(error.message);
        }
    }

    sendTransaction = async (req:Request, res:Response) => {

        // req.setTimeout(1000); //이렇게 함으로써 요청마다 개별적으로 타임아웃을 설정할 수 있다.
        
        const { sender, receiver, category } = req.body;
        const amount = req.body.amount + '000000000000000000';
        
        try {
            const rawTx  = await this.signUtil.generateRawTransaction(sender, receiver, category, amount);
            const signedTransaction = await this.signUtil.signTransaction(rawTx!, sender);
    
            const resultOfSendTransaction = await this.signUtil.sendSignTransaction(signedTransaction.rawTransaction);
            
            console.log(resultOfSendTransaction);
            res.json(resultOfSendTransaction);
        } catch (error) {
            // throw new Error(error.message);

            if(error.message.indexOf('nonce too low') !== -1){
                console.error('Error - 낮은 nonce로 인한 에러');
            }else{
                console.error(error.message);
            }
        }

    }

    getInstance = async():Promise<Controllers> => {
        return this;
    }
}

const routerInit = async():Promise<Controllers> => {
    
    const router = new Controllers();
    return await router.getInstance();

}

export {Controllers, routerInit}
