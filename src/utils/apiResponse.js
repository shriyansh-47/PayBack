
// This class will be used for sending a strctured response back to the
// front-end, its necessary so as to maintain a standard structre of
// response sent back.

class apiResponse{
    constructor(statusCode, data, message="Success"){
        this.statusCode = statusCode
        this.data = data
        this.message = message
        this.success = statusCode < 400
    }
}

export { apiResponse }