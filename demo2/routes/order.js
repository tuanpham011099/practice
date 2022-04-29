const { listAllOrder, changeOrderStatus, createOrder, orderDetail, listUserOrder } = require('../controllers/order');
const router = require('express').Router();
const { auth } = require("../middlewares/auth");

router.get('/', auth, listAllOrder);
router.get('/:orderId', auth, orderDetail);
router.get('/user/:userId', auth, listUserOrder);
router.post('/:orderId', auth, changeOrderStatus);
router.post('/:cartId/checkout', auth, createOrder);

module.exports = router;