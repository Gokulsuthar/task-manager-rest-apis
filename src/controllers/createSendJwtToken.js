const jwtTokens = require('./signJwtToken')
const {JWT_COOKIE_EXPIRES_IN, NODE_ENV} = require('../config/config')

const createSendToken = (user, statusCode, res) => {
    const accessToken = jwtTokens.createAccessToken(user._id)
    const refreshToken = jwtTokens.createRefreshToken(user._id)



    res.status (statusCode).json({
        status: 'success',
        accessToken,
        data: {
            user
        }
    })
}

module.exports = createSendToken