const express = require('express')
const authController = require('../controllers/authController')
const taskController = require('../controllers/taskController')
const router = new express.Router()

// read incompleted tasks
// router.get('/incompletedTasks' ,auth.protect, auth.restrictTo('user', 'admin'), taskController.incompletedTasks)

// read completed tasks
// router.get('/completedTasks' ,auth.protect, auth.restrictTo('user', 'admin'), taskController.completedTasks)

// read deleted tasks
// router.get('/deletedTasks' ,auth.protect, auth.restrictTo('user', 'admin'), taskController.deletedTasks)
router.use(authController.protect);

// create task
router.post('/newTask', taskController.createTask)

// read all tasks
router.get('/readAllTasks', taskController.readAllTasks)

// read task by id
router.get('/:readTaskById', taskController.readTaskById)

// update task by id
router.patch('/:updateTaskById', taskController.updateTaskById)

// delete task by id
router.delete('/:deleteTaskById', taskController.deleteTaskById)

module.exports = router