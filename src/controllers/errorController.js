const appError = require('../controllers/appError')

// error handlers
const handleJwtExpired = () => {
    return new appError('Your token has expired! Please log in again.', 401)
}

const handleJwtError = () => {
    return new appError('Invalid token. Please log in again!', 401)
}

const handlerValidationError = err => {
    const errors = Object.values(err.errors).map(el => el.message)
    const message = `Invalid input data. ${errors.join('. ')}`
    return new appError(message, 400)
}

const handleCastError = err => {
    const message = `Invalid ${err.path}: ${err.value}`
    return new appError(message, 400)
} 

const handleDuplicateErrorDB = err => {
    const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0]
    const message = `Duplicate fielf value: ${value}. Please use another value`
    return new appError(message, 400)
}

const sendErrorProd = (err, res) => {
    if(err.isOperational) {
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message
        })
    } else {
        console.log(err)
        res.status(500).json({
            status: 'error',
            message: 'something went very worng!'
        })
    }
}

const sendErrorDev = (err, res) => {
    console.log('Error:: ', err)
    res.status(err.statusCode).json({
        status: err.status,
        error: err,
        message: err.message,
        stack: err.stack
    })
}

module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500
    err.status = err.status || 'error'

    if(process.env.NODE_ENV === "development") {
        sendErrorDev(err, res)
    } else if (process.env.NODE_ENV === "production") {
        let error = err
        if(error.name === "CastError") error = handleCastError(err)
        if(error.code === 11000) error = handleDuplicateErrorDB(err)
        if(error.name === "ValidationError") error = handlerValidationError(err)
        if(error.name === "JsonWebTokenError") error = handleJwtError(err)
        if(error.name === "TokenExpiredError") error = handleJwtExpired(err)
        sendErrorProd(error, res)
    }   
}