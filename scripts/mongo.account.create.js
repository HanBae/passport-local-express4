const mongoose = require('mongoose');
const passport = require('passport');
require('../config/passport')(passport);

const Account = require('../app/models/account');
const config = require('../config');

const admin = {
    'username': 'region@election.com',
    'password': 'asdf1234'
};

const mongoAccountCreate = (addresses) => {
    let contractAddress = addresses;
    if (addresses === undefined) {
        contractAddress = require('../config/contract-address.json');
    }

    mongoose.connect(config.db, {useNewUrlParser: true})
        .then(() => console.log("mongoDB connected."))
        .catch(err => console.error(err.message));

    const updateUserDeploy = async (user) => {
        user.etherAccount = contractAddress['test_region_address'];
        user.deployedElections = [{
            address: contractAddress['test_region_contract'],
            finite: false
        }];
        return await user.save((err) => {
            if (err) return console.error(err.message);
            console.info("대전 지방선거 MongoDB 설정 완료");
            mongoose.connection.close();
        })
    };

// DB 변경
    Account.findOne({
        'username': admin.username
    }, async (err, result) => {
        if (err) {
            return console.error(err.message);
        }
        if (result === null) {
            Account.register(new Account(
                {
                    username: admin.username,
                    etherAccount: contractAddress['test_region_address']
                }), admin.password, (err, account) => {
                if (err) {
                    return console.error(err.message);
                }
                //passport.authenticate('local');
                Account.findOne({
                    'username': admin.username
                }, async (err, result) => {
                    if (err) {
                        return console.error(err.message);
                    }
                    return updateUserDeploy(result);
                });
            });
        } else {
            return updateUserDeploy(result);
        }
    });
};

module.exports = mongoAccountCreate;