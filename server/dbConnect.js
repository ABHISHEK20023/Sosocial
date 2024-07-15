const mongoose=require("mongoose");
 module.exports=async ()=>{
     const Url = process.env.MONGO_DB_URI;
    

    try{
        await mongoose.connect(Url);
        console.log("connected to mongo successfully");
    }catch(e){
        console.log("please correct the mentioned error",e);
        
    }
 }