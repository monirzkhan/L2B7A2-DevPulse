import dotenv from 'dotenv';
import path from 'path';
dotenv.config({
    path: path.join(process.cwd(), '.env')
});
const requiredEnv = [
    'DATABASE_URL',
    'JWT_SECRET',
    'JWT_REFRESH_SECRET'
];
requiredEnv.forEach((envKey) => {
    if (!process.env[envKey]) {
        throw new Error(`Missing required environment variable: ${envKey}`);
    }
});
const config = {
    port: Number(process.env.PORT ?? 5000),
    database_url: process.env.DATABASE_URL,
    jwt_secret: process.env.JWT_SECRET,
    jwt_refresh_secret: process.env.JWT_REFRESH_SECRET,
};
export default config;
//# sourceMappingURL=index.js.map