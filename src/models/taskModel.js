const mongoose = require('mongoose')

const taskSchema = new mongoose.Schema({
    description: {
        type: String,
        unique: true,
        required: true,
    },
    completed: {
        type: Boolean,
        default: false
    },
    owner: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User'
    },
    active: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
})

taskSchema.methods.toJSON = function() {
    const user = this
    const userObject = user.toObject()

    // delete userObject.createdAt
    delete userObject.updatedAt
    // delete userObject.__v

    return userObject
}

taskSchema.virtual('remainingTimeToComplete').get(function() {
    let remainingTimeToComplete = new Date() - this.expectedTimeToComplete
    remainingTimeToComplete.toTimeString()
    console.log(remainingTimeToComplete)
    return remainingTimeToComplete
})

const Task = mongoose.model('Task', taskSchema)

module.exports = Task