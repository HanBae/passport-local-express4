const nodemailer = require('nodemailer');
const emailconfig = require('../config/email-config');


const transporter = nodemailer.createTransport(emailconfig());
const transporter1 = nodemailer.createTransport({
    service: 'naver',
    auth: {
        user: 'alstn224@naver.com',
        pass: '1995star%'
    }

});


module.exports = function (from, to, subject, text) {


    console.log(to + ' dfdf');
    const mailOpt = {
        from: 'alstn224@naver.com',
        to: to,
        subject: subject,
        text: text
    };


    transporter.sendMail(mailOpt, (err, res) => {
        if (err) {
            console.log('mail-error' + err);
            // cb(err);
        } else {
            console.log('mail-success');
            // cb(null, res);
        }
        transporter.close();
    });

};