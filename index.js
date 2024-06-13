const express = require("express");
const bodyParser = require('body-parser');
const axios = require('axios');
const uniqid = require('uniqid');
const sha256 = require('sha256');

const app = express();
const cors = require("cors");
require("dotenv").config();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

// Starting Server
const port = 5002;

// PhonePe API configuration
const HOST_URL = 'https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1';
const MERCHANT_ID = 'SCALEORANGESANDBOX';
const SALT_INDEX = 1;
const SALT_KEY = '05982b5f-ed9a-46d1-8062-1958c63bf534';

app.get("/", (req, res) => {
    res.send("PhonePe is working");
});

// Initiate payment
app.get('/pay', (req, res) => {
    const merchantTransactionId = uniqid();
    const userId = 123;
    const payload = {
        "merchantId": MERCHANT_ID,
        "merchantTransactionId": merchantTransactionId,
        "merchantUserId": userId,
        "amount": 30000,
        "redirectUrl": `http://localhost:5002/redirect-url/${merchantTransactionId}`,
        "callbackUrl": `http://localhost:5002/phonepe/webhook`,
        "redirectMode": "REDIRECT",
        "mobileNumber": "9999999999",
        "paymentInstrument": {
            "type": "PAY_PAGE"
        }
    };

    const bufferObj = Buffer.from(JSON.stringify(payload), "utf8");
    const base64EncodedPayload = bufferObj.toString("base64");
    const xVerify = sha256(base64EncodedPayload + "/pg/v1/pay" + SALT_KEY) + "###" + SALT_INDEX;

    const options = {
        method: 'post',
        url: `${HOST_URL}/pay`,
        headers: {
            accept: 'application/json',
            'Content-Type': 'application/json',
            "X-VERIFY": xVerify,
        },
        data: {
            request: base64EncodedPayload,
        }
    };

    axios.request(options)
        .then(function (response) {
            console.log(response.data);
            const url = response.data.data.instrumentResponse.redirectInfo.url;
            res.redirect(url);
        })
        .catch(function (error) {
            console.error(error);
            res.status(500).send(error.message);
        });
});

// Webhook to handle PhonePe's callback
app.post('/phonepe/webhook', (req, res) => {
    const callbackHeaders = req.headers;
    const base64response = req.body.response;
    const xVerifyHeader = callbackHeaders['x-verify'];
    const decodedResponse = Buffer.from(base64response, 'base64').toString('utf8');
    console.log(decodedResponse);
    res.send(decodedResponse);
});

// Check the status of the transaction
app.get("/redirect-url/:merchantTransactionId", (req, res) => {
    const { merchantTransactionId } = req.params;
    if (merchantTransactionId) {
        const xVerify = sha256(`/pg/v1/status/${MERCHANT_ID}/${merchantTransactionId}` + SALT_KEY) + "###" + SALT_INDEX;
        const options = {
            method: 'get',
            url: `${HOST_URL}/status/${MERCHANT_ID}/${merchantTransactionId}`,
            headers: {
                accept: "application/json",
                'Content-Type': 'application/json',
                'X-VERIFY': xVerify,
            },
        };

        axios.request(options)
            .then(function (response) {
                console.log(response.data);
                // Check if the status indicates success
                if (response.data.success) {
                    res.send({ status: 'Payment successful', data: response.data });
                } else {
                    res.send({ status: 'Payment not successful', data: response.data });
                }
            })
            .catch(function (error) {
                console.error(error);
                res.status(500).send(error.message);
            });
    } else {
        res.status(400).send({ error: "MerchantTransactionId is required" });
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
 