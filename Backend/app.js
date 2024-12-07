const express = require('express');
const connectDB = require('./utils/connectDB');
const app = express();
require("dotenv").config();
const {dataRouter} = require('./routes/data');

app.use(express.json());

connectDB();

//Fetch the Seed Data and insert it into the database
app.use('/api/v1/data', dataRouter);





app.listen(3000, ()=>{
    console.log(`Server is running on http://localhost:3000`);
})