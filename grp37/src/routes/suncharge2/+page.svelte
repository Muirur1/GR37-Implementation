<script>
    import SupplyChart from '../../components/SupplyChart.svelte';
    import PurchasesChart from '../../components/PurchasesChart.svelte';
    import SalesChart from '../../components/SalesChart.svelte';
    import { onMount } from 'svelte';
    export let data;

  
    let vendorNames = Object.keys(data.averages).filter(name => name);
    let selectedVendor = vendorNames[0] || 'All Vendors';
    let selectedVendorData = data.averages[selectedVendor] || null;
    let maxWidth = 240; 
    let maxInboundTime = Math.max(...vendorNames.map(v => data.averages[v]?.TotalInboundLeadTime || 0));
    let scaleX = maxInboundTime ? maxWidth / maxInboundTime : 0;
    let tickValues = Array.from({ length: 10 }, (_, i) => i * (maxInboundTime / 9));
    let t1Vendors = []; 

    // Define the getColor function
    function getColor(index) {
        const hue = index * 137 % 360;
        return `hsl(${hue}, 70%, 70%)`;
    }
  
    function updateChartData(selectedVendor) {
      selectedVendorData = data.averages[selectedVendor] || null;
    }
    
    onMount(() => {
        t1Vendors = data.mergedData
            .filter(item => item.VendorTier === 'T1')
            .map(item => item.VendorName);
        t1Vendors = [...new Set(t1Vendors)];
    });
</script>
  
<!-- Main container for the chart and the vendor list -->
<div class="main-container">
    <!-- Supply Chart and Vendors List -->
    <div class="supply-and-title-container">
        <SupplyChart {selectedVendorData} {vendorNames} {updateChartData} {maxWidth} {scaleX} {tickValues} {t1Vendors} />
        <div id="supply-title" class="chart-title supply-title">Supply of Raw Materials</div>
    </div>
    
    <!-- Chart for Vendor Tier analysis -->
    <div class="chart-container">
        {#if data && data.monthlyAveragesByVendorForT0 && data.monthlyOrderQuantities}
            <PurchasesChart chartData={{
                lineChartData: data.monthlyAveragesByVendorForT0,
                barChartData: data.monthlyOrderQuantities
            }} />
        {:else}
            <p>Loading chart data...</p>
        {/if}
        <div id="purchases-title" class="chart-title purchases-title">Purchases</div>
    </div>
  
    <!-- Customer Chart for detailed customer analysis -->
    <div class="chart-container">
        {#if data && data.monthlyAverageDeliveryTimeByPlant && data.monthlyOrderQuantitiesByCustomer }
            <SalesChart customerChartData={{
                lineChartData: data.monthlyAverageDeliveryTimeByPlant,
                barChartData: data.monthlyOrderQuantitiesByCustomer
            }} />
        {:else}
            <p>Loading customer chart data...</p>
        {/if} 
        <div id="sales-title" class="chart-title sales-title">Sales</div> 
        
    </div>    

    <!-- List of unique countries -->
    {#if data && data.uniqueCountries}
        <div class="country-list">
            <strong>Customer Countries:</strong>
            <ul>
                {#each data.uniqueCountries as country, index}
                    <li style="background-color: {getColor(index)};">
                        {country}
                    </li>
                {/each}
            </ul>
        </div>
    {:else}
        <p>No countries to display.</p>
    {/if}
    
</div>


<!-- Title box -->
<div class="overall-title">
    <div class="title-content">
        SUNCHARGE SUPPLY CHAIN IN TIME
    </div>
</div>
  
<style>
    .main-container {
        display: flex;
        justify-content: space-between;
        flex-direction: row;
        flex-wrap: nowrap;
        gap: 20px;
        align-items: flex-start;
        margin-bottom: 50px; 
    }

    .supply-and-title-container {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: 0px;
        flex-grow: 1;
        font-size: 34px;
    }

    .chart-container {
      flex-grow: 1;
      max-width: calc(33% - 10px);
      position: relative;
    }

    .country-list {
        background-color: #f0f0f0;
        padding: 1px;
        border-radius: 2px;
        width: 200px; 
        font-size: 15px; 
        font-family: 'Arial', sans-serif; 
        color: black;
        margin-left: 1px; 
    }

    .country-list strong {
        font-size: 20px; 
        display: block;
        padding-bottom: 5px;
        color: #333; 
    }

    .country-list ul {
        list-style: none;
        padding: 0;
        margin: 0;
    }

    .country-list li {
        padding: 2px;
        margin-bottom: 5px; 
        background-color: #e0e0e0; 
        border-radius: 5px; 
        box-shadow: 0 2px 4px rgba(0,0,0,0.1); 
        transition: background-color 0.3s, color 0.3s;
    }

    .country-list li:hover {
        background-color: #c0c0c0; 
        color: white; 
    }

    .chart-title {
      background-color: #6a0dad; 
      color: white;
      text-align: center;
      padding: 10px;
      width: 100%;
      font-size: 34px;
      font-family: 'Arial', sans-serif; 
    }


    .purchases-title, .sales-title {
      padding: 10px;
      color: white;
      text-align: center;
      width: 100%;
    }

    .purchases-title {
      background-color: #49a942;
    }

    .sales-title {
      background-color: #c94c4c;
      width: 120%;
    }

    .overall-title {
      width: 100%;
      background-color: #4c7bf2; 
      color: white;
      text-align: center;
      padding: 25px;
    }
    .title-content {
      font-size: 45px;
      font-weight: bold;
      font-family: 'Arial', sans-serif; 
    }


</style>

  

