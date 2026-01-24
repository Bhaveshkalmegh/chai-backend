import { asynchandler } from "../utils/asynchandler.js";

const registeruser = asynchandler(async(req,res)=>{
    res.status(200).json({
        message:"User successfully registered",
        message2:"Chai aur Code"
    })
})

export {registeruser};