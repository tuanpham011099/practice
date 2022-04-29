const { addToCart, listItemInCart, removeItemFromCart } = require('../controllers/cart');
const router = require('express').Router();
const { auth } = require('../middlewares/auth');

router.get('/', auth, listItemInCart);
router.post('/add/:productId', auth, addToCart);
router.delete('/:cartId/product/:productId', auth, removeItemFromCart)

module.exports = router;