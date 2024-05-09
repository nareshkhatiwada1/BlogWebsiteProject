import express from "express";
import dotenv from 'dotenv';
dotenv.config();
import expressEjsLayouts from "express-ejs-layouts";
import  MethodOverrideOptions  from "method-override";
import mainRoutes from './server/routes/main.js';
import adminRoutes from './server/routes/admin.js';
import connectDB from './server/config/db.js';
import cookieParser from "cookie-parser";
import MongoStore from "connect-mongo";
import session from "express-session";
import isActiveRoute from "./server/healpers/routeHelpers.js";

const app = express();
const PORT = 3000 || process.env.PORT;

//connect db

connectDB();

app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.use(cookieParser());
app.use(MethodOverrideOptions('_method'))

app.use(session({
    secret:'keyboard cat',
    resave: false,
    saveUninitialized:true,
    store:MongoStore.create({
        mongoUrl:process.env.MONGODB_URI
    }),
}))


app.use(express.static("public"));

//templating engine
app.use(expressEjsLayouts);
app.set('layout','./layouts/main');
app.set('view engine','ejs');

app.locals.isActiveRoute = isActiveRoute;

app.use("/", mainRoutes);
app.use("/", adminRoutes);

app.listen(PORT,(err)=>{
    if(err) throw err;
    else{
        console.log(`server running in Port no: ${PORT}`);
    }
})