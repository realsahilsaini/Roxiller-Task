const {Router} = require('express');
const dataRouter = Router();
const fetchSeedData = require('../utils/seedData');
const DataModel = require('../models/seedData');


dataRouter.get('/', async (req,res)=>{
    
  const data = await fetchSeedData();

  try{
    await DataModel.insertMany(data);
    res.status(200).json({
      message: "Data inserted successfully",
      data: data
    })
  }catch(err){
    res.status(500).json({
      message: "Error inserting data",
      error: err
    })
  }




})


module.exports = {
  dataRouter
};