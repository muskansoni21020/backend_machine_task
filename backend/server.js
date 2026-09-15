const express = require('express')
require('dotenv').config();

const app = express();
const { Sequelize } = require('sequelize');
const cors = require('cors');
const sequelize = require('sequelize')
const bodyParser = require('body-parser');

const userRoutes = require('./routes/user_api')
const productRoutes = require('./routes/productRoutes')
const orderRoutes = require("./routes/orderRoutes");

app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors({
  origin: ['http://localhost:3000',
],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));

app.get('/', (req, res) => {
  res.send('I am come from backend...')
})


app.use('/', userRoutes);
app.use('/', productRoutes);
app.use('/',orderRoutes);

app.listen(5000, () => {
  console.log('Server is listen on 5000')
})