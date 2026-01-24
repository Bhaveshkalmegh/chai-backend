import { asynchandler } from "../utils/asynchandler.js";
import {ApiError} from "../utils/ApiError.js";
import {User} from "../models/user.model.js";
import {UploadOnCloudinary} from "../utils/cloudinary.js";
import {ApiResponse} from "../utils/ApiResponse.js";

const registeruser = asynchandler(async(req,res)=>{
    // get user details from frontend
    // validation - not empty (always contains seperate method for validation in different file)
    // check if user already exists : username , email
    // check for images - check for avatar
    // upload them to cloudinary , check on avatar uploaded on cloudinary or not 
    // create a user object - create entry in db 
    // remove password and refresh token from response 
    // check for user creation 
    // return res



    // Got user details from frontend
    const {fullname , email, username ,password}=req.body
    console.log("email",email);

    //  Empty field validation
    if(
        [fullname, email,username, password].some((fields)=>{
            return fields.trim()===""
        })
    ){
        throw new ApiError(400,"All fields are required")
    }


    // check if user already exists
    const existedUser =   User.findOne({
        $or:[{ username } ,{ email }]
    })
    if(existedUser){
        throw new ApiError(409,"User trying to registered Already exists")
    }


    //check for images
    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path; 
    if (!avatarLocalPath){
        throw new ApiError(400,"Avatar is required")
    }


    // upload them to cloudinary
    const avatar = await  UploadOnCloudinary(avatarLocalPath ); //get  entire response object from cloudinary
    const coverImage = await  UploadOnCloudinary(coverImageLocalPath);

    if(!avatar){
        throw new ApiError (500,"Unable to upload avatar on cloudinary")
    }
     
    // create user object
    const user = await User.create({
        fullname,
        avatar: avatar.url,
        coverImage: coverImage?.url||"",
        email,
        username:username.toLowerCase(),
        password 
    })
    const  createdUser = await User.findById(user._id).select("-password -refreshTokens"); 
    
    //check whether user register and sdved in db successfully or not
    if(!createdUser){
        throw new ApiError (500,"Somea thing went wrong while registering user Unable to create user please try again ")
    }



    // response sent to frontend
    return res.status(201).json(
        new ApiResponse(201,createdUser,"User registered successfully")
    )

})

export {registeruser};