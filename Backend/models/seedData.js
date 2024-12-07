const mongoose = require('mongoose');
const {Schema} = mongoose;

const dataSchema = new Schema({
  id: Number,
  title: String,
  price: Number,
  description: String,
  category: String,
  image: String,
  sold: Boolean,
  dateOfSale: Date,
})


const DataModel = mongoose.model('seedData', dataSchema);

module.exports = DataModel;