const router = require('express').Router();
const { createProduct, deleteProduct, listAllProduct, updateProduct, productDetails, pickDefaultImg } = require('../controllers/product');
const { auth, isAdmin } = require('../middlewares/auth');

router.get('/', listAllProduct);
router.get('/:productId', productDetails);
router.patch('/:productId/img/:imgId', pickDefaultImg);
router.post('/', auth, createProduct);
router.put('/:productId', auth, updateProduct);
router.delete('/:productId', auth, deleteProduct);

module.exports = router;