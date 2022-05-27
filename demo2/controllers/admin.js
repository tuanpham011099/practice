const { User } = require('../models');
const { Op } = require('sequelize');
const { ROLE_USER } = require("../utils/keyword");


exports.listAllUser = async(req, res) => {
    await User.findAll({ attributes: { exclude: ['password', 'createdAt', 'updatedAt', 'rs'] } })
        .then(result => res.status(200).json(result))
        .catch(error => res.status(400).json(error))
};


exports.userDetail = async(req, res) => {
    const { userId } = req.params;
    const result = await User.findOne({ where: { id: userId }, attributes: { exclude: ['rs', 'password'] } })
    if (!result) return res.status(404).json({ msg: 'User not found' });
    res.status(200).json(result);
};

exports.banUser = async(req, res) => {
    const { userId } = req.params;
    const result = await User.findOne({
        where: {
            [Op.and]: [
                { id: userId },
                { is_active: true },
                { role: ROLE_USER }
            ]
        }
    });
    if (!result) return res.status(404).json({ msg: "Account is Admin or not active yet" })
    result.set({ is_ban: true });
    try {
        await result.save();
    } catch (error) {
        return res.status(400).json(error)
    }
    res.status(200).json({ msg: `User ${result.email} was banned` });
};

exports.deleteUser = async(req, res) => {
    const { userId } = req.params;
    const result = await User.findOne({ where: { id: userId, role: ROLE_USER, isActive: false } });
    if (!result) return res.status(404).json({ msg: 'User not found' });
    try {
        await result.destroy();
    } catch (error) {
        return res.status(400).json(error)
    }
    res.status(200).json({ msg: 'User deleted' });
}