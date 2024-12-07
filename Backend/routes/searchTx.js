const {Router} = require('express');
const searchTxRouter = Router();
const DataModel = require('../models/seedData');


searchTxRouter.get('/', async (req,res)=>{

  //Default values for page and perPage are 1 and 10 respectively if not provided in the query string, if provided, they are parsed to integers using parseInt function
  const {page=1, perPage= 10, search =''} = req.query;

  const pageNumber =parseInt(page);
  const itemsPerPage = parseInt(perPage);

  // Validate the inputs (ensure they are positive numbers)
  if (pageNumber < 1 || itemsPerPage < 1) {
    return res.status(400).json({ message: 'Page and perPage must be positive integers' });
  }


  const filter = search
  ? {
      $or: [
        { title: { $regex: search, $options: 'i' } }, // Case-insensitive search for title
        { description: { $regex: search, $options: 'i' } }, // Case-insensitive search for description
        { price: !isNaN(search) ? search : undefined }, // Match price exactly if search is numeric
      ].filter(Boolean), // Remove undefined entries to avoid errors
    }
  : {};
  
  const skip = (pageNumber - 1) * itemsPerPage;
  
  try{
    const transactions = await DataModel.find(filter).skip(skip).limit(itemsPerPage);

    const totalRecords = await DataModel.countDocuments(filter);

    res.status(200).json({
      page: pageNumber,
      perPage: itemsPerPage,
      totalRecords,
      totalPages: Math.ceil(totalRecords / itemsPerPage),
      data: transactions,
    });

  }catch(err){
    res.status(500).json({
      message: "Error fetching data",
      error: err
    })
  }


});





module.exports = {
  searchTxRouter
}