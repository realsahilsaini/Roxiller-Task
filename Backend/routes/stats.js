const {Router} = require('express');
const statsRouter = Router();

const DataModel = require('../models/seedData');

statsRouter.get('/totalsales', async (req,res)=>{
  
  try{
    const {month, year} = req.query;

    if(!month || !year){
      return res.status(400).json({
        message: "Month and Year are required"
      })
    }

    // Convert month and year to a date range
    const startDate = new Date(`${year}-${month}-01`); // Start of the month
    const endDate = new Date(startDate);
    endDate.setMonth(startDate.getMonth() + 1); // End of the month

    const transactions = await DataModel.find({
      sold: true,
      dateOfSale:{
        $gte: startDate,
        $lt: endDate
      }
    })

    const totalSales = transactions.reduce((acc, item)=>{
      return acc + item.price;
    }, 0)

    const NotSold = await DataModel.find({
      sold: false,
      dateOfSale:{
        $gte: startDate,
        $lt: endDate
      }
    })

  res.json({
    startDate,
    endDate,
    totalSalesAmount: totalSales,
    totalSalesCount: transactions.length,
    NotSoldCount: NotSold.length
  })



  }catch(err){
    res.status(500).json({
      message: "Error fetching data",
      error: err
    })
  }




})


module.exports = {
  statsRouter
};
