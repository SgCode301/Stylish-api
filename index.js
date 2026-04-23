const  express =  require("express");
const mongoose = require('mongoose');
const  http   =  require("http");
const cors = require('cors'); 
const app  =  express();
const config  =  require("./config/config") ;
const initializeSocket  =  require("./helper/socket");
const authRoute  =  require("./routes/auth");
const adminRoute  =  require("./routes/admin");
const customerRoute  =  require("./routes/customer")
const psychologistRoute  =  require("./routes/psychologist")
const media  = require("./routes/imageUpload");
const mediaPublic  = require("./routes/imageUploadPublic");
const publicRoute  =  require("./routes/public");
const zegoRoutes  =  require("./routes/zego");




app.use(cors()); // Enable CORS for all routes

app.use(express.json());
app.use("/api/auth" , authRoute);
app.use("/api/admin", adminRoute);
app.use("/api/customer" , customerRoute);
app.use("/api/psychologist", psychologistRoute);
app.use("/api/media",media);
app.use("/api/public/media",mediaPublic);
app.use("/api/public" , publicRoute);
app.use("/api/zego", zegoRoutes);


const server  =  http.createServer(app);
initializeSocket(server);


mongoose.connect(config.mongodb.dbConnectionString)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

app.get("/",(req,res)=>{
    req.json({  "message":"english speaking api is running"})
})

app.use((req,res)=>{
     res.status(404).json({"message":"route not found"})
})




server.listen(config.http.port , ()=>{
     console.log("server started successfully")
})



