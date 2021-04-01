import express, {Request, Response, NextFunction} from 'express';
import Web3 from 'web3';
import { gasInfofunc } from '../lib/data';
import { GasInfo, FeeTable } from '../lib/interfaces';

class Controllers {

    private static instance:Controllers;

    private controller:express.IRouter;
    private infura:string;
    private web3:Web3;
    
    
    constructor(){
        
        this.controller = express.Router();
        // this.infura = `https://mainnet.infura.io/v3/${process.env.INFURA_KEY}`
        this.infura = `https://ropsten.infura.io/v3/${process.env.INFURA_KEY_ROPSTEN}`
        this.web3 = new Web3(new Web3.providers.HttpProvider(this.infura));

        this.controller.get("/feeTable",this.feeTable);
        this.controller.get("/gasInfo",this.gasInfo);
        this.controller.get("/getEthBalance/:user_account",this.getEthBalance);
    
        if(!Controllers.instance){
            Controllers.instance = this;
        }

        return Controllers.instance;
    }

    gasInfo = async (req:Request, res:Response) => {
        
        const gasPriceInfo:GasInfo = await gasInfofunc();
        res.json(gasPriceInfo);

    }

    feeTable = async (req:Request, res:Response) => {
        
        const gasPriceInfo:GasInfo = await gasInfofunc();
        const proposeGas:number = parseInt(gasPriceInfo.result?.FastGasPrice+'000000000');
        
        let spendWei_SG:number = proposeGas * 80000 * 100;
        let spendEth_SG:string = (parseFloat(this.web3.utils.fromWei(spendWei_SG.toString(),"ether")) / 100).toString();

        let spendWei_SE:number = proposeGas * 21000 * 100;
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
