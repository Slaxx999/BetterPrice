const express = require('express');
const router = express.Router();
const alertController = require('../controllers/alertController');
const authMiddleware = require('../middlewares/authMiddleware');

router.use(authMiddleware);

router.get('/', alertController.index);
router.post('/', alertController.create);
router.post('/:id/delete', alertController.destroy);

module.exports = router;
