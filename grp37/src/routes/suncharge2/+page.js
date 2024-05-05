import Papa from 'papaparse';

export async function load({ fetch }) {
    // Fetch and parse the Vendors CSV file
    const vendorsResponse = await fetch('http://localhost:5173/Vendors.csv');
    const vendorsCsvData = await vendorsResponse.text();
    const parsedVendorsCsv = Papa.parse(vendorsCsvData, { header: true }).data;

    // Fetch and parse the MaterialPlantRelation CSV file
    const materialPlantRelationResponse = await fetch('http://localhost:5173/MaterialPlantRelation.csv');
    const materialPlantRelationCsvData = await materialPlantRelationResponse.text();
    const parsedMaterialPlantRelationCsv = Papa.parse(materialPlantRelationCsvData, { header: true }).data;

    // Fetch and parse the Purchases CSV file
    const purchasesResponse = await fetch('http://localhost:5173/Purchases.csv');
    const purchasesCsvData = await purchasesResponse.text();
    const parsedPurchasesCsv = Papa.parse(purchasesCsvData, { header: true }).data;

    // Fetch and parse the Sales CSV file
    const salesResponse = await fetch('http://localhost:5173/Sales.csv');
    const SalesCsvData = await salesResponse.text();
    const parsedSalesCsv = Papa.parse(SalesCsvData, { header: true }).data;

    // Fetch and parse the Customers CSV file
    const customersResponse = await fetch('http://localhost:5173/Customers.csv');
    const CustomersCsvData = await customersResponse.text();
    const parsedCustomersCsv = Papa.parse(CustomersCsvData, { header: true }).data;


    // Merge with Vendors data based on VendorKey
    const mergedData = mergeData(parsedMaterialPlantRelationCsv, parsedVendorsCsv, 'VendorKey');

    // Merge the mergedData with Purchases data to create a new merged dataset
    const mergedData2 = mergeData2(parsedPurchasesCsv, mergedData, 'PlantKey');
    
    const mergedData3 = mergeData3(parsedSalesCsv, parsedCustomersCsv, 'PlantKey')

    // Calculate the averages for each vendor
    const averages = calculateAverages(mergedData);

    // Calculate the monthly averages for each vendor within VendorTier 'T0'
    const monthlyAveragesByVendorForT0 = calculateMonthlyAveragesByVendorTierAndVendor(mergedData2, 'T0');
    
    // Calculate the monthly order quantities for the vendors
    const monthlyOrderQuantities = calculateMonthlyOrderQuantity(mergedData2);
    const monthlyAverageDeliveryTimeByPlant = calculateMonthlyAverageDeliveryTimeByPlant(mergedData3);

    const monthlyOrderQuantitiesByCustomer = calculateMonthlyOrderQuantityByCustomer(mergedData3);

    // Extract unique customer countries using the helper function
    const uniqueCountries = extractUniqueCountries(parsedCustomersCsv);

    // Return the merged data array wrapped in an object
    return { mergedData, mergedData2, mergedData3, averages, monthlyAveragesByVendorForT0, monthlyOrderQuantities, 
        monthlyAverageDeliveryTimeByPlant, monthlyOrderQuantitiesByCustomer, uniqueCountries };
};


// Helper function to calculate averages
const calculateAverages = (data) => {
    const sums = {};
    const counts = {};
  
    data.forEach(item => {
      const vendor = item.VendorName;

      // Skip entries with 'NA' in any of the fields of interest
      if (item.ProductionTime === 'NA' || item.InboundTransportationTime === 'NA' || 
        item.GoodReceiptProcessingTime === 'NA' || item.TotalInboundLeadTime === 'NA') {
        return;
      }

      if (!sums[vendor]) {
        sums[vendor] = {
          ProductionTime: 0,
          InboundTransportationTime: 0,
          GoodReceiptProcessingTime: 0,
          TotalInboundLeadTime: 0,
        };
        counts[vendor] = {
          ProductionTime: 0,
          InboundTransportationTime: 0,
          GoodReceiptProcessingTime: 0,
          TotalInboundLeadTime: 0,
        };
      }
  
      sums[vendor].ProductionTime += Number(item.ProductionTime);
      counts[vendor].ProductionTime += 1;
      
      sums[vendor].InboundTransportationTime += Number(item.InboundTransportationTime);
      counts[vendor].InboundTransportationTime += 1;
      
      sums[vendor].GoodReceiptProcessingTime += Number(item.GoodReceiptProcessingTime);
      counts[vendor].GoodReceiptProcessingTime += 1;
      
      sums[vendor].TotalInboundLeadTime += Number(item.TotalInboundLeadTime);
      counts[vendor].TotalInboundLeadTime += 1;
    });
  
    const averages = {};
    Object.keys(sums).forEach(vendor => {
      averages[vendor] = {};
      Object.keys(sums[vendor]).forEach(key => {
        averages[vendor][key] = sums[vendor][key] / counts[vendor][key];
      });
    });
  
    return averages;
};



