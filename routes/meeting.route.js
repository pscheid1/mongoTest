const express = require('express');
const meetingRouter = express.Router();

// Require the controllers
const meeting_controller = require('../controllers/meeting.controller');

meetingRouter
    .get('/find', meeting_controller.findOne)
    .get('/list', meeting_controller.findAll)
    .get('/create', meeting_controller.create)
    .get('/update', meeting_controller.update)
    .get('/delete', meeting_controller.delete)
    .get('/test', meeting_controller.test);

module.exports = meetingRouter;
