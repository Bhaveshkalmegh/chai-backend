// require('dotenv').config({path:"./.env"})

import dotenv from "dotenv";
import connectDB from "./db/index.js";


dotenv.config({
    path:"./.env"
})


connectDB()
.then(()=>{
  app.on("error",(error)=>{
    console.log("error on runing app ",error);
    throw error;
  })
  app.listen(process.env.PORT || 8000,()=>{
    console.log(`server running on http://localhost:${process.env.PORT || 8000}`);  


  })
})
.catch((error)=>{
  console.log("MongosDB connection failed ", error);
})










/*
import express from "express";

const app = express();

(async ()=>{
  try {
    await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
    
    app.on("error",(error)=>{
        console.log("error",error)
        throw error;
    })
    app.listen(process.env.port,()=>{
        console.log(`server running on http://localhost:${process.env.PORT}`);
    })



  } catch (error) {
    console.error("Error connecting to the database:", error);
    throw error;
  }  
})()


*/