const {Router} = require('express');
const statsRouter = Router();

const DataModel = require('../models/seedData');

statsRouter.get('/', async (req,res)=>{
  
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


statsRouter.get('/bar-chart', async (req,res)=>{

  try{

    const {month} = req.query;

    if(!month || isNaN(month) || month < 1 || month > 12){
      return res.status(400).json({
        message: "A valid month (1-12) is required"
      })
    }

    const selectedMonth = parseInt(month, 10);


    const data = await DataModel.aggregate([
      {
        $addFields:{
          saleMonth: {$month: "$dateOfSale"},
        }
      },
      {
        $match: {
          saleMonth: selectedMonth,
          sold: true
        },
      },
      {
        $bucket:{
          groupBy: "$price",
          boundaries: [0, 101, 201, 301, 401, 501, 601, 701, 801, 901],
          default: '901-above',
          output:{
            count: {$sum: 1}
          }
        }
      }
    ])


        // Format response for bar chart
        const formattedData = data.map((range) => ({
          range: range._id === '901-above' ? '901-above' : `${range._id}-${range._id + 99}`,
          count: range.count,
        }));

        res.json(formattedData);

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
