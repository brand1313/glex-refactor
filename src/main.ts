import { ApiServer, init} from './server';
import { BasicConfig } from './lib/interfaces';

import config from './lib/config';

const main = async () => {
    
    // const userRoutes:UserController = await userRouterInit();
    // const routes:Array<any> = [userRoutes];

    const basicConfig:BasicConfig = await config.basicConfig();
    const server:ApiServer = await init(basicConfig);

    server.listen(basicConfig.port, () => {
        
        console.log(`server running at ${basicConfig.port}`);
    });

    process.on('SIGTERM', () => server.shutdown());
    process.on('SIGINT', () => server.shutdown());
}

main();