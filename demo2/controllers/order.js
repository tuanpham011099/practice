const { Order, User, Product, Cart, productInOrder, cartProduct, productImg, sequelize } = require("../models");
const { PENDING_PAYMENT } = require('../utils/keyword');
const { formatDay } = require('../utils/validate');
const { checkoutReminder } = require('../utils/sendMail');

exports.listAllOrder = async (req, res) => {
    const orderby = req.query.orderby || 'ASC';
    const quantity = req.query.quantity || 'ASC';
    const page = req.query.page || 1;
    const limit = 10;
    try {
        const orders = await Order.findAll({
            include: [{
                model: User, as: 'user',
                attributes: ['id', 'email', 'fullName', 'address', 'phone']
            }, {
                model: productInOrder,
                as: 'products',
                attributes: ['quantity', 'total', 'price'],
                include: [{
                    model: Product,
                    as: 'details',
                    attributes: ['id', 'name', 'description', 'price']
                }]
            }],
            order: [
                ['createdAt', orderby],
                ['products', 'quantity', quantity]
            ],
            limit,
            offset: (page - 1) * limit
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
            };
        });

        return res.status(200).json(orders);
    } catch (error) {
        console.log(error);
    }
};

exports.listUserOrder = async (req, res) => {
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
            };
        });
        return res.status(200).json(result);
    } catch (error) {
        console.log(error);
    }


};

exports.changeOrderStatus = async (req, res) => {
    const { orderId } = req.params;
    const payment = req.query.payment || 'pending';
    const userId = req.client.id;

    try {
        const order = await Order.findOne({ userId, id: orderId });
        if (!order)
            return res.status(404).json({ msg: 'Order not found' });

        order.set({ status: payment, completedDay: formatDay(new Date()) });

        await order.save();

        res.status(200).json({ msg: 'Order updated' });
    } catch (error) {
        res.status(400).json(error);
    }
};

exports.createOrder = async (req, res) => {
    const userId = req.client.id;
    const payment = req.query.payment || 'cash';
    const { cartId } = req.params;
    const t = await sequelize.transaction();

    let items = await Cart.findOne({
        where: { userId, id: cartId },
        include: [{
            model: cartProduct,
            as: 'products',
            attributes: ['quantity', 'cartId', 'id'],
            include: [{
                model: Product,
                as: 'details',
                attributes: ['id', 'name', 'description', 'amount', 'price']
            }]
        },
        { model: User, as: 'user' }
        ]
    });

    let orders = [];

    try {
        if (items.products) {
            let temp = new Date();
            let completedDay = null;

            if (payment === 'visa') {
                completedDay = formatDay(temp);
            }
            const order = await Order.create({ userId, status: PENDING_PAYMENT, completedDay, payment }, { transaction: t });

            const promises = [];
            items.products.forEach(product => {
                if (product.quantity > product.details.amount) {
                    t.rollback();
                    return res.send({ message: 'Product quantity exceed', status: 400 });
                }
                let obj = {};
                const p = new Promise((resolve, reject) => {
                    obj['orderId'] = order.id;
                    obj['quantity'] = product.quantity;
                    obj['total'] = product.quantity * product.details.price;
                    obj['productId'] = product.details.id;
                    obj['productName'] = product.details.name;
                    obj['completedDay'] = completedDay;
                    obj['payment'] = payment;
                    obj['price'] = product.details.price;

                    orders.push(obj);
                    Product.findOne({ where: { id: product.details.id } })
                        .then(result => {
                            result.set({ amount: result.amount - product.quantity });
                            result.save()
                                .then(() => {
                                    console.log('updated');
                                });
                        });
                    productInOrder.create(obj, { transaction: t })
                        .then(() => cartProduct.destroy({ where: { productId: product.details.id } }, { transaction: t }))
                        .then(() => resolve("done"))
                        .catch(error => reject(error));
                });

                promises.push(p);

            });
            await Promise.all(promises);

            await t.commit();
            await checkoutReminder(items.user.email, orders);
            return res.status(200).json(orders);
        } else {
            return res.status(400).json({ msg: 'No product in cart' });
        }
    } catch (error) {
        await t.rollback();
        return res.send({ status: 400, message: error });
    }

};

exports.orderDetail = async (req, res) => {
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
            };
        });

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
        res.send({ status: 400, message: error });
    }
};