/*
Instead of throwing a normal JavaScript Error, 
you throw an API-specific error that contains additional information 
like the HTTP status code, success flag, and error details.
*/

class apiError extends Error{
    constructor(
        statusCode,
        message="Error Occurred",
        errors=[],
        stack=""
    ){
        super(message)
        this.statusCode = statusCode
        this.data = null
        this.message = message
        this.success = false
        this.errors = errors

        if(stack){
            this.stack = stack
        }
        else{
            Error.captureStackTrace(this,this.constructor)
        }
    }
}


export {apiError}