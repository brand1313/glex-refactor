import { ApiServer, init} from './server';
import { BasicConfig } from './lib/interfaces';

import config from './lib/config';
import { routerInit } from './routes/controllers';

const main = async () => {
    
    const txController = await routerInit();
    const routes:Array<any> = [txController];

    const basicConfig:BasicConfig = await config.basicConfig();
    const server:ApiServer = await init(basicConfig,routes);

    server.listen(basicConfig.port, () => {
        
        console.log(`server running at ${basicConfig.port}`);
    });

    process.on('SIGTERM', () => server.shutdown());
    process.on('SIGINT', () => server.shutdown());
}

main();