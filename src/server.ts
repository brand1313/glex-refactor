import http from 'http';
import createErrors from 'http-errors';
import path from 'path';
import express, {Request, Response, NextFunction, Errback} from 'express'; 
import morgan from 'morgan';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import { BasicConfig } from './lib/interfaces';
import * as dotenv from 'dotenv';

dotenv.config({path:path.join(__dirname, 'environment/.env')});

class ApiServer extends http.Server {

    private static instance: ApiServer;

    private app:express.Application;
    private config:BasicConfig;
    private currentConns:any;
    private busy:any;
    private stopping:boolean;

    constructor(config:BasicConfig){
        
        const app:express.Application = express();
        super(app);
        this.app = app;
        this.config = config;
        this.currentConns = new Set();
        this.busy = new WeakSet();
        this.stopping = false;

        if(!ApiServer.instance){
            ApiServer.instance = this;
        }

        return ApiServer.instance;
    }

    async start():Promise<ApiServer>{

        this.app.use(morgan('dev'));

        this.app.use((req:Request, res:Response, next:NextFunction) => {
            this.busy.add(req.socket);
            console.log('클라이언트 요청이 들어왔습니다.');

            res.on('finish', () => {
                if(this.stopping) req.socket.end();
                this.busy.delete(req.socket);

                console.log(this.busy.has(req.socket));
                console.log('클라이언트 요청처리가 완료되었습니다.');
            });

            next();
        });

        this.app.use(express.json());
        this.app.use(express.urlencoded({extended: false}));
        this.app.use(express.text());
        this.app.use(express.raw());

        this.app.use(cookieParser(process.env.COOKIE_SECRET || 'test'));
        this.app.use(session({
            resave:false,
            saveUninitialized: false,
            secret: process.env.COOKIE_SECRET || 'test' ,
            cookie: {
                httpOnly: true,
                secure: false,
                maxAge: 24000 * 60 * 60
            }
        }));

        this.app.get('/health',(req:Request, res:Response) => {
            if(this.listening) return res.send('<h1>서버 정상 작동 중</h1>');
        });

        this.on('connection',(socket) => {
            this.currentConns.add(socket);
            console.log('클라이언트가 접속했습니다.');

            socket.on('close', () => {
                this.currentConns.delete(socket);
                console.log('연결해제 되었습니다.');
            });
        });

        this.app.use((req:Request, res:Response, next:NextFunction) => {
            next(createErrors(404));
        });

        this.app.use(this.errHandler);

        
        return this;    
    }

    shutdown():void{
        if(this.stopping){
            console.log('이미 서버 종료 중입니다...');
            return;
        }

        this.stopping = true;

        this.close( (err:Error | undefined) =>{
            if(err){
                console.log('서버 종료 중 에러 발생');
            }else{
                console.log('서버를 종료합니다. - 정상 종료');
                process.exit(0);
            }
        });

        setTimeout(() => {
            console.log('서버를 종료합니다. - 비정상 종료');
            process.exit(1);
        },this.config.shutdownTimeout).unref();

        if(this.currentConns.size > 0){
            console.log(`현재 동시접속 중인 연결 ${this.currentConns.size}을 종료 대기중입니다.`);

            for(const con of this.currentConns){
                if(!this.busy.has(con)){
                    console.log('!순차 종료');
                    con.end();
                }
            }
        }
    }

    errHandler(req:Request, res:Response, next:Errback){
        console.error('에러 발생');
        res.status(500).send('<h1>에러 발생</h1>');
    }

}

const init = async(config:BasicConfig):Promise<ApiServer>=> {

    const server = new ApiServer(config);
    return await server.start();
    
}

export { ApiServer, init }


