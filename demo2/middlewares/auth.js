const jwt = require("jsonwebtoken");
const { User } = require("../models");
const { ROLE_ADMIN, ROLE_USER } = require('../utils/keyword');

const auth = async(req, res, next) => {
    const headers = req.headers['authorization'];
    const token = headers && headers.split(' ')[1];
    if (!token) return res.status(401).json({ msg: "Not allow" });
    jwt.verify(token, process.env.JWT_SECRET, async(error, decoded) => {
        if (error) return res.status(403).json({ error });
        req.client = decoded;
        const user = await User.findOne({ where: { id: decoded.id, is_active: 1 } });
        if (!user) return res.status(404).json({ msg: 'User not found or not active yet!' })
        next();
    });

};
const isAdmin = (req, res, next) => {
    if (!req.client.role === ROLE_USER) return res.status(403).json({ msg: "Not allow" });
    next();
}

const isExpired = (token) => {
    jwt.verify(token, process.env.JWT_SECRET, (error, decoded) => {
        if (error || !decoded) return false;
        return decoded
    })
}


module.exports = { auth, isAdmin, isExpired }