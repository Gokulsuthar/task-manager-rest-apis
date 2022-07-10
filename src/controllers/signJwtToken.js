const jwt = require('jsonwebtoken')
const {ACCESS_TOKEN_SECRET, ACCESS_TOKEN_EXPIRED, REFRESH_TOKEN_SECRET, REFRESH_TOKEN_EXPIRED} = require('../config/config')

exports.createAccessToken = (id) => {
    const accessToken = jwt.sign({ _id: id.toString()}, ACCESS_TOKEN_SECRET, {expiresIn: ACCESS_TOKEN_EXPIRED})

    return accessToken
}

exports.createResfreshToken = (id) => {
    const refreshToken = jwt.sign({ _id: id.toString()}, REFRESH_TOKEN_SECRET, {expiresIn: REFRESH_TOKEN_EXPIRED})

    return refreshToken
}