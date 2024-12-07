const mongoose = require('mongoose');
require('dotenv').config();


async function connectDB(){
  try{
    await mongoose.connect(process.env.MONGO_URI);
    console.log("\nDatabase connected successfully");
  }catch(err){
    console.log("\nError connecting to database", err);
    process.exit(1);
    //process.exit(1) means if the connection fails, the process will exit with a failure code
  }
}

module.exports = connectDB;