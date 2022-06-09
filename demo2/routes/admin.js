const router = require('express').Router();
const { listAllUser, banUser, deleteUser, userDetail } = require('../controllers/admin');


const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const { User, Category, Product, productImg, categoryProduct, cartProduct, productInOrder, sequelize, Order } = require('../models');
const { ROLE_ADMIN, COMPLETED_PAYMENT, PENDING_PAYMENT } = require('../utils/keyword');
const { formatDay, validatePassword } = require('../utils/validate');
const { upload, uploadImg } = require('../utils/uploadImg');
const bcrypt = require('bcryptjs');

router.get('/', listAllUser);
router.get('/:userId', userDetail);
router.delete('/:userId/block', banUser);
router.post('/:userId/delete', deleteUser);


passport.serializeUser(function (user, done) {
    done(null, user.id);
});

passport.deserializeUser(function (id, done) {
    User.findByPk(id, { where: { role: ROLE_ADMIN } }).then(user => {
        done(null, user);
    }).catch(err => {
        console.log(err);
    });
});

passport.use(new LocalStrategy({ usernameField: 'email' },
    async function (email, password, done) {
        const result = await User.findOne({ where: { email, role: ROLE_ADMIN } });
        if (!result) {
            return done(null, false, { message: 'Incorrect email.' });
        }
        if (!await bcrypt.compare(password, result.password)) {
            return done(null, false, { message: 'Incorrect password.' });
        }
        return done(null, result);
    }
));



