const { Order, User, Product, Cart, productInOrder, cartProduct, productImg } = require("../models");
const { PENDING_PAYMENT } = require('../utils/keyword');
const { formatDay } = require('../utils/validate')
const { checkoutReminder } = require('../utils/sendMail')

exports.listAllOrder = async(req, res) => {
    const orderby = req.query.orderby || 'ASC'
    const quantity = req.query.quantity || 'ASC'
    try {
        const orders = await Order.findAll({
            include: [{ model: User, as: 'user', attributes: ['id', 'email', 'fullName', 'address', 'phone'] }, {
                model: productInOrder,
                as: 'products',
                attributes: ['quantity', 'total'],
                include: [{ model: Product, as: 'details', attributes: ['id', 'description', 'price'] }]
            }],
            order: [
                ['createdAt', orderby],
                ['products', 'quantity', quantity]
            ]
        });
        // change result into another json format
        const result = orders.map(order => {
            return {
                userId: order.user.id,
                email: order.user.email,
                fullName: order.user.fullName,
                address: order.user.address,
                phone: order.user.phone,
                orders: {
                    orderId: order.id,
                    status: order.status,
                    payment: order.payment,
                    completedDay: order.completedDay,
                    orderDay: order.createdAt,
                    products: order.products
                }
            }
        })
        return res.status(200).json(result);
    } catch (error) {
        console.log(error);
    }
};

exports.listUserOrder = async(req, res) => {
    const { userId } = req.params;
    const date = req.query.date || 'ASC';

    try {
        const orders = await Order.findAll({
            where: { userId },
            include: [{
                model: User,
                as: 'user',
                attributes: ['id', 'email', 'fullName', 'address', 'phone']
            }, {
                model: productInOrder,
                as: 'products',
                attributes: ['quantity', 'total'],
                include: [{ model: Product, as: 'details', attributes: ['id', 'description', 'price'] }]
            }],
            order: [
                ['createdAt', date]
            ]
        });
        // change result into another json format
        const result = orders.map(order => {
            return {
                userId: order.user.id,
                email: order.user.email,
                fullName: order.user.fullName,
                address: order.user.address,
                phone: order.user.phone,
                orders: {
                    orderId: order.id,
                    status: order.status,
                    payment: order.payment,
                    completedDay: order.completedDay,
                    orderDay: order.createdAt,
                    products: order.products
                }
            }
        })
        return res.status(200).json(result);
    } catch (error) {
        console.log(error);
    }


}

exports.changeOrderStatus = async(req, res) => {
    const { orderId } = req.params;
    const payment = req.query.payment || 'pending';
    const userId = req.client.id;
    try {
        const order = await Order.findOne({ userId, id: orderId });
        if (!order) return res.status(404).json({ msg: 'Order not found' })
        order.set({ status: payment, completedDay: formatDay(new Date()) })
        await order.save();
        res.status(200).json({ msg: 'Order updated' });
    } catch (error) {
        res.status(400).json(error)
    }
};

exports.createOrder = async(req, res) => {
    const userId = req.client.id;
    const payment = req.query.payment || 'cash'
    const { cartId } = req.params;
    let items = await Cart.findOne({
        where: { userId, id: cartId },
        include: [{
            model: cartProduct,
            as: 'products',
            attributes: ['quantity', 'cartId', 'id'],
            include: [{ model: Product, as: 'details', attributes: ['id', 'name', 'description', 'amount', 'price'] }]
        }, { model: User, as: 'user' }]
    });
    let orders = []
    try {
        if (items.products) {
            let temp = new Date();
            let completedDay = null;
            if (payment === 'visa') {
                completedDay = formatDay(temp);
            }
            const order = await Order.create({ userId, status: PENDING_PAYMENT, completedDay, payment });

            await items.products.forEach(product => {
                // put infomation into an temporary object
                let obj = {};
                obj['orderId'] = order.id;
                obj['quantity'] = product.quantity;
                obj['total'] = product.quantity * product.details.price;
                obj['productId'] = product.details.id;
                obj['productName'] = product.details.name;
                obj['completedDay'] = completedDay;
                obj['payment'] = payment;
                // create new record with given object
                productInOrder.create(obj);
                orders.push(obj);
            });
            await checkoutReminder(items.user.email, orders);
        } else
            return res.status(400).json({ msg: 'No product in cart' })
    } catch (error) {
        res.send({ status: 400, message: error })
    }
    res.status(200).json({ msg: 'Done', orders });
};

exports.orderDetail = async(req, res) => {
    const { orderId } = req.params;
    const userId = req.client.id;

    try {
        const order = await Order.findOne({
            where: { id: orderId, userId },
            include: [{ model: User, as: 'user', attributes: ['id', 'email', 'fullName', 'address', 'phone'] }, {
                model: productInOrder,
                as: 'products',
                attributes: ['quantity', 'total'],
                include: [{
                    model: Product,
                    as: 'details',
                    attributes: ['id', 'description', 'name', 'price'],
                    include: [{
                        model: productImg,
                        as: 'images',
                        where: { is_default: 1 }
                    }]
                }]
            }]
        });
        let totalPrice = 0;
        const products = order.products.map(product => {
            totalPrice += product.total;
            return {
                id: product.details.id,
                name: product.details.name,
                description: product.details.description,
                price: product.details.price,
                quantity: product.quantity,
                total: product.total,
                images: product.details.images
            }
        })
        return res.status(200).json({
            orderId: order.id,
            status: order.status,
            payment: order.payment,
            completedDay: order.completedDay,
            orderDay: order.createdAt,
            totalPrice,
            products
        });
    } catch (error) {
        console.log(error);
    }
}