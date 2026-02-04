import { asynchandler } from "../utils/asynchandler.js";
import {ApiError} from "../utils/ApiError.js";
import {User} from "../models/user.model.js";
import {UploadOnCloudinary} from "../utils/cloudinary.js";
import {ApiResponse} from "../utils/ApiResponse.js";


const generateAccessTokenAndRefreshToken = async(userId)=>{
    try{
        const user = await User.findById(userId);
        if(!user){
            throw new ApiError (404,"User not found to generate access and refresh token")
        }
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()
        // we have to store refresh token in db
        user.refreshTokens= refreshToken
        //save user after updating refresh token
        await user.save({validateBeforeSave:false}) // will validate the required fields like password etc before saving but here we are not updating password so its ok
        return {accessToken,refreshToken}

    }    
    catch(err){
        throw new ApiError(500,"unable to generate access and refresh token")
    }
}



const registerUser = asynchandler(async(req,res)=>{
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
    const {fullName , email, username ,password}=req.body
    console.log("email",email);
    // console.log(req.body);
    //  Empty field validation
    if(
        [fullName, email,username, password].some((fields)=>{
            return fields.trim()===""
        })
    ){
        throw new ApiError(400,"All fields are required")
    }


    // check if user already exists
    const existedUser = await  User.findOne({
        $or:[{ username } ,{ email }]
    })
    if(existedUser){
        throw new ApiError(409,"User trying to registered Already exists")
    }


    //check for images
    console.log("req.files",req.files);
    const avatarLocalPath = req.files?.avatar[0]?.path;
    // console.log(avatarLocalPath);
    // const coverImageLocalPath = req.files?.coverImage[0]?.path;// we are not checking wether a file contains req.files or not 
    
    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }
    

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
        fullName,
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


const loginUser = asynchandler(async(req,res)=>{
    
    // get user credanttials from req body
    // usershould able to login using username or email
    // validate - wether existing registerd user or not 
    // match passsword
    // generate jwt token - access token ,refresh token
    // send user details and tokens in cookie 
    // send successfull login response

    const {email,username,password} = req.body;

    if(!username && !email){
        throw new ApiError (400,"Username or email is required to login")
    }

    const user = await User.findOne({
        $or :[{username},{email}]
    })

    if(!user){
        throw new ApiError (404,"User not found with given credentials")
    }

    const ispasswordvalid = await user.isPasswordCorrect(password); // it will return true or false

    if(!ispasswordvalid){
        throw new ApiError (401,"Invalid password");
    }

    const {accessToken, refreshToken}=await generateAccessTokenAndRefreshToken(user._id)

    // access token and refresh token not upadated yet for current object reference
    // loggedInUser.accessToken = accessToken // this already update in reference object in generateAccessTokenAndRefreshToken function 
    // loggedInUser.refreshToken = refreshToken
    const loggedInUser =await user.findByID(user._id).select(" -password -refreshTokens") // remove password and refresh token for sending data in cookie to user 


    const options = {
        httpOnly : true,// not accessible by javascript on frontend
        secure :true // only send on https
    }


    return res
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(
        new ApiResponse(200,{
            user:loggedInUser,
            accessToken:accessToken,
            refreshToken:refreshToken
        },
        "User logged in successfully"
    )
    )


})


    const logoutUser= asynchandler(async(req,res)=>{
        //remove access token and refresh token from cookies as well as user database 
        // here the issue is not having anything to identify which user is logging out if we gave user to enter id or email to logout then any one can logout anyone 
        // solution 
        // we have to use middleware to validate where user exist or not 


        // req from verifyJWT middleware going to forward in logout so we can access user from req object
        // since we had done const user= await User.findById(decodedToken._id).select("-password -refershTokens")
        // we had user -> find User from db -> we can delete refresh token from there
        // we can do find by ID  ----> we have to bring user -> delete refresh token -> save user validate false 
        // betteer to use findByIdAndUpdate method


        await User.findByIdAndUpdate(
             req.user._id,
            {
                $set:{
                    refershTokens:undefined
                }
            },
                {
                    new:true
                }
            
        )

        options={
            httpOnly:true,
            secure:true
        }

        return res
        .status(200)
        .clearCookie("accessToken",options)
        .clearCookie("refreshToken",options)
        .json(new ApiResponse(200,{},"User Logged out successfully"))

    })

    

export {registerUser ,loginUser ,logoutUser};