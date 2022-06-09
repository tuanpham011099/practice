const { Product, Category, categoryProduct, productImg, cartProduct, productInOrder, sequelize } = require('../models');
const { missingData } = require('../utils/validate');
const { uploadImg } = require('../utils/uploadImg');
const { Op } = require('sequelize');


exports.listAllProduct = (req, res) => {

    const name = req.query.name || 'ASC';
    const priceSort = req.query.price || 'ASC';
    const categoryName = req.query.category || '';
    const q = req.query.q || '';
    let page = 1;
    if (q) {
        page = 1;
    } else {
        page = req.query.page;
    }
    const limit = 5;

    Product.findAndCountAll({
        where: {
            name: {
                [Op.substring]: q
            }
        },
        include: [{
            model: Category,
            as: 'categories',
            attributes: ['id', 'name'],
            where: {
                name: {
                    [Op.substring]: categoryName
                }
            },
            through: {
                attributes: []
            },
        }, { model: productImg, as: 'images', attributes: ['href', 'is_default'] }],
        order: [
            ['price', priceSort],
            ['name', name]
        ],
        offset: (page - 1) * limit,
        limit,
        distinct: true
    }).then(result => res.status(200).json(result))
        .catch(error => res.status(400).json(error));
};

exports.productDetails = async (req, res) => {
    const { productId } = req.params;

    try {
        const result = await Product.findByPk(productId, {
            attributes: ['id', 'name', 'description', 'price', 'amount'],
            include: [{
                model: productImg,
                as: 'images',
                attributes: ['id', 'href', 'is_default']
            }, {
                model: Category,
                as: 'categories',
                through: {
                    attributes: []
                },
                attributes: ['id', 'name', 'thumbnail', 'description']
            }]
        });

        if (!result) return res.status(404).json({ msg: 'Product not found' });

        res.status(200).json(result);

    } catch (error) {
        res.status(400).json(error);
    }
};

exports.createProduct = async (req, res) => {
    const t = await sequelize.transaction();
    const { name, description, price, amount, category } = req.body;

    if (!name || !description || !price || !amount || !category)
        return res.status(400).json({
            msg: 'Data missing', error: {
                ...missingData('name', 'description', 'price', 'amount'),
                category: 'must be an array'
            }
        });

    if (price < 0 || amount < 1)
        return res.status(400).json({ msg: 'Price and Amount must be more than 0' });

    try {
        const promises = [];

        const existProduct = await Product.findOne({ where: { name } });

        if (existProduct) return res.status(400).json({ msg: 'Product already exist' });

        const result = await Product.create({ name, description, price, amount }, { transaction: t });

        await category.forEach(item => {
            const p = new Promise((resolve, reject) => {
                categoryProduct.create({ productId: result.id, categoryId: item }, { transaction: t })
                    .then(() => resolve('done'))
                    .catch(error => reject(error));
            });
            promises.push(p);
        });

        await Promise.all(promises);

        if (req.files) {
            for (file of req.files) {
                let href = await uploadImg(file.path);
                await productImg.create({ href, productId: result.id }, { transaction: t });
            }
        }

        await t.commit();
    } catch (error) {
        t.rollback();
        return res.status(400).json(error);
    }

    res.status(201).json({ msg: `Product ${name} Added` });
};

exports.updateProduct = async (req, res) => {
    const t = await sequelize.transaction();
    const promises = [];
    const { productId } = req.params;
    const { name, description, price, amount, category } = req.body;

    if (!name || !description || !price || !amount || !category)
        return res.status(400).json({
            msg: 'Data missing',
            error: {
                ...missingData('name', 'description', 'price', 'amount'),
                category: 'must be an array'
            }
        });

    try {
        const result = await Product.findByPk(productId);
        if (!result) return res.status(404).json({ msg: 'Product not found' });
        result.set({ name, description, price, amount });

        await category.forEach(item => {

            let ctgProduct = categoryProduct.findOne({ where: { productId: result.id, categoryId: item } });

            if (!ctgProduct) {
                const p = new Promise((resolve, reject) => {
                    categoryProduct.create({ productId: result.id, categoryId: item }, { transaction: t })
                        .then(() => resolve('done'))
                        .catch(error => reject(error));
                });
                promises.push(p);
            }
        });

        await Promise.all(promises);
        await result.save();
    } catch (error) {
        res.status(400).json(error);
    }
};

exports.pickDefaultImg = async (req, res) => {

    const { productId, imgId } = req.params;

    try {
        let result = await productImg.findAll({ where: { productId } });

        await result.map(item => {
            if (item.id == imgId)
                item.set({ is_default: 1 });
            else item.set({ is_default: 0 });
            item.save();
        });

        res.status(200).json({ msg: 'Thumnail updated' });
    } catch (error) {
        console.log(error);
    }
};

exports.deleteProduct = async (req, res) => {

    const t = await sequelize.transaction();
    const { productId } = req.params;

    if (!productId) return missingData('productId');

    try {
        const result = await Product.findByPk(productId);

        if (!result) return res.status(404).json({ msg: 'product not found' });

        const order = await productInOrder.findOne({ where: { productId } });

        if (order) return res.status(400).json({ msg: 'Someone bought this product, can\'t deleted' });

        await result.destroy({ transaction: t });
        await cartProduct.destroy({ where: { productId } }, { transaction: t });
        await categoryProduct.destroy({ where: { productId } }, { transaction: t });
        await t.commit();

        res.status(200).json({ msg: `Product deleted` });
    } catch (error) {

        await t.rollback();

        console.log(error);
    }

};