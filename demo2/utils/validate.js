const Joi = require("joi");
const moment = require('moment');
const { DAY_FORMAT } = require('./keyword');

/**
 * 
 * @param  {...any} theArgs string[]
 * @returns array of missing properties
 */
exports.missingData = (...theArgs) => {
    let a = {};
    theArgs.forEach(element => {
        a[element] = 'required';
    });
    return a;
};


exports.validatePassword = (password) => {
    return password.match(
        /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{6,}$/
    );
};
exports.formatDay = (day) => {
    return moment(day, DAY_FORMAT).utc(true).toDate();
};

exports.userSchema = Joi.object({
    email: Joi.string()
        .email()
        .required(),
    fullname: Joi.string()
        .required()
        .min(3),
    password: Joi.string()
        .required()
        .min(6),
    address: Joi.string()
        .required(),
    birthday: Joi.date()
        .required(),
    gender: Joi.boolean()
        .required()
});