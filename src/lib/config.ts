import { BasicConfig } from './interfaces';

export default {
    basicConfig: ():BasicConfig => {
        return {
            port: process.env.PORT || 12000,
            shutdownTimeout: 10000
        }
    }
}