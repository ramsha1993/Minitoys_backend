import ErrorHandler from "../utils/utilityclass.js";

export const errorMiddleware = (error, req, res, next) => {
    error.message ||= "Internal server error"
    error.statusCode ||= 500
    return res.status(error.statusCode).json({
        success: false,
        message: error.message
    })

}

export const TryCatch = (func) => {
    return (req, res, next) => {
        return Promise.resolve(func(req, res, next)).catch(next)
    }


}