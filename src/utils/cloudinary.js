// here cloudinary will get a path of local file we will upload on server if successful remove a file from local Machine 

// In fileSystem we just unlink file from fileSystem to delete from database
// If upload fail then also we will remove that file from loacl machine as it is of no use 


import {v2 as cloudinary} from "cloudinary"
import fs from "fs"


cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET
});



const UploadOnCloudinary =async (localFilePath) =>{
    try {
        if(!localFilePath) return null;
        // uplaod the file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath,{
            resource_type:"auto"
        })
        console.log("file is uploaded on cloudinary",response.url);
        return response;
    } catch (error) {
        fs.unlinkSync(localFilePath) //since upload got failed that file of no use user should upload again
    }
}

export{UploadOnCloudinary}