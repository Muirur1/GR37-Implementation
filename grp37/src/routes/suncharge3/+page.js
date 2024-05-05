import Papa from 'papaparse'

export const load = async ({ fetch }) => {
  try{
      const responseCus = await fetch('/suncharge/Customers.csv')
      const csvCus = await responseCus.text();
      const parsedCsvCus = Papa.parse(csvCus, { header: true });

      const responseMat = await fetch('/suncharge/Materials.csv')
      const csvMat = await responseMat.text();
      const parsedCsvMat = Papa.parse(csvMat, { header: true });

      const responsePlt = await fetch('/suncharge/Plants.csv')
      const csvPlt = await responsePlt.text();
      const parsedCsvPlt = Papa.parse(csvPlt, { header: true });

      const responseSal = await fetch('/suncharge/Sales.csv')
      const csvSal = await responseSal.text();
      const parsedCsvSal = Papa.parse(csvSal, { header: true });

      // merge data based on keys
      const mergedData1 = mergeData(parsedCsvSal.data,parsedCsvCus.data,'CustomerKey');
      const mergedData2 = mergeData(mergedData1,parsedCsvMat.data,'MaterialKey');
      const mergedData = mergeData(mergedData2,parsedCsvPlt.data,'PlantKey');

      mergedData.forEach(row => {
        // Parse the existing DeliveryDate string into its day, month, and year components
        let dateParts = row.DeliveryDate.split(' ');
        let day = dateParts[0];
        let month = dateParts[1];
        let year = dateParts[2];

        day = day.length === 1 ? '0' + day : day;
        month = month.length === 1 ? '0' + month : month;
      
        // Format the components into the desired yyyy-mm-dd format
        // Assuming month is in 'mm' format (e.g., '01' for January)
        let formattedDate = `${year}-${month}-${day}`;
      
        // Update the DeliveryDate column with the formatted date
        row.DeliveryDate = formattedDate;
      });      

      return {
        mergedData
      };
    } catch (error) {
      console.error('Error loading data:', error);
      throw error;
  }
};

function mergeData(primaryData, secondaryData, key) {
  const mergedData = [];

  // Create a map of key to data
  const secondaryDataMap = new Map();
  secondaryData.forEach(item => {
      secondaryDataMap.set(item[key], item);
  });

  // Merge primary data with corresponding secondary data
  primaryData.forEach(primaryItem => {
      const secondaryItem = secondaryDataMap.get(primaryItem[key]);
      if (secondaryItem) {
          mergedData.push({ ...primaryItem, ...secondaryItem });
      }
  });

  return mergedData;
}
