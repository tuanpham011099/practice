const nodemailer = require('nodemailer');
require('dotenv').config();
const { formatDay } = require('./validate');

let transport = nodemailer.createTransport({
    host: "smtp.gmail.com",
    service: "gmail",
    auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD
    }
});

async function verifyMail(to, token) {
    await transport.sendMail({
        from: "demo project <35phamvantuan35@gmail.com>",
        to,
        subject: "Verify account",
        text: "Dear customer",
        html: `<h2><a href='http://localhost:5000/users/verify/${token}'>click here to verify account</a></h2>`
    })
}

async function checkoutReminder(to, html) {
    const style = 'border:1px solid #bbbbbb;'
    let temp = html.map(item => `
        <tr><td style="border:1px solid #bbbbbb;">${item.orderId}</td>
        <td style='border:1px solid #bbbbbb;'>${item.quantity}</td>
        <td style='border:1px solid #bbbbbb;'>${item.total}</td>
        <td style='border:1px solid #bbbbbb;'>${item.productName}</td>
        <td style='border:1px solid #bbbbbb;'>${item.completedDay?item.completedDay:'Not yet'}</td>
        <td style='border:1px solid #bbbbbb;'>${item.payment}</td>
        </tr>
    `)
    temp = temp.toString().split(',').join('');
    await transport.sendMail({
        from: "demo project <35phamvantuan35@gmail.com>",
        to,
        subject: "Order completed",
        text: `Dear customer, this is your order ${html}`,
        html: `<table style="width:100%;border:1px solid #bbbbbb;">
                        <tr>
                            <th style="border:1px solid #bbbbbb;">Order ID</th>
                            <th style="border:1px solid #bbbbbb;">Quantity</th>
                            <th style="border:1px solid #bbbbbb;">Price</th>
                            <th style="border:1px solid #bbbbbb;">Product name</th>
                            <th style="border:1px solid #bbbbbb;">Completed</th>
                            <th style="border:1px solid #bbbbbb;">Payment method</th>
                        </tr>
                        ${temp}
                        </table>
                        `
    })
}

async function forgotPassword(to, token) {
    await transport.sendMail({
        from: "demo project <35phamvantuan35@gmail.com>",
        to,
        subject: "forgot password",
        text: "Dear customer",
        html: `<h2><a href='http://localhost:5000/users/${to}/${token}/reset-password'>click here to reset password</a></h2>`
    })
}

async function remindCart(username, to, products) {
    let temp = products.map(product =>
        `<tr>
        <td style="border:1px solid #bbbbbb;">${product.details.name}</td>
        <td style="border:1px solid #bbbbbb;">${product.quantity}</td>
        <td style="border:1px solid #bbbbbb;">${product.details.price}</td>
        </tr>`
    );
    temp = temp.toString().split(',').join('');
    await transport.sendMail({
        from: 'Practice shop',
        to,
        subject: 'Remind of products in cart',
        text: `Dear ${username}, you have some product in your cart`,
        html: `<table style="width:100%;border:1px solid #bbbbbb;">
                        <tr>
                            <th style="border:1px solid #bbbbbb;">Product name</th>
                            <th style="border:1px solid #bbbbbb;">Quantity</th>
                            <th style="border:1px solid #bbbbbb;">Price</th>
                        </tr>
                        ${temp}
                        </table>`
    })
}

module.exports = { verifyMail, checkoutReminder, forgotPassword, remindCart };