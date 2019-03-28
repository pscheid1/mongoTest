const express = require('express');
const facilityRouter = express.Router();

// Require the controllers
const facility_controller = require('../controllers/facility.controller');

// facilityRouter.get('/', facility_controller.index);
// facilityRouter.get('/test', facility_controller.test);
// facilityRouter.get('/create', facility_controller.create);
// facilityRouter.get('/find', facility_controller.findOne);
// facilityRouter.get('/list', facility_controller.findAll);
// facilityRouter.get('/update', facility_controller.update);
// facilityRouter.get('/delete', facility_controller.delete);
// facilityRouter.get('/createIndexes', facility_controller.createIndexes);

 
facilityRouter
    // .route('/:id')
    facilityRouter.get('/find', facility_controller.findOne)
    facilityRouter.get('/list', facility_controller.findAll)
    facilityRouter.get('/create', facility_controller.create)
    // .put(facility_controller.update)
    facilityRouter.get('/delete', facility_controller.delete)
    .get('/test', facility_controller.test);
 

module.exports = facilityRouter;
