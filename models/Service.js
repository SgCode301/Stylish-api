const  mongoose  = require("mongoose");

const servicePlan  = new mongoose.Schema({
       

       user:{
            type:mongoose.Types.ObjectId,
             ref:'User'
       },
       title:{
          type:String,
       },
       thumbnail:{
          type:String,
       },
       description:{
           type:String,  
       },
       features:[String],
       price:{
          type:Number
       },
       visibility:{
           type:Boolean,

       }


})

module.exports  =  mongoose.model("Service" , servicePlan);