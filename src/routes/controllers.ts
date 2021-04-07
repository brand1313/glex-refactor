import express, {Request, Response, NextFunction} from 'express';
// import Web3 from 'web3';
import { gasInfofunc, gasLimit } from '../lib/data';
import { GasInfo, FeeTable } from '../lib/interfaces';
import mysqlConnect from '../lib/dbconn';
import { Connection } from 'mysql2';
import { Web3Conn } from '../lib/web3Conn';
import { SigningUtil } from '../lib/signing';

class Controllers extends Web3Conn {

    private static controllerInstance:Controllers;

    private controller:express.IRouter;
    // private infura:string;
    // private web3:Web3;
    private dbConn;
    
    constructor(){
        super();
        this.controller = express.Router();
        // this.infura = `https://mainnet.infura.io/v3/${process.env.INFURA_KEY}` //메인넷
        // this.infura = `https://ropsten.infura.io/v3/${process.env.INFURA_KEY_ROPSTEN}` //테스트넷
        // this.web3 = new Web3(new Web3.providers.HttpProvider(this.infura));
        this.dbConn = mysqlConnect();

        this.controller.get("/feeTable",this.feeTable);
        this.controller.get("/gasInfo",this.gasInfo);
        this.controller.get("/getEthBalance/:user_account",this.getEthBalance);
        this.controller.get("/dbtest",this.dbTest);
        this.controller.get("/getRawTx", this.getRawTx);
    
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
            throw new Error(error);
        } finally {
            this.dbConn.end();
        }
        
    }

    getRawTx = async (req:Request, res:Response) => {
        // const signUtil = new SigningUtil();
        
        // //get 메소드의 params 또는 쿼리로 보낼 것
        // //post 메소드도 고려
        // console.log(await signUtil.generateRawTransaction(process.env.OWNER!, process.env.OWNER!, 'SE', '2'));
        // res.json(await signUtil.generateRawTransaction(process.env.OWNER!, process.env.OWNER!, 'SE', '2'));   
    }

    gasInfo = async (req:Request, res:Response) => {
        
        const gasPriceInfo:GasInfo = await gasInfofunc();
        res.json(gasPriceInfo);

    }

    feeTable = async (req:Request, res:Response) => {
        
        const gasPriceInfo:GasInfo = await gasInfofunc();
        const proposeGas:number = parseInt(gasPriceInfo.result?.FastGasPrice+'000000000');
        
        let spendWei_SG:number = proposeGas * parseInt(gasLimit.SG,10) * 100;
        let spendEth_SG:string = (parseFloat(this.web3.utils.fromWei(spendWei_SG.toString(),"ether")) / 100).toString();

        let spendWei_SE:number = proposeGas * parseInt(gasLimit.SE,10) * 100;
        let spendEth_SE:string = (parseFloat(this.web3.utils.fromWei(spendWei_SE.toString(),"ether")) / 100).toString();

        const feeTable:FeeTable = {
            SG : (Math.round(parseFloat(spendEth_SG)*10000)/10000).toString(), //토큰전송 
            SE : (Math.round(parseFloat(spendEth_SE)*10000)/10000).toString(), //이더전송 
        }

        console.log(feeTable);
        res.json(feeTable);
    }
    
    getEthBalance = async (req:Request, res:Response) => {

        const userAccount:string = req.params.user_account;
        const ethBalanceWei:string = await this.web3.eth.getBalance(userAccount);

        const ethBalanceEth:string = await this.web3.utils.fromWei(ethBalanceWei, 'ether');

        console.log(ethBalanceEth);
        res.json(ethBalanceEth);
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
