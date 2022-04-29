const { register, login, changePassword, forgotPassword, profile, updateAvatar, updateInfo, verify } = require('../controllers/user');
const router = require('express').Router();
const { auth } = require('../middlewares/auth');
const { upload } = require("../utils/uploadImg");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { validatePassword } = require("../utils/validate");
const { User } = require('../models');

router.post('/', register);
router.get('/verify/:token', verify);
router.get('/profile', auth, profile);
router.post('/login', login);
router.post('/change-password', auth, changePassword);
router.post('/forgot-password', forgotPassword);
router.patch('/:userId/update-avatar', auth, upload.single('avatar'), updateAvatar);
router.put('/:userId/update-info', auth, updateInfo);

const resetPassword = (app) => {

    app.get('/users/:email/:token/reset-password', async(req, res) => {
        const { token, email } = req.params;
        jwt.verify(token, process.env.JWT_SECRET, (error, decoded) => {
            if (error) return res.status(400).send('Invalid token provided');
        });
        const result = await User.findOne({ where: { email, rs: token } });
        if (!result) return res.send(`<h1>This email is expired. Please use the latest email</h1>`)
        res.render('forgot', { token, email });
    });

    app.post('/users/resetpassword', async(req, res) => {
        const { password, email } = req.body;
        if (!validatePassword(password)) {
            return res.send({ status: 400, message: 'Password minimum six characters, at least one letter, one number and one special character' })
        }
        let result = await User.findOne({ where: { email } });
        if (!result) return res.send({ status: 404, message: 'User not found' })
        try {
            const hash = await bcrypt.hash(password, 10);
            result.set({ password: hash, rs: null });
            await result.save()
            res.send({ status: 200, message: 'Password reset' })
        } catch (error) {
            res.send({ status: 400, message: error })
        }
    })
}

module.exports = { router, resetPassword };