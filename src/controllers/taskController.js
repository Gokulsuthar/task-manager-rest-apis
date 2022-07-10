const Task = require('../models/taskModel')
const catchAsync = require('../controllers/catchasync')
const AppError = require('../controllers/appError')

exports.createTask = catchAsync (async (req, res, next) => {
    const task = await Task({...req.body, owner: req.user.id, ownerName: req.user.name})

    await task.save()

    res.status(200).json({
        status: 'success',
        data: {
          task
        }
    });
})

exports.readAllTasks = catchAsync (async(req, res, next) => {
    const queryObj = {...req.query}
    let excludedFields = ['page', 'limit', 'fields', 'sort']
    excludedFields = excludedFields.forEach(el => delete queryObj[el])

    let query = Task.find({...queryObj, owner: req.user.id})

    if(req.query.sort) {
        const sortBy = req.query.sort.split(',').join(' ')
        query = query.sort(sortBy)
    } else {
        query = query.sort('-createdAt')
    }

    if(req.query.fields) {
        const fieldsBy = req.query.fields.split(',').join(' ')
        query = query.select(fieldsBy)
    } else {
        query = query.select('-__v')
    }

    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit

    query = query.skip(skip).limit(limit)
    
    const tasks = await query

    // let querylen = query.skip(skip)
    // querylen = await query.length

    // console.log(querylen)

    // const totalPages = Math.ceil(tasks.length / limit)

    res.status(200).json({
        status: 'success',
        result: tasks.length,
        page,
        data: {
            tasks
        }
    });
})

exports.updateTaskById = catchAsync (async (req, res, next) => {
    const task = await Task.findOne({active: {$ne: false}, owner: req.user.id, _id: req.params.updateTaskById})

    // console.log(task)

    if(!task) {
        return next( new AppError('not found', 404))
    } 

    if(!req.body) return next( new AppError('please send a proper updates!', 404))

    const updates = Object.keys(req.body)
    const allowedUpdates = ["description", "completed"]
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if(!isValidOperation) {
        return next( new AppError('Invalid operation', 403))
    }

    updates.forEach((update) => task[update] = req.body[update])
    await task.save()

    res.status(200).json({status: 'success', task})
})

exports.readTaskById = catchAsync (async (req, res, next) => {
    const task = await Task.findOne({active: {$ne: false}, owner: req.user.id, _id: req.params.readTaskById})

    if(!task) {
        next( new AppError('not found', 404))
    }
    
    res.status(200).json({status: 'success', task})
})

exports.deleteTaskById = catchAsync ( async (req, res, next) => {
    const task = await Task.findByIdAndUpdate({active: {$ne: false}, owner: req.user.id, _id: req.params.deleteTaskById}, {active: false})

    if(!task) {
        next( new AppError('not found', 404))
    }

    res.status(200).json({status: 'success', task})
})

// exports.incompletedTasks = catchAsync( async (req, res, next) => {
//     const tasks = await Task.find({active: {$ne: false}, owner: req.user.id, completed: false})

//     res.send({
//         status: 'success', 
//         result: tasks.length,
//         tasks:  tasks.length == 0 ? 0 : tasks
//     })
// })

// exports.completedTasks = catchAsync( async (req, res, next) => {
//     const tasks = await Task.find({active: {$ne: false}, owner: req.user.id, completed: true})

//     res.send({
//         status: 'success', 
//         result: tasks.length,
//         tasks:  tasks.length == 0 ? 0 : tasks
//     })
// })

// exports.deletedTasks = catchAsync( async (req, res, next) => {
//     const tasks = await Task.find({active: {$ne: true}, owner: req.user.id})
    
//     res.send({
//         status: 'success', 
//         result: tasks.length,
//         tasks:  tasks.length == 0 ? 0 : tasks
//     })
// })