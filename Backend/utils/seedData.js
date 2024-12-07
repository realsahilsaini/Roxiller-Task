async function fetchSeedData () {
  try{
    const resposne = await fetch('https://s3.amazonaws.com/roxiler.com/product_transaction.json');
    const data = await resposne.json();
    return data;
  }catch(err){
    console.log('Error fetching data', err);
  };
}

module.exports = fetchSeedData;
