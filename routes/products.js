const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

router.get('/', productController.home);
router.get('/search', productController.search);
router.get('/product/:id', productController.show);

module.exports = router;
