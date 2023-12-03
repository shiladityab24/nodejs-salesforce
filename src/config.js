require('dotenv').config()
module.exports={
    PORT:process.env.PORT || 5000,
    SF_LOGIN_URL:process.env.SF_LOGIN_URL || 'https://login.salesforce.com',
    SERVER_URL:process.env.SERVER_URL || 'http://localhost:5000',
    SF_USERNAME:process.env.SF_USERNAME ||'username',
    SF_PASSWORD:process.env.SF_PASSWORD || 'password'
}