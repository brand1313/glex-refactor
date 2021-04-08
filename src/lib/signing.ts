import { GasLimit, RawTransaction } from "./interfaces";
import { Web3Conn } from "./web3Conn";
import { gasInfofunc, gasLimit } from './data';
// ABI가 import로 하면 'Types of property 'stateMutability' are incompatible.' 에러를 일으킨다.
// 그래서 require로 불러온다.
// tokenData.ts 안에서도 export가 아니라 module.exports로 내보낸다.
// import tokenObj from '../lib/tokenData';
const tokenObj = require('./tokenData'); 

/**
 * util 함수를 모아놓은 클래스이기 때문에 굳이 싱글톤을 할 필요없다.
 */

export class SigningUtil extends Web3Conn {
    
    private VKFFtoken:any;

    constructor(){
        super();
        this.VKFFtoken = new this.web3.eth.Contract(tokenObj.ABI, tokenObj.CONTRACT_ADDRESS, {
            from: process.env.OWNER
        });
    }

    getTokenInfo = () => {
        return this.VKFFtoken;
    }

    getNonce = async (senderAddr:string):Promise<number> => {
        const nonce = await this.web3.eth.getTransactionCount(senderAddr);
        return nonce;
    }

    getPrivateKey = async (addr:string):Promise<string> => {
        return process.env.PRIVATE_KEY!;
    }

    // //컨트랙트 메소드 ABI 구하는 메소드
    // getFunctionABI =  async (category:string):Promise<any> => {
    //     return 
    // }

    generateRawTransaction = async (sender:string, receiver:string, category: keyof GasLimit, amount:string | undefined ):Promise<RawTransaction | undefined> => {

        // getNonce, getPrivateKey가 모두 Promise<string>를 반환하는 async함수인데 await없이 
        // await 없이 받으면 promise 객체가 되어 사용할 수 없다. 그래서 아래 코드는 잘못되었다. 
        // const nonce:Promise<string> = this.getNonce(sender);
        // const privateKey:Promise<string> = this.getPrivateKey(sender);
        
        //await을 붙임으로써 단지 string 타입으로만 받을 수 있다.
        const nonce:number = await this.getNonce(sender);

        const rawTransaction:RawTransaction = {
            nonce : nonce,
            to: receiver,
            chainId: parseInt(process.env.CHAIN_ID_ROPSTEN!,10),
            gas: gasLimit[category],
            gasPrice: (await gasInfofunc()).result?.FastGasPrice! + '000000000', 
        }
        
        if(category === 'SE'){
            let value = await this.web3.utils.toWei(amount!, "ether");
            rawTransaction.value = value;
        }
        else if(category === 'SV'){
            try {
                console.log('vkff전송');
                
                const transferFunc = await this.VKFFtoken.methods.transfer(receiver, amount);
                const funcABI = await transferFunc.encodeABI();

                rawTransaction.data = funcABI;

                return rawTransaction;

            } catch (error) {
                console.log(`에러 : ${error.message}`);
                
                return error.message;
            }
        }
    }

    signTransaction = async (rawTx:RawTransaction, sender:string) => {

        const senderPvKey:string = await this.getPrivateKey(sender);
        const signed = await this.web3.eth.accounts.signTransaction(rawTx, senderPvKey);
        return signed;

    }

    //encodedRawTx : signTransaction 함수에서 리턴된 RLPEncodedTransaction의 raw transaction
    sendSignTransaction = async(encodedRawTx:any) => {
        const sendSignedTransaction = await this.web3.eth.sendSignedTransaction(encodedRawTx);
        return sendSignedTransaction;
    }
}







