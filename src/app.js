import express from "express";
import handlebars from 'express-handlebars'
import mongoose from "mongoose";
import __dirname from './utils.js'
import { Server } from 'socket.io'
//SESSION
import session from "express-session";
import cookieParser from "cookie-parser";
import MongoStore from "connect-mongo";
//ROUTES
import routes from './routes/index.js'
//Passport
import passport from "passport";
import initializePassport from "./config/passport.config.js";
//ENV
import env from './config/config.js'
//Logger
import { addLogger } from "./utils/logger.js";
//API Doc
import swaggerJSDoc from "swagger-jsdoc";
import swaggerUiExpress from "swagger-ui-express";

const app = express();
const serverMongo = app.listen(env.PORT, () => {console.log('connected to mongodb on port: ' + env.PORT)})
mongoose.connect(env.MONGO_URL, { 
        useNewUrlParser: true,
        useUnifiedTopology: true
    }
)

//Api doc
const swaggerOptions = {
    definition: {
        openapi: '3.0.1',
        info: {
            title: 'Documentacion API ecommerce',
            description: 'Documentacion ecommerce CoderHouse'
        }
    },
    apis:[`./src/docs/**/*.yaml`]
}

//Creo los specs
const specs = swaggerJSDoc(swaggerOptions)
//Declaro swagger API endpoint
app.use('/apidocs', swaggerUiExpress.serve, swaggerUiExpress.setup(specs))


export const io = new Server(serverMongo)

app.use(express.static(__dirname+'/public'))
app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(session({
    store: new MongoStore({
        mongoUrl: env.MONGO_URL,
        ttl: 3600
    }),
    secret: env.SECRET_PASS,
    resave: true,
    saveUninitialized: true
}))

initializePassport();
app.use(passport.initialize())
app.use(passport.session())


app.engine('handlebars', handlebars.engine())
app.set('views', `${__dirname}/views`);
app.set('view engine', 'handlebars');

app.use(addLogger)
app.use('/', routes)