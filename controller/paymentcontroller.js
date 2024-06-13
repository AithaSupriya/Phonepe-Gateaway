
// const crypto=require('crypto')
// const axios=require('axios');
// const {salt_key, merchant_id} = require('./secret')

// const newPayment=async (req, res) => {
// try{
//     const merchantTransactionId=req.body.transactionId;
//     const data={
//         merchantId: merchant_id,
//         merchantTransactionId: merchantTransactionId,
//         merchantUserId: req.body.MUID,
//         name: req.body.name,
//         amount: req.body.amount*100,
//         redirectUrl: `http://localhost:5000/api/status/${merchantTransactionId}`,
//         redirectMode: 'POST',
//         mobileNumber: req.body.number,
//         paymentInstrument: {
//             type :'PAY_PAGE'
//         }
//     };

//     const payload=JSON.stringify(data);
//     const payloadMain =Buffer.from(payload).toString('base64');
//     const keyIndex = 1;
//     const string=payloadMain+'/pg/v1/pay'+ salt_key;
//     const sha256=crypto.createHash('sha256').update(string).digest('hex');
//     const checksum = sha256+ '###' + keyIndex;

//     const prod_URL = "https://api.phonepe.com/apis/hermes/pg/v1/pay"

//     const options ={
//         method: 'POST',
//         url: prod_URL,
//         headers: {
//         accept: 'application/json',
//         'Content-Type': 'application/json',
//         'X-VERIFY': checksum
//         },
//         data: {
//             request: payloadMain
//         }
//     };

//     axios.request(options).then(function (response) {
//         console.log(response.data)
//         return res.redirect(response.data.data.instrumentResponse.redirectInfo.url) 
//     })
//     .catch(function (error) { 
//         console.error(error);
//     });

//     } catch (error) {
//         res.status(500).send({
//         message: error.message,
//         success: false
//         })
//     }
// }


