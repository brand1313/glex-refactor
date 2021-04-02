import { createConnection, RowDataPacket, QueryError, createPool,Connection} from 'mysql2';

const connect = () => {
    const connection = createPool({
        host: 'localhost',
        user: 'root',
        password: process.env.MYSQL_PASSWORD,
        database: 'myapp',
        connectionLimit: 4
    });

    return connection.promise();
}

export default connect;