const mergeData = (primaryData, secondaryData, key) => {
    const mergedData = [];

    const secondaryMap = new Map();
    secondaryData.forEach(item => {
        secondaryMap.set(item[key], item);
    });

    // Merge primary data with corresponding secondary data
    primaryData.forEach(primaryItem => {
        const secondaryItem = secondaryMap.get(primaryItem[key]);
        if (secondaryItem) {
            mergedData.push({ ...primaryItem, ...secondaryItem });
        }
    });

    return mergedData;
};



const mergeData2 = (primaryData, secondaryData, key) => {
    const mergedData2 = [];

    const secondaryMap = new Map();
    secondaryData.forEach(item => {
        secondaryMap.set(item[key], item);
    });

    // Merge primary data with corresponding secondary data
    primaryData.forEach(primaryItem => {
        const secondaryItem = secondaryMap.get(primaryItem[key]);
        if (secondaryItem) {
            mergedData2.push({ ...primaryItem, ...secondaryItem });
        }
    });

    return mergedData2;
};



const mergeData3 = (primaryData, secondaryData, key) => {
    const mergedData3 = [];

    const secondaryMap = new Map();
    secondaryData.forEach(item => {
        secondaryMap.set(item[key], item);
    });

    // Merge primary data with corresponding secondary data
    primaryData.forEach(primaryItem => {
        const secondaryItem = secondaryMap.get(primaryItem[key]);
        if (secondaryItem) {
            mergedData3.push({ ...primaryItem, ...secondaryItem });
        }
    });

    return mergedData3;
};


// This function will get the month name from a date string in the format 'm/d/yyyy'.
function getMonthName(dateStr) {
    if (!dateStr || dateStr.includes('NA')) return undefined;
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const dateParts = dateStr.split('/');
    const monthIndex = parseInt(dateParts[0], 10) - 1;
    return monthNames[monthIndex];
}

// Function to calculate monthly averages for each vendor in a specific VendorTier
function calculateMonthlyAveragesByVendorTierAndVendor(mergedData, tier) {
    let vendorMonthlySums = {};
    let vendorMonthlyCounts = {};
    const monthNames = ["January", "February", "March", "April", "May", "June",
                        "July", "August", "September", "October", "November", "December"];

    // Filter for only 'T0' VendorTier entries
    const filteredData = mergedData.filter(entry => entry.VendorTier === tier);

    filteredData.forEach(entry => {
        // Ensure ReceiptTimeDeviation is a number and not 'NA'
        if (entry.ReceiptTimeDeviation && entry.ReceiptTimeDeviation !== 'NA') {
            const month = getMonthName(entry.PurchaseOrderCreationDate);
            const vendor = entry.VendorName;
            if (month && vendor) {
                if (!vendorMonthlySums[vendor]) {
                    vendorMonthlySums[vendor] = {};
                }
                if (!vendorMonthlySums[vendor][month]) {
                    vendorMonthlySums[vendor][month] = 0;
                    vendorMonthlyCounts[vendor] = vendorMonthlyCounts[vendor] || {};
                    vendorMonthlyCounts[vendor][month] = 0;
                }
                vendorMonthlySums[vendor][month] += parseFloat(entry.ReceiptTimeDeviation);
                vendorMonthlyCounts[vendor][month] += 1;
            }
        }
    });

    const vendorMonthlyAverages = {};
    Object.keys(vendorMonthlySums).forEach(vendor => {
        vendorMonthlyAverages[vendor] = monthNames.map(month => {
            return {
                month,
                average: vendorMonthlyCounts[vendor] && vendorMonthlyCounts[vendor][month] ? vendorMonthlySums[vendor][month] / vendorMonthlyCounts[vendor][month] : 0
            };
        }).filter(monthData => monthData.average !== 0);
    });

    return vendorMonthlyAverages;
}



