const mongoose =  require("mongoose");


const   bannerSchema  = new  mongoose.Schema({
     image:{
          type:String ,
          required:true,
     },
     alt:{
          type:String,
          required:true
     },
     title:{
         type:String ,

     },
     description:{
         type:String,
     },
     position:{
          type:Number,
          required:true,
     }

      
} , {timestamps:true})


module.exports =  mongoose.model("Banner",bannerSchema)
 