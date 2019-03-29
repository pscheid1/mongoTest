const express = require('express');
const facilityRouter = express.Router();

// Require the controllers
const facility_controller = require('../controllers/facility.controller');

facilityRouter
    .get('/find', facility_controller.findOne)
    .get('/list', facility_controller.findAll)
    .get('/create', facility_controller.create)
    .get('/update', facility_controller.update)
    .get('/delete', facility_controller.delete)
    .get('/test', facility_controller.test);

module.exports = facilityRouter;
