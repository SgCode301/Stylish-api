require('dotenv').config();

module.exports = {
    jwt: {
        jwtSecret:process.env.JWT_SECRET,
        expiresIn:"10d"
    },
    // msg91: {
    //     authKey: process.env.MSG91_AUTH_KEY,
    //     baseUrl: "https://control.msg91.com/api/v5",
    //     templets: {
    //         otp: "6684e2cad6fc0540dc648dc2",//var 1 user var 2 otp
    //         welcome: ""
    //     },
    //     senderId: "test123",
    //     route: 4
    // },
    pagination: {
        limit: 10,
        maxLimit: 200
    },
    http: {
        port: 80
        //80
    },
    mongodb: {
        dbConnectionString: process.env.MONGODB_CONNECTION_STRING
    },
    cloudinary: {
        cloudName: process.env.CLOUDINARY_CLOUD_NAME,
        apiKey: process.env.CLOUDINARY_API_KEY,
        apiSecret: process.env.CLOUDINARY_API_SECRET
    },
    webPost:{
        apiKey:process.env.WEBPOST_API_KEY,
        sender:"ASAWLH",
    },
   
}

