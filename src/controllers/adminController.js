const User = require('../models/userModel')
const Task = require('../models/taskModel')
const catchAsync = require('./catchasync')
const AppError = require('./appError')

exports.loginAdmin = catchAsync (async (req, res, next) => {

    if(!req.body.email) {
        if(!req.body.email) {
            return next( new AppError('email must be provided', 403))
        }
    }

    if(!req.body.password) {
        if(!req.body.password) {
            return next( new AppError('password must be provided', 403))
        } 
    }

    const admin = await User.findAdminByCredentials(req.body.email, req.body.password)
    const token = await admin.generateAuthToken()
    res.cookie('jwt', token, {
        httpOnly: false
    })
    res.status(200).send({
        statu: 'success',
        statusCode: 200,
        data: {
            admin,
            token
        }
    })
})

exports.logoutAdmin = catchAsync (async (req, res, next) => {
    req.admin.tokens = req.admin.tokens.filter((token) => {
        return token.token !== req.token
    })
    await req.admin.save()
    res.status(200).json({
        status: 'success',
        data: {
            user: req.admin
        }
    })
})

exports.createAdmin = catchAsync (async (req, res, next) => {
    const admin = await new User(req.body)

    if(!req.body.name || typeof req.body.name !== 'string' || req.body.name.length >= 16 ) {
        if(!req.body.name) {
            return next( new AppError('name must be provided', 403))
        } 
        
        if(typeof req.body.name !== 'string') {
            return next( new AppError('name must be a type of string', 403))
        }

        if( req.body.name.length >= 16) {
            return next( new AppError('name is too long it must be less than or equal too 16 characters', 403))
        }
    }

    if(!req.body.username || typeof req.body.username !== 'string' || req.body.username.length >= 16 || await User.findOne({username: req.body.username})) {
        if(!req.body.name) {
            return next( new AppError('username must be provided', 403))
        } 
        
        if(typeof req.body.name !== 'string') {
            return next( new AppError('username must be a type of string', 403))
        }

        if( req.body.name.length >= 16) {
            return next( new AppError('username is too long it must be less than or equal too 10 characters', 403))
        }

        if(User.findOne({username: req.body.username})) {
            return next( new AppError('username is already taken', 403))
        }
    }

    if(!req.body.email || await User.findOne({email: req.body.email})) {
        if(!req.body.email) {
            return next( new AppError('email must be provided', 403))
        } 

        if(User.findOne({email: req.body.email})) {
            return next( new AppError('email is already in use please provide a another email', 403))
        }
    }

    if(!req.body.password || req.body.password.length <= 8) {
        if(!req.body.password) {
            return next( new AppError('password must be provided', 403))
        } 

        if( req.body.password.length <= 9) {
            return next( new AppError('password is too short it must be less than or equal too 8 characters', 403))
        }
    }

    if(!req.body.role || req.body.role != 'admin') {
        if(!req.body.role) {
            return next( new AppError('role must be provided', 403))
        }

        if(req.body.role != 'admin') {
            return next( new AppError('role must be admin', 403))
        }
    }

    await admin.save()
    res.status(201).json({
        status: 'success',
        statusCode: 201,
        data: {
            admin
        }
    })
})

// route for read authenticated user
exports.readAdmin = catchAsync (async (req, res, next) => {
    const admin = await User.findById({_id: req.admin.id})
    res.status(200).json({
        status: 'success',
        statusCode: 200,
        data: {
            admin
        }
    })
})

exports.updateAdmin = catchAsync (async (req, res, next) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'username', 'email', 'password']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if(!isValidOperation) {
        return next( new AppError('invalid operation'))
    }

    updates.forEach((update) => req.admin[update] = req.body[update])
    await req.admin.save()
    res.status(200).json({
        stutus: 'success',
        statusCode: 200,
        data: {
            user: req.admin
        }
    })
})

exports.deleteAdmin = catchAsync (async (req, res, next) => {
    await User.findByIdAndDelete({_id: req.admin.id})

    res.status(200).json({
        status: 'success',
        statusCode: 200,
        data: {
            user: req.admin
        }
    })
})


// admin powers
exports.readAllUsers = catchAsync (async (req, res, next) => {
    const users = await User.find({role: 'user'})

    res.status(200).json({
        status: 'success',
        statusCode: 200,
        data: {
            users
        }
    })
})

