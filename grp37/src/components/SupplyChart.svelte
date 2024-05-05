<script>
    export let selectedVendorData;
    export let vendorNames;
    export let updateChartData;
    export let maxWidth;
    export let scaleX;
    export let tickValues;
    export let t1Vendors;
  
    let selectedVendor = vendorNames[0] || 'All Vendors';

    function getColor(index, isSelected) {
        const baseHue = (index * 137) % 360;
        return `hsl(${baseHue}, 70%, ${isSelected ? '60%' : '90%'})`;
    }
    
</script>
  
<div class="chart-container">
    <!-- Filter dropdown above the chart -->
    <div class="filter-dropdown">
        <select bind:value={selectedVendor} on:change={() => updateChartData(selectedVendor)}>
            {#each vendorNames as name}
                <option value={name}>{name}</option>
            {/each}
        </select>
    </div>

    <!-- SVG chart with labels, bars, axis, and title -->
    <div class="display-flex">
        {#if selectedVendorData}
            <svg width="435" height="353.5" viewBox="25 -15 162.5 115">
                <!-- Labels -->
                <text x="30" y="10" class="axis-label">Good Receipt</text>
                <text x="30" y="25" class="axis-label">Inbound Transport</text>
                <text x="30" y="40" class="axis-label">Production</text>
                
                <!-- Bars should use scaleX for the width -->
                <rect x="75" y="32.5" width={selectedVendorData.ProductionTime * scaleX} height="10" fill="orange" />
                <rect x={75 + selectedVendorData.ProductionTime * scaleX} y="15" width={selectedVendorData.InboundTransportationTime * scaleX} height="10" fill="skyblue" />
                <rect x={75 + (selectedVendorData.ProductionTime + selectedVendorData.InboundTransportationTime) * scaleX} y="0" width={selectedVendorData.GoodReceiptProcessingTime * scaleX} height="10" fill="salmon" />
                
                <!-- X-axis Line -->
                <line x1="75" y1="50" x2={75 + maxWidth} y2="50" stroke="black" />
                
                <!-- X-axis ticks and labels -->
                {#each tickValues as value, index}
                    <line x1={75 + value * scaleX} y1="50" x2={75 + value * scaleX} y2="52.5" stroke="black" />
                    <text x={75 + value * scaleX} y="60" text-anchor="middle">{Math.round(value)}</text>
                {/each}
                
                <!-- X-axis Label -->
                <text x="135" y="69" text-anchor="middle">Total Inbound Time (days)</text>
            </svg>
        {:else}
            <p>Please select a vendor to display the chart.</p>
        {/if}


    <!-- Vendors list next to the chart -->
        {#if t1Vendors && t1Vendors.length > 0}
            <div class="vendors-list">
                <strong>External Vendors:</strong>
                <ul>
                    {#each t1Vendors as vendor, index}
                        <li style="background-color: {getColor(index, selectedVendor === vendor)};"
                            class="{selectedVendor === vendor ? 'selected' : ''}">
                            {vendor}
                        </li>
                    {/each}
                </ul>
            </div>
        {:else}
            <p>No vendors to display.</p>
        {/if}
    </div>
</div>
  
<style>

    .chart-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        margin: 0 auto;
        font-size: 10px;
        font-family: 'Arial', sans-serif; 
    }

    .display-flex {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 30px;
        font-size: 10px;

    }

    .filter-dropdown {
        margin-bottom: 1rem;
    }

    .filter-dropdown select {
        width: 100%;
        padding: 10px;
        font-size: 20px;
        box-sizing: border-box; /* Includes padding in width */
    }

    .vendors-list {
        background-color: #f0f0f0;
        padding: 15px;
        border-radius: 5px;
        width: 180px; 
    }

    .vendors-list strong {
        font-size: 24px; /* Increase font size */
        display: block; 
        padding-bottom: 10px;
    }

    .vendors-list ul {
        list-style: none;
        padding: 0;
        margin: 0;
    }

    .vendors-list li {
        padding: 10px;
        margin: 5px;
        font-size: 17px;
        font-family:'Arial', sans-serif;
        border: 1px solid transparent;
        color: black; 
    }

    .vendors-list li.selected {
        font-weight: bold;
        border-color: black;
        font-size: 20px;
        box-shadow: 0 0 8px rgba(0, 0, 0, 0.6);
    }

    .axis-label, .tick {
        font-size: 10px;
        font-family: 'Arial', sans-serif; 
    }

</style>
  

  