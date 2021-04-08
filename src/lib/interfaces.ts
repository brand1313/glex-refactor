export interface BasicConfig {
    port: string | number,
    shutdownTimeout: number
}

interface GasPriceInfo {
    LastBlock: string | undefined,
    SafeGasPrice: string | undefined,
    ProposeGasPrice: string | undefined,
    FastGasPrice: string | undefined
}

export interface GasInfo {
    status: string | undefined,
    message: string | undefined,
    result: GasPriceInfo | undefined 
}

export interface FeeTable {
    readonly SG: string,
    readonly SE: string,
    readonly MA?: string,
    readonly MW?: string,
    readonly RW?: string
}

export interface RawTransaction {
    nonce : number,
    to  : string,
    chainId : number,
    gas : string,
    gasPrice : string,
    data?: string,
    value?: string
}

export interface GasLimit {
    SE: string,
    SV: string 
}