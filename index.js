const express = require('express');
const jsforce = require('jsforce');
const bodyParser = require('body-parser');
const app = express();
// const { PORT, SERVER_URL, SF_LOGIN_URL, SF_PASSWORD, SF_USERNAME } = require('./src/config');
// Create a test API to check if the server is running
app.get('/test', (req, res) => {
  res.json({ "success": true, "message": "server is running" });
});

// Connection route
app.get('/connection', (req, res) => {
  const conn = new jsforce.Connection({
    loginUrl: 'https://login.salesforce.com',
  });
  
const username = 'shiladitya_bose@persistent.com.tvsorg';
const password = 'Admin@12345gojyqyIRiIg38DkmGm17L5OXU'; // password + security token

conn.login(username, password, function (err, userInfo) {
  if (err) {
    return console.error(err);
  }
  
  // Now you can get the access token and instance URL information.
  // Save them to establish a connection next time.
  console.log(conn.accessToken);
  console.log(conn.instanceUrl);
  // logged-in user property
  console.log("User ID: " + userInfo.id);
  console.log("Org ID: " + userInfo.organizationId);
  
  // Response after successful connection
  res.json({ "success": true, "message": "Connected to Salesforce" });
  // Routes accessible only after successful connection
  // Get all records
  app.get('/api/leads', (req, res) => {
    conn.query("select Id,FirstName,LastName,MobilePhone,Pan_Number__c, Aadhaar_Number__c, Email, Company, Loan_Type__c from Lead", (err, result) => {
      if (err) {
        res.send(err);
      } else {
        console.log('total records' + result.totalSize);
        res.json(result.records);
      }
    });
  });
  
  // Create a new record
  app.post('/api/leads/create', (req, res) => {
    // const { firstName, lastName, mobile, panNumber, addhaarNumber, emailId, companyName, loanType } = req.body;  
    const leadData = req.body.leadData;
    conn.apex.post("/leadApi/", { leadData }, function (err, result) {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.json({ success: true, message: 'Record Created Successfully', result });
      }
      });
  });


  app.use(bodyParser.json());// application/json

  // Get lead record by leadId
  app.get('/api/lead/:leadId',(req,res)=>{
    const leadId = req.params.leadId;
    // getLeadById?leadId=2023120356
    conn.apex.get(`/leadApi/getLeadById?leadId=${leadId}`,function (err, result) {
        if (err) {
          res.status(500).json({ error: err.message });
        } else {
          res.json({ success: true, message: `Lead Record ${leadId} Fetched Successfully`, result });
        }
    });
  });


  // Update lead record by leadId
  app.put('/api/lead/:leadId',(req,res)=>{
    // getLeadById?leadId=2023120356
    const leadId = req.params.leadId;
    const leadData = req.body.leadData;
    conn.apex.put(`/leadApi/updateLeadById?leadId=${leadId}`,{leadData},function (err, result) {
        if (err) {
          res.status(500).json({ error: err.message });
        } else {
          res.json({ success: true, message: `Lead Record ${leadId} Updated Successfully`, result });
        }
    });
  });


  // Delete lead record by leadId
  app.delete('/api/lead/:leadId',(req,res)=>{
    // getLeadById?leadId=2023120356
    const leadId = req.params.leadId;
    conn.apex.delete(`/leadApi/deleteLeadById?leadId=${leadId}`,function (err, result) {
        if (err) {
          res.status(500).json({ error: err.message });
        } else {
          res.json({ success: true, message: `Lead Record ${leadId} Deleted Successfully`});
        }
    });
  });



  });
});

//set port , listen for requests
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
});