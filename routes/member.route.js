const express = require('express');
const memberRouter = express.Router();

// Require the controllers
const member_controller = require('../controllers/member.controller');

memberRouter.get('/', member_controller.index);
memberRouter.get('/test', member_controller.test);
memberRouter.get('/create', member_controller.create);
memberRouter.get('/find', member_controller.find);
memberRouter.get('/list', member_controller.list);
memberRouter.get('/update', member_controller.update);
memberRouter.get('/delete', member_controller.delete);
module.exports = memberRouter;
