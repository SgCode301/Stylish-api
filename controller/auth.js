const  AuthController  = require("../core/AuthController");
const  User   = require("../models/User");
const  config =  require("../config/config");

async function sendOtp(recipient,randNumber){
    try {
        // generate random 6-digit OTP
        recipient= recipient+"";
        // keep last 10 digits only
        recipient = recipient.slice(-10);
        
        let otp = `Dear User, Your One-Time Password (OTP)for login to the Well Hope application is: ${randNumber}. This OTP is valid for 5 minutes. Do not share it with anyone. Thank you, Well Hope Team.`;

        let url = `https://webpostservice.com/sendsms_v2.0/sendsms.php?apikey=${config.webPost.apiKey}&type=TEXT&sender=${config.webPost.sender}&mobile=${recipient}&message=${otp}`
        console.log(url);
        let response = await fetch(url,{
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        if(response.ok) return {
            randNumber,
            ...response.data
        };
        else return {
            error: "Failed to send OTP"
        };
    } catch (err) {
        console.log(err);
        return {
            error: err.message || "Error sending OTP"
        };
    }
}

const authConfig = {
    jwtSecret:config.jwt.jwtSecret,
    jwtExpiresIn:config.jwt.expiresIn,       // Optional
    loginType: 'password',                  // 'password' or 'otp'
    otpField: 'email',                     // 'mobile' or 'email'
    otpLimit: 5,                          // OTP attempts allowed per minute
    otpExpiry: 10 * 60 * 1000,           // OTP validity in milliseconds
   
  };

  const authConfig1 = {
    jwtSecret:config.jwt.jwtSecret,
    jwtExpiresIn:config.jwt.expiresIn,       // Optional
    loginType: 'otp',                  // 'password' or 'otp'
    otpField: 'phoneNo',                     // 'mobile' or 'email'
    otpLimit: 5,                          // OTP attempts allowed per minute
    otpExpiry: 10 * 60 * 1000,           // OTP validity in milliseconds
    //sendOtp
  };




const   authController  =  new AuthController(User, authConfig);

const  otpauthController  =  new AuthController(User , authConfig1);


module.exports = { authController , otpauthController}
