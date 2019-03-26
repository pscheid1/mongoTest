const express = require('express');
const scheduleRouter = express.Router();

// Require the controllers
const schedule_controller = require('../controllers/schedule.controller');

// scheduleRouter.get('/', schedule_controller.index);
// scheduleRouter.get('/test', schedule_controller.test);
scheduleRouter.get('/create', schedule_controller.create);
scheduleRouter.get('/find', schedule_controller.findOne);
scheduleRouter.get('/list', schedule_controller.findAll);
scheduleRouter.get('/update', schedule_controller.update);
scheduleRouter.get('/delete', schedule_controller.delete);
// scheduleRouter.get('/createIndexes', schedule_controller.createIndexes);

/* 
scheduleRouter
    .route('/:id')
    .get(schedule_controller.findOne)
    .put(schedule_controller.update)
    .delete(schedule_controller.delete);
 */

module.exports = scheduleRouter;