const Admin = (app) => {
    app.get('/admin', async (req, res) => {
        if (!req.isAuthenticated()) {
            res.redirect('/admin/login');
        } else {

            const categories = await Category.findAll({
                attributes: [
                    'id',
                    'name',
                    'thumbnail',
                    'description'
                ]
            });
            res.render('home', { user: req.user, categories: categories });
        }
    });

    app.get('/admin/login', (req, res) => {
        res.render('login');
    });

    app.post('/admin/login', passport.authenticate('local'), (req, res) => {
        res.redirect('/admin');
    });

    app.get('/admin/logout', (req, res) => {
        req.logOut();
        res.redirect('/admin/login');
    });

    app.get('/admin/products', async (req, res) => {
        if (!req.isAuthenticated())
            return res.redirect('/admin/login');
        let page = req.query.page > 0 ? req.query.page : 1;
        const limit = 8;
        console.log(page);
        const categories = await Category.findAll({
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
            group: ['Category.id']
        });
        Product.findAndCountAll({
            include: [{
                model: Category,
                as: 'categories',
                attributes: ['id', 'name'],
                through: {
                    attributes: []
                },
            }, {
                model: productImg,
                as: 'images',
                attributes: ['href', 'is_default']
            }],
            limit,
            offset: (page - 1) * limit
        }).then(result => {
            res.render('product', { products: result.rows, user: req.user, categories: categories, count: result.count, page });
        })
            .catch(error => console.log(error));

    });

    app.get('/admin/categories/:categoryId', async (req, res) => {
        if (!req.isAuthenticated()) return res.redirect('/admin/login');
        let id = req.params.categoryId;
        let categories = await Category.findAll({
            attributes: ['id', 'name', 'thumbnail', 'description'],
            include: [{
                model: Product,
                as: 'products',
                through: { attributes: [] },
                attributes: ['id', 'name', 'description', 'price', 'amount'],
                include: [{ model: productImg, as: 'images', attributes: ['href', 'is_default'] }]
            }]
        });
        let category = categories.filter(t => t.id == id);
        res.render('category', { user: req.user, category: category[0], categories });


    });

    app.get('/admin/orders', async (req, res) => {
        if (!req.isAuthenticated()) return res.redirect('/admin/login');
        try {
            const categories = await Category.findAll({
                attributes: [
                    'id',
                    'name',
                    'thumbnail',
                    'description'
                ]
            });
            const orders = await Order.findAll({
                include: [{ model: User, as: 'user', attributes: ['id', 'email', 'fullName', 'address', 'phone'] }, {
                    model: productInOrder,
                    as: 'products',
                    attributes: ['quantity', 'total', 'price'],
                    include: [{ model: Product, as: 'details', attributes: ['id', 'description', 'price', 'name'] }]
                }]
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
            return res.render('order', { user: req.user, orders: result, categories });
        } catch (error) {
            console.log(error);
        }
    });

    app.patch('/admin/order/:orderId', async (req, res) => {
        const { orderId } = req.params;
        const { status } = req.body;
        const result = await Order.findByPk(orderId);
        if (status == PENDING_PAYMENT) {
            result.set({ status: COMPLETED_PAYMENT });
            result.set({ completedDay: formatDay(new Date()) });
        } else {
            return res.send({ message: 'Order is completed!', status: 400 });
        }
        try {
            await result.save();
            res.send({ message: 'Updated!', status: 200 });
        } catch (error) {
            res.send({ message: error, status: 400 });
        }
    });

    app.get('/admin/users', async (req, res) => {
        if (!req.isAuthenticated()) return res.redirect('/admin/login');
        const categories = await Category.findAll({
            attributes: [
                'id',
                'name',
                'thumbnail'
            ]
        });
        await User.findAll({ attributes: { exclude: ['password', 'createdAt', 'updatedAt', 'rs'] } })
            .then(result => res.render('user.ejs', { users: result, user: req.user, categories }))
            .catch(error => res.status(400).json(error));
    });

    app.post('/admin/block/:id', async (req, res) => {
        const { id } = req.params;
        try {
            const result = await User.findByPk(id);
            if (!result) return res.status(404).json({ msg: 'user not found' });
            result.set({ is_ban: !result.is_ban });
            await result.save();
            res.status(200).json({ msg: 'updated' });
        } catch (error) {
            res.send(error);
        }
    });

    app.delete('/admin/delete/:id', async (req, res) => {
        const { id } = req.params;
        try {
            const result = await User.findByPk(id, { where: { is_active: false } });
            if (!result) return res.send('User not found or activated');
            await result.destroy();
        } catch (error) {
            res.send(error);
        }
    });

    app.get('/admin/edit/:productId', async (req, res) => {
        if (!req.isAuthenticated()) return res.redirect('/admin/login');
        const { productId } = req.params;

        try {
            const categories = await Category.findAll({
                attributes: [
                    'id',
                    'name',
                    'thumbnail',
                    'description'
                ]
            });
            const result = await Product.findByPk(productId, {
                include: [{ model: productImg, as: 'images' }]
            });
            if (!result) return res.status(404).send('No product with this Id');
            res.render('editProduct', { product: result, categories, user: req.user });
        } catch (error) {
            res.status(400).send(error);
        }
    });

    app.put('/admin/products/:id', async (req, res) => {
        const { id } = req.params;
        const { name, price, description, amount } = req.body;
        if (!name || !price || !description || !amount) res.send({ status: 400, message: 'Missing data' });
        const product = await Product.findByPk(id);
        if (!product) res.send({ status: 404, message: 'Product not found' });
        try {
            product.set({ name, price, description, amount });
            await product.save();
            res.send({ status: 200, message: 'Product updated' });
        } catch (error) {
            res.send({ status: 400, message: error });
        }
    });

    app.post('/admin/product/:productId', upload.array('images'), async (req, res) => {
        const { productId } = req.params;
        if (!req.files) return res.send({ status: 400, message: 'No file provided' });
        try {
            for (let file of req.files) {
                let x = await uploadImg(file.path);
                await productImg.create({ productId, href: x });
            }
            res.send({ status: 200, message: 'Imgs Uploaded' });
        } catch (error) {
            res.send({ status: 400, message: error });
        }
    });

    app.delete('/admin/product/:productId/:imgId', async (req, res) => {
        const { productId, imgId: id } = req.params;
        const result = await productImg.findOne({ where: { productId, id } });
        try {
            await result.destroy();
            res.send({ status: 200, message: 'Image delete' });
        } catch (error) {
            res.send({ status: 400, message: error });
        }
    });

    app.patch('/admin/products/:productId/images/:imgId', async (req, res) => {
        const { productId, imgId: id } = req.params;
        try {
            const result = await productImg.findAll({ where: { productId } });
            if (!result) return res.status(404).send('Y"re funny :)');
            await result.forEach(item => {
                if (item.id == id) {
                    item.set({ is_default: 1 });
                } else
                    item.set({ is_default: 0 });
                item.save();
            });
            res.status(200).json({ msg: 'updated' });
        } catch (error) {
            console.log(error);
        }
    });

    app.get('/admin/profile', async (req, res) => {
        if (!req.isAuthenticated()) return res.redirect('/admin/login');
        const categories = await Category.findAll({
            attributes: [
                'id',
                'name',
                'thumbnail',
                'description'
            ]
        });
        res.render('editProfile', { user: req.user, categories });
    });

    app.post('/admin/avatar', upload.single('avatar'), async (req, res) => {
        const { id } = req.user;
        try {
            let avatar = await uploadImg(req.file.path);
            if (!avatar) return res.send({ status: 400, message: 'Upload avatar error' });
            const user = await User.findByPk(id);
            user.set({ avatar });
            await user.save();
            res.send({ status: 200, message: 'Upload avatar success' });
        } catch (error) {
            res.send({ status: 400, message: 'Upload avatar error' });
        }
    });

    app.put('/admin/updateInfo', async (req, res) => {
        const { fullName, address, phone, birthDay } = req.body;
        const { id } = req.user;
        if (!fullName || !address || !phone || !birthDay) return res.send({ status: 400, message: 'Invalid data' });
        try {
            const user = await User.findByPk(id);
            user.set({ fullName, address, phone, birthDay: formatDay(birthDay) });
            await user.save();
            res.send({ status: 200, message: 'Update success' });
        } catch (error) {
            res.send({ status: 400, message: 'Updatef fail' });
        }
    });

    app.patch('/admin/changePassword', async (req, res) => {
        const { curr_pass, new_pass } = req.body;
        if (!curr_pass || !new_pass) return res.send({ status: 400, message: 'Missing data' });
        try {

            const user = await User.findByPk(req.user.id);
            let compare = await bcrypt.compare(curr_pass, user.password);
            if (!compare) return res.send({ status: 400, message: 'Wrong password' });
            if (!validatePassword(new_pass)) return res.send({ status: 400, message: 'Password minimum six characters, at least one letter, one number and one special character' });
            let hash = await bcrypt.hash(new_pass, 10);
            user.set({ password: hash });
            await user.save();
            res.send({ status: 200, message: 'Password changed' });
        } catch (error) {
            res.send({ status: 400, mesage: error });
        }
    });

    app.delete('/admin/product/:productId', async (req, res) => {
        const t = await sequelize.transaction();
        const { productId } = req.params;
        try {
            const result = await Product.findByPk(productId);
            if (!result)
                return res.status(404).json({ msg: 'product not found' });
            await categoryProduct.destroy({ where: { productId } }, { transaction: t });

            const order = await productInOrder.findOne({ where: { productId } });
            if (order) {
                await t.rollback();
                return res.send({ status: 400, message: 'Someone bought this product, cant deleted' });
            }

            await cartProduct.destroy({ where: { productId } }, { transaction: t });
            await result.destroy({ transaction: t });
            await t.commit();
            res.send({ status: 200, message: 'Product deleted' });
        } catch (error) {
            t.rollback();
            res.send({ status: 400, message: error });
        }
    });

    app.get('/admin/addCategory', async (req, res) => {
        if (!req.isAuthenticated()) {
            res.redirect('/admin/login');
        } else {

            const categories = await Category.findAll({
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
                group: ['Category.id']
            });
            res.render('addCtg', { user: req.user, categories: categories });
        }
    });

    app.post('/admin/addCategory', upload.single('thumbnail'), async (req, res) => {
        const { name, description } = req.body;
        if (!name || !description) return res.send({ status: 400, message: 'Missing data' });
        const result = await Category.findOne({ where: { name } });
        console.log(result);
        if (result) return res.send({ status: 400, message: 'Category already exist' });
        const thumbnail = await uploadImg(req.file.path);
        try {
            await Category.create({ name, description, thumbnail });
            res.send({ status: 200, message: 'Category created' });
        } catch (error) {
            res.send({ status: 400, message: error });
        }
    });

    app.delete('/admin/deleteCategory/:id', async (req, res) => {
        const t = await sequelize.transaction();
        const { id } = req.params;
        try {
            const category = await Category.findByPk(id);
            if (!category) return res.send({ status: 404, message: 'Category not found' });
            // const ctgProduct = await categoryProduct.findAll({ where: { categoryId: id } });
            await categoryProduct.destroy({ where: { categoryId: id } }, { transaction: t });
            await t.commit();
            res.send({ status: 200, message: 'Category delete' });
        } catch (error) {
            t.rollback();
            res.send({ status: 400, message: error });
        }
    });

    app.get('/admin/addProduct', async (req, res) => {
        if (!req.isAuthenticated()) {
            res.redirect('/admin/login');
        } else {

            const categories = await Category.findAll({
                attributes: [
                    'id',
                    'name',
                    'thumbnail',
                    'description'
                ]
            });
            const products = await Product.findAll({ include: [{ model: productImg, as: 'images' }] });
            res.render('addProduct', { user: req.user, categories, products });
        }
    });

    app.post('/admin/addProduct', upload.array('images'), async (req, res) => {
        const { name, description, price, amount, categories } = req.body;
        if (!name || !description || !price || !amount || !categories) return res.send({ status: 400, message: 'Missing data' });
        try {
            let newProduct = await Product.create({ name, description, price, amount });
            await categories.split(',').map(category => {
                categoryProduct.create({ categoryId: category, productId: newProduct.id });
            });
            for (let img of req.files) {
                let x = await uploadImg(img.path);
                productImg.create({ productId: newProduct.id, href: x });
            }

            res.send({ status: 200, message: 'Product created' });
        } catch (error) {
            res.send({ status: 400, message: error });
        }
    });

    app.get('/admin/category/:id', async (rq, rs) => {
        if (!rq.isAuthenticated()) return rs.redirect('/admin/login');
        try {
            const categories = await Category.findAll();
            let category = categories.filter(t => t.id == rq.params.id);
            rs.render('editCategory', { category: category[0], categories, user: rq.user });
        } catch (error) {
            console.log(error);
        }
    });

    app.patch('/admin/category/:id', async (req, res) => {
        const { name, description } = req.body;
        if (!name || !description) return res.send({ status: 400, message: 'Missing data' });
        try {
            const result = await Category.findByPk(req.params.id);
            if (!result) return res.send({ status: 404, message: 'Product not found' });
            result.set({ name, description });
            await result.save();
            res.send({ status: 200, message: 'Category update' });
        } catch (error) {
            res.send({ status: 400, message: error });
        }
    });


    app.patch('/admin/category/:id/changeImg', upload.single('thumbnail'), async (req, res) => {
        try {
            const result = await Category.findByPk(req.params.id);
            if (!req.file) return res.send({ status: 400, message: 'Provide Image' });
            let thumbnail = await uploadImg(req.file.path);
            result.set({ thumbnail });
            await result.save();
            res.send({ status: 200, message: 'Thumbnail changed' });
        } catch (error) {
            res.send({ status: 400, message: error });
        }
    });
};

module.exports = { Admin, router };