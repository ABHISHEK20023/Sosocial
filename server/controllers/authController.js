const User=require('../models/User');
const bcrypt=require('bcrypt');
const jwt=require('jsonwebtoken');
const { error, success } = require('../utils/responseWrapper');
const signupController=async (req,res)=>{
    try{
        const {name,email,password}=req.body;
        if(!email || !password || !name)
        {
            // return res.status(400).send('all fields are required');
            return res.send(error(400,'All fields are required'))
        }
 
        const oldUser=await User.findOne({email});
        if(oldUser)
        {
        //    return res.status(409).send('User is already registered');
           return res.send(error(400,'User is already registered'))

        }

        const hashedPassword= await bcrypt.hash(password,10);

        const user=await User.create({
            name,
            email,
            password : hashedPassword
        });
        

        // return res.json({
        //     user
        // })
        const newUser=await User.findById(user._id);
        return res.send(
            success('200',
                    {newUser}
                    )
            );
    }catch(e){
        return res.send(error(500,e.message))
    }
}

const loginController=async (req,res)=>{
    try{
        const {email,password}=req.body;
        if(!email || !password)
        {
            // return res.status(400).send('all fields are required');
           return res.send(error(400,'all fields are required'))

        }
 
        const user=await User.findOne({email}).select('+password');
        if(!user)
        {
        //    return res.status(404).send('User is not registered');
        return res.send(error(404,'User is not registered'))

        }

        const matched=await bcrypt.compare(password,user.password);
        if(!matched)
        {
        //    return res.status(403).send('Incorrect password');
        return res.send(error(403,'Incorrect password'))


        }
           const accessToken=generateAccessToken({_id :user._id})
           const refreshToken=generateRefreshToken({_id :user._id})
         
           res.cookie('jwt',refreshToken,{
            httpOnly:true,  //this ensure that even frontend will not able to access cookie
            secure : true
           })
  
        // return res.json({accessToken});
        return res.send(
            success('200',
                    {accessToken}
                    )
            );


    }catch(e){
        return res.send(error(500,e.message))

    }
}

// this api will check the refreshToken validity and generate a new access token
const refreshAccessTokenController=async (req,res)=>{
//    const {refreshToken}=req.body;

const cookies=req.cookies;
    if(!cookies.jwt)
    {
    // return res.status(401).send('refresh token in cookie is required')
    return res.send(error(401,'refresh token in cookie is required'))
    }

    const refreshToken=cookies.jwt;


   if(!refreshToken){
    // return res.status(401).send('refresh token required')
    return res.send(error(401,'refresh token required'))

   }

   try {
    const decoded=jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_PRIVATE_KEY
        );
        const _id=decoded._id;
       const accessToken=generateAccessToken({_id});
        
    //    return res.status(200).json({accessToken}); 
       return res.send(
        success('201',
                {accessToken}
                )
        );
       
 } catch (error) {
    // return res.status(401).send("invalid Refresh token");
    return res.send(error(401,'invalid Refresh token'))

 }  
}

const logoutController=async (req,res)=>{
    try {
        res.clearCookie('jwt',{
            httpOnly:true,
            secure:true
        })
     return   res.send(success(200,'user logged out'))
    } catch (e) {
          
    }
}

// internal functions 

const generateAccessToken=(data)=>{
    //first parameter is data to be tokenized then secret key choosen by us third optional parameter tell token expirations
  const token=  jwt.sign(data,process.env.ACCESS_TOKEN_PRIVATE_KEY,{expiresIn :'1d'});
  return token;
} 

const generateRefreshToken=(data)=>{
    //first parameter is data to be tokenized then secret key choosen by us third optional parameter tell token expirations
  const token=  jwt.sign(data,process.env.REFRESH_TOKEN_PRIVATE_KEY,{expiresIn :'1y'});
  return token;
}

module.exports={
    signupController,loginController,refreshAccessTokenController,logoutController
}