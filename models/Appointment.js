const  mongoose  =    require("mongoose");

const appointmentSchema   =  new mongoose.Schema({
  
     date:{
         type:Date,
     },
     slot:{
          type:String,
     },
     user:{
        type:mongoose.Types.ObjectId,
        ref:'User'

     },
     psychologist:{
        type:mongoose.Types.ObjectId,
         ref:'User' 
     },
     transaction:{
        type:mongoose.Types.ObjectId,
         ref:'Transaction' 
    }


})

module.exports  =  mongoose.model("Appointment" ,appointmentSchema)