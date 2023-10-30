import dotenv from 'dotenv';

dotenv.config()

export default {
    MONGO_URL: process.env.MONGO_URL,
    MONGO_URL_TESTING: process.env.MONGO_URL_TESTING,
    GITHUB_CLIENTID: process.env.GITHUB_CLIENTID,
    GITHUB_CLIENTSECRET: process.env.GITHUB_CLIENTSECRET,
    GITHUB_CALLBACKURL: process.env.GITHUB_CALLBACKURL,
    PORT: process.env.PORT,
    SECRET_PASS: process.env.SECRET_PASS,
    PRIVATE_KEY: process.env.PRIVATE_KEY,
    PERSISTANCE: process.env.PERSISTANCE,
    PORT: process.env.PORT,
    baseUrl: process.env.BASEURL,
    environment: process.env.NODE_ENV,
    mailing: {
        service: process.env.MAIL_SERVICE,
        port: process.env.MAIL_PORT,
        auth: {
            user: process.env.MAIL_AUTH_USER,
            pass: process.env.MAIL_AUTH_PASS,
        },
    },
}