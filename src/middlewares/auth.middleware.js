//  Authentication middleware ->  this helps use to validate user exist or not 

import { asynchandler } from "../utils/asynchandler";
import { ApiError } from "../utils/ApiError";
import jwt from "jsonwebtoken"
import {User} from "../models/user.models.js";

export const verifyJWT = asynchandler(async(req,res,next)=>{
//req having access top cookies and header since we had added cookie parser middleware in app.js file    

// so we can access accessToken from cookie or header 
try {
    
const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","") // replacing Brearer space with empty string to get only accesstoken

if(!token){
    throw new ApiError (401,"Access token is missing , unauthorized Request")
}

// verify token
const decodedToken = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
 
const user= await User.findById(decodedToken._id).select("-password -refershTokens")

if(!user){
    //if user not exist 
    throw new ApiError(401,"Invalid Access Tooken ")
}
} catch (error) {
    throw new ApiError(401,error?.message || "Invalid Access Token")
}
})