const jsforce = require('jsforce')
const LocalStorage = require('node-localstorage').LocalStorage
const lcStorage = new LocalStorage('./info')
const {SF_LOGIN_URL, SF_CLIENT_ID, SF_CLIENT_SECRET, SF_CALLBACK_URL} = require('../config')
//Initialize OAuth2 Config
const oauth2 = new jsforce.OAuth2({
    loginUrl:SF_LOGIN_URL,
    clientId : SF_CLIENT_ID,
    clientSecret : SF_CLIENT_SECRET,
    redirectUri : SF_CALLBACK_URL
})

//Function to perform Salesforce login
const login = (req, res)=>{
    res.redirect(oauth2.getAuthorizationUrl({ scope : 'full' }));
}

//Callback function to get Salesforce Auth token
const callback = (req, res)=>{
    const {code} = req.query
    if(!code){
        console.log("Failed to get authorization code from server callback")
        return res.status(500).send("Failed to get authorization code from server callback")
    }
    console.log("code", code)
    // res.status(200).send({"success": true,"code":code})
    const conn = new jsforce.Connection({oauth2:oauth2})
    conn.authorize(code, function(err){
        if(err){
            console.error(err);
            return res.status(500).send(err)
        }
        console.log("Access token", conn.accessToken)
        console.log("refresh token", conn.refreshToken)
        console.log("Instance url", conn.instanceUrl)
        lcStorage.setItem('accessToken', conn.accessToken || '')
        lcStorage.setItem('instanceUrl', conn.instanceUrl || '')
        res.status(200).send({"success": true,"message":"Authorization code fetched successfully","code":code,"Access token":conn.accessToken,"refresh token": conn.refreshToken,"Instance url": conn.instanceUrl})
    })
}

// Function to Create Connection
const createConnection = () =>{
    let instanceUrl = lcStorage.getItem('instanceUrl')
    let accessToken = lcStorage.getItem('accessToken')
    if(!accessToken){
        return res.status(200).send({})
    }
    return new jsforce.Connection({
        accessToken,
        instanceUrl
    })
}

const leadCreation = (req,res) => {
	const conn = createConnection(res)
	const {leadData} = req.body
	conn.apex.post("/leadApi/", { leadData }, function (err, result) {
      		if (err) {
        		res.status(500).json({ error: err.message });
      		} else {
        		res.json({ success: true, message: 'Record Created Successfully', result });
      		}
      	})
}

const loginUser = (req,res) => {
	const conn = createConnection(res)
    const {userData} = req.body
	conn.apex.post("/loginuserApi/",{ userData },function(err,result){
		if(err){
			res.status(500).json({ error: err.message });
		}else{
			res.json(result);
		}
	})
}

const dashboardDetails = (req, res)=>{
    const conn = createConnection(res)
    const username = req.params.username;
    conn.apex.get(`/checkUserDashboard/checkGetCustomersByDealerUserName?username=${username}`,function(err,result){
		if (err) {
          		res.status(500).json({ error: err.message });
        	} else {
          		res.json(result);
        	}
     })
}

const checkETB = (req,res) => {
    const conn = createConnection(res)
    const pan = req.params.pan;
    conn.apex.get(`/checkETBApi/checkETBByPan?Pan=${pan}`,function(err,result){
		if(err){
			res.status(500).json({ error: err.message });
		} else {
			res.json(result);
		}
	})
}

const loanApplication = (req,res) =>{
	const conn = createConnection(res)
        const {requestWrapper} = req.body
	conn.apex.post("/checkLoanApplicationApi/", {requestWrapper}, function (err, result) {
      		if (err) {
        		res.status(500).json({ error: err.message });
      		} else {
        		res.json(result);
      		}
      	})
}


module.exports={
    login, 
    callback,
    leadCreation,
    loginUser,
    dashboardDetails,
    checkETB,
    loanApplication
}