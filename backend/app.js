require('dotenv').config()

const express = require('express');
const app = express();
const cors = require('cors')
const router = require('./routes/Routes')
const iniciarServidor = require('./iniciarServidor')

app.use(cors())
app.use(express.json())

app.use('/', router)

iniciarServidor(app);