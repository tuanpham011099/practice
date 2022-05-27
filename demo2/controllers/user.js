const bcrypt = require('bcryptjs');
const { User } = require('../models');
const { uploadImg } = require('../utils/uploadImg');
const { missingData, validatePassword } = require('../utils/validate');
const rs = require('randomstring');
const { verifyMail, forgotPassword } = require('../utils/sendMail');
const jwt = require('jsonwebtoken');
const { formatDay } = require("../utils/validate");
const { Op } = require('sequelize');


exports.register = async (req, res) => {
    const { email, fullname, password, address } = req.body;

    if (!email || !fullname || !password || !address)
        return res.send({ status: 400, message: 'Data missing' });

    if (!validatePassword(password))
        return res.send({ status: 400, message: 'Password minimum six characters, at least one letter, one number and one special character' });

    const result = await User.findOne({ where: { email } });
    if (result)
        return res.send({ status: 402, message: 'User exist' });

    const validateToken = rs.generate(23);
    const hash = await bcrypt.hash(password, 10);

    try {
        await User.create({ email, fullName: fullname, password: hash, address, rs: validateToken });
    } catch (error) {
        console.log(error);
    }

    verifyMail(email, validateToken);

    res.send({ status: 200, message: `User ${email} created, go to mail to active` });
};

exports.verify = async (req, res) => {
    const { token } = req.params;

    const result = await User.findOne({ where: { rs: token } });

    if (!result) return res.status(404).json({ msg: 'User not found' });

    result.set({ rs: null, is_active: 1 });

    try {
        await result.save();
    } catch (error) {
        return res.status(400).json(error);
    }
    return res.status(200).json({ msg: `User ${result.email} verified` });
};

exports.login = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password)
        return res.status(400).json({
            msg: 'Data missing',
            error: missingData('email', 'password')
        });

    const result = await User.findOne({ where: { email } });

    if (!result)
        return res.status(404).json({ msg: 'User not found' });

    if (result.is_ban == true)
        return res.status(400).json({ msg: 'User blocked' });

    const cp = await bcrypt.compare(password, result.password);

    if (!cp) return res.status(400).json({ msg: "Wrong password" });

    const token = jwt.sign({
        id: result.id,
        role: result.role
    },
        process.env.JWT_SECRET, {
        expiresIn: '24h'
    });

    res.status(200).json({
        id: result.id,
        email: result.email,
        name: result.fullName,
        address: result.address,
        avatar: result.avatar,
        phone: result.phone,
        birthday: result.birthDay,
        gender: result.gender,
        role: result.role,
        token
    });
};

exports.profile = async (req, res) => {
    const userId = req.client.id;

    const result = await User.findByPk(userId);
    if (!result) return res.status(404).json({ msg: 'User not found' });

    return res.status(200).json({
        id: result.id,
        email: result.email,
        name: result.fullName,
        address: result.address,
        avatar: result.avatar,
        phone: result.phone,
        birthday: result.birthDay,
        role: result.role,
    });
};

exports.updateInfo = async (req, res) => {
    const { userId } = req.params;

    const { address, gender, fullname, phone, birthday, email } = req.body;

    if (!address || typeof gender === 'undefined' || !fullname || !phone || !birthday || !email)
        return res.status(400).json({ msg: 'Data missing', errors: missingData('address', 'gender', 'fullname', 'phone', 'birthday', 'email') });

    const result = await User.findOne({
        where: {
            id: userId,
            is_active: 1
        }
    });

    const emailInUse = await User.findOne({ where: { email, [Op.not]: [{ id: userId }] } });

    if (emailInUse)
        return res.status(400).json({ msg: 'Email already in use' });
    if (!result)
        return req.status(404).json({ msg: 'User not found' });

    const day = formatDay(birthday);

    result.set({ address, gender, fullName: fullname, phone, birthDay: day, email });

    try {
        await result.save();
    } catch (error) {
        return res.status(400).json(error);
    }
    return res.status(200).json({ msg: `User ${result.email} updated` });
};

exports.updateAvatar = async (req, res) => {
    const { userId } = req.params;

    if (!req.file)
        return res.status(400).json({ msg: 'No avatar provided' });

    const result = await User.findByPk(userId);

    if (!result)
        return res.status(404).json({ msg: 'User not found' });

    const img = await uploadImg(req.file.path);

    result.set({ avatar: img });

    try {
        await result.save();
    } catch (error) {
        return res.status(400).json(error);
    }
    return res.status(200).json({ msg: `User ${result.email} updated` });
};

exports.changePassword = async (req, res) => {
    const userId = req.client.id;

    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword)
        return res.send({ status: 400, message: missingData('oldPassword', 'newPassword') });

    if (oldPassword === newPassword)
        return res.send({ status: 400, message: "what's the point of changing password?" });

    if (!validatePassword(newPassword))
        return res.send({ status: 400, message: 'Password minimum six characters, at least one letter, one number and one special character' });

    const result = await User.findByPk(userId);
    if (!result)
        return res.status(404).json({ msg: 'User not found' });

    const cp = await bcrypt.compare(oldPassword, result.password);

    if (!cp)
        return res.send({ status: 400, message: 'Current password wrong' });

    const hash = await bcrypt.hash(newPassword, 10);

    result.set({ password: hash });

    try {
        await result.save();
    } catch (error) {
        return res.status(400).json(error);
    }
    return res.send({ status: 200, message: `User ${result.email} updated` });
};

exports.forgotPassword = async (req, res) => {
    const { email } = req.body;
    try {
        const result = await User.findOne({ where: { email, is_active: 1 } });

        if (!result)
            return res.send({ status: 404, message: 'User not found or not active yet' });

        const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '24h' });

        result.set({ rs: token });

        await result.save();

        await forgotPassword(email, token);

        res.send({ status: 200, message: 'An email sent to you, please check the mail to reset password' });
    } catch (error) {
        res.send({ status: 400, message: error });

    }
};