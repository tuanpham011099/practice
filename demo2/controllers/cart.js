const { Cart, Product, cartProduct, productImg } = require("../models");

exports.addToCart = async (req, res) => {
    const userId = req.client.id;
    const { quantity } = req.body;
    const { productId } = req.params;
    try {
        const result = await Product.findByPk(productId);
        if (!result) return res.status(404).json({ msg: 'Product not found' });
        if (quantity > result.amount) {
            return res.send({ status: 400, message: 'Product quantity exceed' });
        }
        let cartItem = await Cart.findOne({ where: { userId } });
        if (!cartItem) {
            cartItem = await Cart.create({ userId });
        }
        let productInCart = await cartProduct.findOne({ where: { productId, cartId: cartItem.id } });
        if (productInCart) {
            productInCart.set({ quantity });
            await productInCart.save();
            res.status(200).json({ msg: 'Product quantity updated' });
        } else {
            await cartProduct.create({ cartId: cartItem.id, productId, quantity });
            res.status(201).json({ msg: 'Add to cart successful' });
        }
    } catch (error) {
        res.status(400).json(error);
    }
};

exports.listItemInCart = async (req, res) => {
    let cartItems = await Cart.findOne({
        where: { userId: req.client.id },
        include: [{
            model: cartProduct,
            as: 'products',
            attributes: ['quantity', 'cartId', 'id'],
            include: [{
                model: Product,
                as: 'details',
                attributes: ['id', 'name', 'description', 'amount', 'price'],
                include: [{ model: productImg, as: 'images' }]
            }]
        }]
    });
    if (cartItems) {
        const products = cartItems.products.map(product => {
            return {
                productId: product.details.id,
                name: product.details.name,
                description: product.details.description,
                price: product.details.price,
                quantity: product.quantity,
                totalPrice: product.quantity * product.details.price,
                images: product.details.images
            };
        });
        res.status(200).json({ cartId: cartItems.id, products });
    } else {
        res.status(400).json({ msg: "No item in cart" });
    }
};

exports.removeItemFromCart = async (req, res) => {
    const userId = req.client.id;
    const { productId, cartId } = req.params;
    try {
        const result = await Cart.findOne({ where: { userId, id: cartId } });
        if (!result) return res.status(404).json({ msg: 'Invalid Cart for current user' });
        const productInCart = await cartProduct.findOne({ where: { cartId, productId } });
        if (!productInCart) return res.status(404).json({ msg: 'product not found' });
        await productInCart.destroy();
        res.status(200).json({ msg: 'Product was removed from cart' });
    } catch (error) {
        res.status(400).json(error);
    }
};