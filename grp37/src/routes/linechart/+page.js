import Papa from 'papaparse';

const mergeData = (salesData, customersData, key) => {
    const mergedData = [];
    const customerMap = new Map();
    customersData.forEach(customer => {
        customerMap.set(customer[key], customer);
    });
    salesData.forEach(sale => {
        const customer = customerMap.get(sale[key]);
        if (customer) {
            mergedData.push({ ...sale, ...customer });
        }
    });
    return mergedData;
};

export const load = async ({ fetch }) => {
    try {
        // Fetch the Sales CSV file
        const salesResponse = await fetch('http://localhost:5173/Sales.csv');
        if (!salesResponse.ok) throw new Error('Failed to fetch Sales.csv');
        const salesCsvData = await salesResponse.text();
        const parsedSalesCsv = Papa.parse(salesCsvData, { header: true });

        // Fetch the Customers CSV file
        const customersResponse = await fetch('http://localhost:5173/Customers.csv');
        if (!customersResponse.ok) throw new Error('Failed to fetch Customers.csv');
        const customersCsvData = await customersResponse.text();
        const parsedCustomersCsv = Papa.parse(customersCsvData, { header: true });

        // Merge data based on CustomerKey
        const mergedData = mergeData(parsedSalesCsv.data, parsedCustomersCsv.data, 'CustomerKey');

       
        const dataForCharts = summarizeDataByYearAndCountry(mergedData);

        return { dataForCharts };  
    } catch (error) {
        console.error('Error loading data:', error);
        return { dataForCharts: {} };  
    }
};

const summarizeDataByYearAndCountry = (mergedData) => {
    const summary = {};
    mergedData.forEach(item => {
        const year = new Date(item.SalesOrderCreationDate).getFullYear();
        if ([2022, 2023, 2024].includes(year)) { 
            const country = item.CustomerCountry;
            const orderQuantity = parseInt(item.OrderQuantity, 10);
            if (!summary[country]) {
                summary[country] = { 2022: 0, 2023: 0, 2024: 0 };
            }
            summary[country][year] += orderQuantity;
        }
    });
    return summary;
};
