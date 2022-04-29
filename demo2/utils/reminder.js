const { remindCart } = require('./sendMail');
const { Cart, Product, User, cartProduct } = require('../models');

module.exports = async() => {
    let cartItems = await Cart.findAll({
        include: [{ model: User, as: 'user', attributes: ['email', 'fullName'] }, {
            model: cartProduct,
            as: 'products',
            attributes: ['quantity', 'cartId', 'id'],
            include: [{ model: Product, as: 'details', attributes: ['id', 'name', 'description', 'amount', 'price'] }]
        }]
    });
    cartItems.map(item => {
        remindCart(item.user.fullName, item.user.email, item.products)
    })
}