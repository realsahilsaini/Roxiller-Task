const {Router} = require('express');
const statsRouter = Router();

const DataModel = require('../models/seedData');

statsRouter.get('/sales', async (req,res)=>{
  
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


statsRouter.get('/pie-chart', async (req,res)=>{
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
        },
      },
      {
        $match:{
          saleMonth: selectedMonth,
        },
      },
      {
        $group:{
          _id: '$category',
          count: {$sum: 1}
        },
      },
      {
        $project:{
          category: '$_id',
          count: 1,
          _id: 0
        },
      },
    ])


    res.status(200).json({data});

  }catch(err){
    res.status(500).json({
      message: "Error fetching data",
      error: err
    })
  }
})


//make an api to get result of the pie chart, bar chart and the total sales combined
statsRouter.get('/all-stats', async (req, res)=>{
  try{

    const {month, year} = req.query;

    if(!month || !year){
      return res.status(400).json({
        message: "Month and Year are required"
      })
    }

    //Base Url
    // const baseUrl = `${req.protocol}://${req.get('host')}`;
    const baseUrl = 'http://localhost:3000';

    //API Endpoints
    const salesStatsUrl = `${baseUrl}/api/v1/stats/sales?month=${month}&year=${year}`;
    const barChartUrl = `${baseUrl}/api/v1/stats/bar-chart?month=${month}`;
    const pieChartUrl = `${baseUrl}/api/v1/stats/pie-chart?month=${month}`;


    //Fetch all data concurrently
    const salesStatsResponse = await fetch(salesStatsUrl);
    const barChartResponse = await fetch(barChartUrl);
    const pieChartResponse = await fetch(pieChartUrl);

    //Parse the response
    const salesStatsData = await salesStatsResponse.json();
    const barChartData = await barChartResponse.json();
    const pieChartData = await pieChartResponse.json();

    //Combine the data
    const combinedData = {
      salesStats: salesStatsData,
      barChart: barChartData,
      pieChart: pieChartData
    }


    res.status(200).json({
      message: "Data fetched successfully",
      data: combinedData
    });

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
