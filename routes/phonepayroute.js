const express = require("express");
const router = express();

router.post('./payment', newPayent);
router.post('/status/:id',checkstatus)