exports.readUserById = catchAsync (async (req, res, next) => {
    const user = await User.find({role: 'user', _id: req.params.userId})

    res.status(200).json({
        status: 'success',
        statusCode: 200,
        data: {
            user
        }
    })
})

exports.updateUserById = catchAsync (async (req, res, next) => {
    const user = await User.findById({role: 'user', _id: req.params.userId})

    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'username', 'email', 'password']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if(!isValidOperation) {
        return next( new AppError('invalid operation'))
    }

    updates.forEach((update) => user[update] = req.body[update])
    await user.save()

    res.status(200).json({
        stutus: 'success',
        statusCode: 200,
        data: {
            user
        }
    })

    res.status(200).json({
        status: 'success',
        statusCode: 200,
        data: {
            user
        }
    })
})

exports.deleteUserById = catchAsync (async (req, res, next) => {
    const user = await User.findByIdAndDelete({role: 'user', _id: req.params.userId})

    res.status(200).json({
        status: 'success',
        statusCode: 200,
        data: {
            user
        }
    })
})

//avatars CRUD
exports.readUserAvatarById =  catchAsync (async (req, res, next) => {
    const user = await User.findById({role: 'user', _id: req.params.userId})

    if(user.avatar == undefined) {
        return next(new AppError('avatar not found', 404))
    }
    res.set('Content-Type', 'image/png')
    res.status(200).send(req.user.avatar)
})
exports.updateUserAvatarById = catchAsync (async (req, res, next) => {

    const user = await User.findById({role: 'user', _id: req.params.userId})

    if(user.avatar != undefined) {
        req.user.avatar = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer()
        await user.save()
    
        res.status(200).json({
            status: 'success',
            statusCode: 200,
            data: {
                message: 'avatar updated'
            }
        })
    } else {
        next( new AppError('avatar not found', 404))
    }
})

exports.deleteUserAvatarById = catchAsync (async (req, res, next) => {
    const user = await User.findById({role: 'user', _id: req.params.userId})

    user.avatar = undefined
    await req.user.save()
    res.status(200).json({
        status: 'success',
        statusCode: 200,
        data: {
            avatar: 'avatar deleted'
        }
    }) 
})

exports.setUserAvatarById =  catchAsync (async (req, res, next) => {
    const user = await User.findById({role: 'user', _id: req.params.userId})

    const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer()
    req.user.avatar = buffer
    await req.user.save()
    res.status(200).json({
        status: 'success',
        statusCode: 200,
        data: {
            message: 'avatar added'
        }
    })  
})

//tasks
exports.readUserTasks = catchAsync (async (req, res, next) => {
    const user = await User.find({role: 'user', _id: req.params.userId})
    const tasks = await Task.find({owner: req.params.userId})

    res.status(200).json({
        status: 'success',
        statusCode: 200,
        data: {
            user,
            tasks
        }
    }) 
})

exports.createUserTask = catchAsync (async (req, res, next) => {
    const user = await User.find({role: 'user', _id: req.params.userId})

    const task = await Task.create({...req.body, owner: req.params.userId})

    res.status(200).json({
        status: 'success',
        statusCode: 200,
        data: {
            user,
            task
        }
    }) 
})

exports.updateUserTasks = catchAsync (async (req, res, next) => {

    const user = await User.find({role: 'user', _id: req.params.userId})

    const task = await Task.findOne({owner: req.params.userId, _id: req.params.taskId})

    const updates = Object.keys(req.body)
    const allowedUpdates = ['description', 'completed']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if(!isValidOperation) {
        return next( new AppError('invalid operation'))
    }

    updates.forEach((update) => task[update] = req.body[update])
    await task.save()
    res.status(200).json({
        stutus: 'success',
        statusCode: 200,
        data: {
            user,
            task
        }
    })
})

exports.deleteUserTasks = catchAsync (async (req, res, next) => {
    const user = await User.find({role: 'user', _id: req.params.userId})

    const task = await Task.findByIdAndDelete({owner: user._id, _id: req.params.taskId})

    res.status(200).json({
        status: 'success',
        statusCode: 200,
        data: {
            user,
            task: "deleted"
        }
    })
})