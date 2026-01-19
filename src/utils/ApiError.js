class ApiError extends Error{
    constructor(statusCode, message="Something went wrong",errors=[],statck=""){
        super(message);
        this.statusCode=statusCode;
        this.data=null;
        this.message=message;
        this.success=false;
        this.errors=errors;
        
        if(stack){
            this.stack=stack;
        }
        else{
            // help to track where the error is occured in the code
            Error.captureStackTrace(this,this.constructor);
        }
    }
}

export {ApiError}