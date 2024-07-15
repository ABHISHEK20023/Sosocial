const express=require('express');
const env=require('dotenv');
const dbConnect=require('./dbConnect');
const authRouter=require('./routers/authRouter')
const postRouter=require('./routers/postRouter')
const UserRouter=require('./routers/userRouter')
const cloudinary = require("cloudinary").v2
const cors=require('cors')
const cookieParser=require('cookie-parser');
const morgan =require('morgan');
env.config('./.env');
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY ,
    api_secret: process.env.CLOUDINARY_SECRET_KEY // Click 'View Credentials' below to copy your API secret
});
const app = express();


//middlewares 
app.use(express.json({ limit: '50mb' }));
app.use(morgan('common'));
app.use(cookieParser());
app.use(cors({
    credentials : true,
    origin : 'http://localhost:3000'
}));

dbConnect();

const PORT=process.env.PORT || 4001;
app.use('/auth',authRouter);
app.use('/posts',postRouter)
app.use('/user',UserRouter)
// app.get('/',(req,res)=>{
//     res.status(400).send("test working fine")
// })

app.listen(PORT,()=>{
    console.log("app running on port : ",PORT);
})
 //mongodb+srv://abhishek:0QsGvIYn8YcB4S7A@cluster0.wpbeshh.mongodb.net/?retryWrites=true&w=majority