import Web3 from 'web3';

export class Web3Conn {

    protected static instance:Web3Conn;

    protected infura:string;
    protected web3:Web3;

    constructor(){

        this.infura = `https://ropsten.infura.io/v3/${process.env.INFURA_KEY_ROPSTEN}`
        this.web3 = new Web3(new Web3.providers.HttpProvider(this.infura));

        if(!Web3Conn.instance){
            Web3Conn.instance = this;
        }

        return Web3Conn.instance;
    }
}

 
