import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";


const userSchema =new mongoose.Schema(
    {
        username:{
            type:String,
            required : true,
            unique : true,
            lowercase : true,
            trim:true,
            index:true
        },
        email:{
            type:String,
            required : true,
            unique : true,
            lowercase : true,
            trim:true,

        },
        fullName:{
            type:String,
            required : true,   
            trim:true,
            index:true
        },
        avatar:{
            type:String , // cloudinary url
            required: true 
        },
        coverImage:{
            type:String , // cloudinary url 
        },
        watchhistory:[{
            type: mongoose.Schema.Types.ObjectId,
            ref:"Video"
        }],
        password:{
            type : String,
            required: [true,"password is required"]
        },
        refershTokens:{
            type:String
        }
        },
        {
        timestamps:true
        }
)

// we want to encrypt password befor save 

userSchema.pre("save", async function(){
    if(!this.isModified("password")) return ; // if password is not modified thenn return it . Below Issue Solved by this condition 
    this.password =  bcrypt.hash(this.password,10) //here issue is if a person change his name as well it will encrypt it again 
    // next() no need of giving next as a refernce in async function mongoose will send a reference of req ,res,next automatically 
})

userSchema.methods.isPasswordCorrect = async function (password){
    return await  bcrypt.compare(password,this.password) // password is plain text password given by user and this.password is encrypted
}

userSchema.methods.generateAccessToken = function(){
    return jwt.sign(
        {
            _id : this._id,
            email:this.email,
            username:this.username,
            fullName:this.fullName

        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expireIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}


userSchema.methods.generateRefreshToken = function(){
    jwt.sign(
        {
            _id : this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expireIn:process.env.REFRESH.TOKEN.EXPIRY
        }
    )
}

export const User = mongoose.model("User",userSchema)