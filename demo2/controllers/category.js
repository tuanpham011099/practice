const { Category, Product, sequelize, productImg } = require('../models');
const { uploadImg } = require('../utils/uploadImg');
const { missingData } = require('../utils/validate');

exports.create = async(req, res) => {
    const { name, description } = req.body;
    if (!name || !description)
        return res.status(400).json({ msg: 'Data missing', errors: missingData('name', 'description') });

    const ctgFind = await Category.findOne({ where: { name } });
    if (ctgFind) return res.status(400).json({ msg: 'Category already exists' });
    if (!req.file) return res.status(400).json({ msg: 'No image uploaded' });
    let img;
    try {
        img = await uploadImg(req.file.path);
    } catch (error) {
        return res.status(400).json(error);
    }
    try {
        const result = await Category.create({ name, description, thumbnail: img });
        res.status(201).json({ msg: `Category ${name} Added`, result });
    } catch (error) {
        res.status(400).json(error);
    }
};

exports.listAllCtg = (req, res) => {
    const name = req.query.name || 'DESC';
    const product = req.query.product || 'ASC';
    Category.findAll({
            attributes: [
                'id',
                'name',
                'thumbnail',
                'description', [sequelize.fn('SUM', sequelize.col('Products.amount')), 'totalProducts'],
            ],
            include: [{
                model: Product,
                as: 'products',
                through: {
                    attributes: []
                },
                attributes: []
            }],
            group: ['Category.id'],
            order: [
                ['name', name],
                [sequelize.col('totalProducts'), product]
            ],
        }).then(results => res.status(200).json(results))
        .catch(error => res.status(400).json(error))
};

exports.ctgDetail = async(req, res) => {
    const { ctgId } = req.params;
    try {
        const result = await Category.findOne({
            where: { id: ctgId },
            attributes: ['id', 'name', 'thumbnail', 'description'],
            include: [{
                model: Product,
                as: 'products',
                through: { attributes: [] },
                attributes: ['id', 'name', 'description', 'price', 'amount'],
                include: [{ model: productImg, as: 'images', attributes: ['href', 'is_default'] }]
            }]
        });
        res.status(200).json(result)
    } catch (error) {
        res.status(400).json(error)
    }
}

exports.updateCtg = async(req, res) => {
    const { id } = req.params;
    const { name, description } = req.body;
    if (!name || !description)
        return res.status(400).json({ msg: 'Data missing', errors: missingData('name', 'description') });
    if (!req.file) return res.status(400).json({ msg: 'No image uploaded' });
    let img;
    try {
        img = await uploadImg(req.file.path);
    } catch (error) {
        return res.status(400).json(error);
    }
    try {
        await Category.update({ name, description, thumbnail: img }, { where: { id } });
        res.status(200).json({ msg: `Category ${name} Updated` });
    } catch (error) {
        res.status(400).json(error);
    }
};

exports.deleteCtg = async(req, res) => {
    const { id } = req.params;
    try {
        const result = await Category.findByPk(id, {
            include: [{
                model: Product,
                as: 'products',
                through: {
                    attributes: []
                }
            }]
        });
        if (!result) return res.status(404).json({ msg: 'Category not found' });
        if (result.products.length > 0) return res.status(400).json({ msg: 'Category has products' });
        await result.destroy();
    } catch (error) {
        console.log(error);
    }
};