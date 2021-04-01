"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.init = exports.ApiServer = void 0;
const http_1 = __importDefault(require("http"));
const http_errors_1 = __importDefault(require("http-errors"));
const path_1 = __importDefault(require("path"));
const express_1 = __importDefault(require("express"));
const morgan_1 = __importDefault(require("morgan"));
const express_session_1 = __importDefault(require("express-session"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const dotenv = __importStar(require("dotenv"));
dotenv.config({ path: path_1.default.join(__dirname, 'environment/.env') });
class ApiServer extends http_1.default.Server {
    constructor(config, routes) {
        const app = express_1.default();
        super(app);
        this.app = app;
        this.config = config;
        this.currentConns = new Set();
        this.busy = new WeakSet();
        this.stopping = false;
        this.routes = routes;
        if (!ApiServer.instance) {
            ApiServer.instance = this;
        }
        return ApiServer.instance;
    }
    start() {
        return __awaiter(this, void 0, void 0, function* () {
            this.app.use(morgan_1.default('dev'));
            this.app.use((req, res, next) => {
                this.busy.add(req.socket);
                console.log('클라이언트 요청이 들어왔습니다.');
                res.on('finish', () => {
                    if (this.stopping)
                        req.socket.end();
                    this.busy.delete(req.socket);
                    console.log(this.busy.has(req.socket));
                    console.log('클라이언트 요청처리가 완료되었습니다.');
                });
                next();
            });
            this.app.use(express_1.default.json());
            this.app.use(express_1.default.urlencoded({ extended: false }));
            this.app.use(express_1.default.text());
            this.app.use(express_1.default.raw());
            this.app.use(cookie_parser_1.default(process.env.COOKIE_SECRET || 'test'));
            this.app.use(express_session_1.default({
                resave: false,
                saveUninitialized: false,
                secret: process.env.COOKIE_SECRET || 'test',
                cookie: {
                    httpOnly: true,
                    secure: false,
                    maxAge: 24000 * 60 * 60
                }
            }));
            this.app.get('/health', (req, res) => {
                if (this.listening)
                    return res.send('<h1>서버 정상 작동 중</h1>');
            });
            this.applyRoutes(this.routes);
            this.on('connection', (socket) => {
                this.currentConns.add(socket);
                console.log('클라이언트가 접속했습니다.');
                socket.on('close', () => {
                    this.currentConns.delete(socket);
                    console.log('연결해제 되었습니다.');
                });
            });
            this.app.use((req, res, next) => {
                next(http_errors_1.default(404));
            });
            this.app.use(this.errHandler);
            return this;
        });
    }
    applyRoutes(routes) {
        routes.forEach(route => {
            this.app.use('/', route.controller);
        });
    }
    shutdown() {
        if (this.stopping) {
            console.log('이미 서버 종료 중입니다...');
            return;
        }
        this.stopping = true;
        this.close((err) => {
            if (err) {
                console.log('서버 종료 중 에러 발생');
            }
            else {
                console.log('서버를 종료합니다. - 정상 종료');
                process.exit(0);
            }
        });
        setTimeout(() => {
            console.log('서버를 종료합니다. - 비정상 종료');
            process.exit(1);
        }, this.config.shutdownTimeout).unref();
        if (this.currentConns.size > 0) {
            console.log(`현재 동시접속 중인 연결 ${this.currentConns.size}을 종료 대기중입니다.`);
            for (const con of this.currentConns) {
                if (!this.busy.has(con)) {
                    console.log('!순차 종료');
                    con.end();
                }
            }
        }
    }
    errHandler(req, res, next) {
        console.error('에러 발생');
        res.status(500).send('<h1>에러 발생</h1>');
    }
}
exports.ApiServer = ApiServer;
const init = (config, routes) => __awaiter(void 0, void 0, void 0, function* () {
    const server = new ApiServer(config, routes);
    return yield server.start();
});
exports.init = init;
