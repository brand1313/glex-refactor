import { GasLimit, RawTransaction } from "./interfaces";
import { Web3Conn } from "./web3Conn";
import { gasInfofunc, gasLimit } from './data';

export class SigningUtil extends Web3Conn {

    private static signingUtilInstance:SigningUtil; 
    
    constructor(){
        super();

        if(!SigningUtil.signingUtilInstance){
            SigningUtil.signingUtilInstance = this;
        }

        return SigningUtil.signingUtilInstance;
    }

    async getNonce(senderAddr:string):Promise<string>{
        
        const nonce = await this.web3.eth.getBlockTransactionCount(senderAddr);
        return nonce.toString();

    }

    async getPrivateKey(addr:string):Promise<string>{
        return 'test';
    }

    //컨트랙트 메소드 ABI 구하는 메소드
    async getFunctionABI(category:string):Promise<string>{
        return 'test'
    }

    async generateRawTransaction(sender:string, receiver:string, category: keyof GasLimit,value:string | undefined ):Promise<string>{

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
    }

    async signTransaction(){
        
    }

    async sendSignTransaction(){

    }

}

