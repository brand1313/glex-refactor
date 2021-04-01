import request from 'request';
import requestps from 'request-promise';
import {GasInfo} from './interfaces';
//가스 가격 정보
const gasInfofunc = async ():Promise<GasInfo> => {
    const gasPriceInfo = await requestps(`https://api.etherscan.io/api?module=gastracker&action=gasoracle&apikey=${process.env.ETHER_SCAN_API_KEY}`);
    const gasPriceInfoJson:GasInfo = JSON.parse(gasPriceInfo);

    return gasPriceInfoJson;
}

export {
    gasInfofunc
}