function calculateMonthlyOrderQuantity(mergedData) {
    let vendorMonthlySums = {};
    const monthNames = ["January", "February", "March", "April", "May", "June",
                        "July", "August", "September", "October", "November", "December"];

    // Sum the PurchaseOrderQuantity for each vendor per month
    mergedData.forEach(entry => {
        if (entry.PurchaseOrderQuantity && entry.PurchaseOrderQuantity !== 'NA') {
            const month = getMonthName(entry.PurchaseOrderCreationDate);
            const vendor = entry.VendorName;
            if (month && vendor) {
                if (!vendorMonthlySums[vendor]) {
                    vendorMonthlySums[vendor] = {};
                }
                if (!vendorMonthlySums[vendor][month]) {
                    vendorMonthlySums[vendor][month] = 0;
                }
                vendorMonthlySums[vendor][month] += parseFloat(entry.PurchaseOrderQuantity);
            }
        }
    });

    const vendorMonthlyTotals = {};
    Object.keys(vendorMonthlySums).forEach(vendor => {
        vendorMonthlyTotals[vendor] = monthNames.map(month => {
            return {
                month,
                total: vendorMonthlySums[vendor] && vendorMonthlySums[vendor][month] ? vendorMonthlySums[vendor][month] : 0
            };
        }).filter(monthData => monthData.total !== 0);
    });

    return vendorMonthlyTotals;
}


// Helper function to extract unique countries
function extractUniqueCountries(customers) {
    return Array.from(new Set(customers.map(customer => customer.CustomerCountry))).filter(Boolean);
}


// Function to calculate the monthly average delivery time by plant
function calculateMonthlyAverageDeliveryTimeByPlant(mergedData) {
    let plantMonthlySums = {};
    let plantMonthlyCounts = {};
    const monthNames = ["January", "February", "March", "April", "May", "June",
                        "July", "August", "September", "October", "November", "December"];
  
    // Sum the DeliveryTimeDeviation for each plant per month
    mergedData.forEach(entry => {
      if (entry.DeliveryTimeDeviation && entry.DeliveryTimeDeviation !== 'NA') {
        const month = getMonthName(entry.SalesOrderCreationDate);
        const plant = entry.PlantKey;
        const customerName = entry.CustomerName; // This is to display the customer name
        if (month && plant) {
          if (!plantMonthlySums[plant]) {
            plantMonthlySums[plant] = {};
          }
          if (!plantMonthlySums[plant][month]) {
            plantMonthlySums[plant][month] = { sum: 0, customerName };
            plantMonthlyCounts[plant] = plantMonthlyCounts[plant] || {};
            plantMonthlyCounts[plant][month] = 0;
          }
          plantMonthlySums[plant][month].sum += parseFloat(entry.DeliveryTimeDeviation);
          plantMonthlyCounts[plant][month] += 1;
        }
      }
    });
  
    const plantMonthlyAverages = {};
    Object.keys(plantMonthlySums).forEach(plant => {
      plantMonthlyAverages[plant] = monthNames.map(month => {
        return {
          month,
          customerName: plantMonthlySums[plant][month]?.customerName || "Unknown", // Fallback to "Unknown"
          average: plantMonthlyCounts[plant] && plantMonthlyCounts[plant][month] ? plantMonthlySums[plant][month].sum / plantMonthlyCounts[plant][month] : 0
        };
      }).filter(monthData => monthData.average !== 0);
    });
  
    return plantMonthlyAverages;
  }
  
 
  
// Function to calculate the MOnthly Order Quantity By customer

  function calculateMonthlyOrderQuantityByCustomer(mergedData) {
    let customerMonthlySums = {};
    const monthNames = ["January", "February", "March", "April", "May", "June",
                        "July", "August", "September", "October", "November", "December"];

    // Sum the OrderQuantity for each customer per month
    mergedData.forEach(entry => {
        if (entry.OrderQuantity && entry.OrderQuantity !== 'NA') {
            const month = getMonthName(entry.SalesOrderCreationDate);
            const customer = entry.CustomerName; 
            if (month && customer) {
                if (!customerMonthlySums[customer]) {
                    customerMonthlySums[customer] = {};
                }
                if (!customerMonthlySums[customer][month]) {
                    customerMonthlySums[customer][month] = 0;
                }
                customerMonthlySums[customer][month] += parseFloat(entry.OrderQuantity);
            }
        }
    });

    const customerMonthlyTotals = {};
    Object.keys(customerMonthlySums).forEach(customer => {
        customerMonthlyTotals[customer] = monthNames.map(month => {
            return {
                month,
                total: customerMonthlySums[customer] && customerMonthlySums[customer][month] ? customerMonthlySums[customer][month] : 0
            };
        }).filter(monthData => monthData.total !== 0);
    });

    return customerMonthlyTotals;
}


