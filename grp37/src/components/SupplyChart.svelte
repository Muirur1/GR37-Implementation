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
            <svg width="650" height="480" viewBox="0 -15 350 170">
                <!-- Labels -->
                <text x="10" y="30" class="axis-label">Good Receipt</text>
                <text x="10" y="70" class="axis-label">Inbound Transport</text>
                <text x="10" y="110" class="axis-label">Production</text>
                
                <!-- Bars should use scaleX for the width -->
                <rect x="100" y="100" width={selectedVendorData.ProductionTime * scaleX} height="20" fill="orange" />
                <rect x={100 + selectedVendorData.ProductionTime * scaleX} y="60" width={selectedVendorData.InboundTransportationTime * scaleX} height="20" fill="skyblue" />
                <rect x={100 + (selectedVendorData.ProductionTime + selectedVendorData.InboundTransportationTime) * scaleX} y="20" width={selectedVendorData.GoodReceiptProcessingTime * scaleX} height="20" fill="salmon" />
                
                <!-- X-axis Line -->
                <line x1="100" y1="130" x2={100 + maxWidth} y2="130" stroke="black" />
                
                <!-- X-axis ticks and labels -->
                {#each tickValues as value, index}
                    <line x1={100 + value * scaleX} y1="130" x2={100 + value * scaleX} y2="135" stroke="black" />
                    <text x={100 + value * scaleX} y="145" text-anchor="middle">{Math.round(value)}</text>
                {/each}
                
                <!-- X-axis Label -->
                <text x="225" y="160" text-anchor="middle">Total Inbound Time (days)</text>
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

    .display-flex {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        font-size: 10px;

    }

    .chart-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        margin: 0 auto;
        font-size: 10px;
        overflow: visible;
        font-family: 'Arial', sans-serif; 
        width: auto;
    }


    .filter-dropdown {
        margin-bottom: 1rem;
    }

    .filter-dropdown select {
        width: 100%;
        padding: 10px;
        font-size: 15px;
        box-sizing: border-box; /* Includes padding in width */
    }

    .vendors-list {
        padding: 10px;
        background-color: #f0f0f0;
        padding: 10px;
        border-radius: 5px;
        margin-left: 1px;
    }

    .vendors-list strong {
        font-size: 16px; /* Increase font size */
        padding-bottom: 10px;
    }

    .vendors-list ul {
        list-style: none;
        padding: 0;
        margin: 0;
    }

    .vendors-list li {
        padding: 5px;
        margin: 5px;
        font-size: 14px;
        font-family:'Arial', sans-serif;
        border: 1px solid transparent;
        display: block;
        color: black; 
    }

    .vendors-list li.selected {
        font-weight: bold;
        border-color: black;
        font-size: 14px;
        box-shadow: 0 0 8px rgba(0, 0, 0, 0.6);
    }

    .axis-label, .tick {
        font-size: 10px;
        font-family: 'Arial', sans-serif; 
    }

</style>
  

  

