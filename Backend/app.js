const express = require('express');
const connectDB = require('./utils/connectDB');
const app = express();
require("dotenv").config();
const {dataRouter} = require('./routes/data');
const {searchTxRouter} = require('./routes/searchTx');

app.use(express.json());

connectDB();

//Fetch the Seed Data and insert it into the database
app.use('/api/v1/data', dataRouter);


//Search Transaction Route
app.use('/api/v1/searchTx', searchTxRouter);





app.listen(3000, ()=>{
    console.log(`Server is running on http://localhost:3000`);
})