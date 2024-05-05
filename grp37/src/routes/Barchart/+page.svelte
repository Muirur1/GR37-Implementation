<script>
    export let data;
    $:console.log(data)
    const totalOrderQuantityByCountry = {};
    let maxOrderQuantity = 0;
    data.mergedData.forEach(client => {
        const country = client.CustomerCountry;
        if (country) {
            const orderQuantity = parseInt(client.OrderQuantity);
            totalOrderQuantityByCountry[country] = (totalOrderQuantityByCountry[country] || 0) + orderQuantity;
            if (totalOrderQuantityByCountry[country] > maxOrderQuantity) {
                maxOrderQuantity = totalOrderQuantityByCountry[country];
            }
        }
    });

const sortedTotalOrderQuantityByCountry = Object.fromEntries(
    Object.entries(totalOrderQuantityByCountry).sort(([,a], [,b]) => a - b)
);

const legendColors = {
    '4': 'red', '5': 'blue', '6': 'green', '7': 'yellow', '8': 'orange'
};

function getColor(plantKey) {
    return legendColors[plantKey] || 'gray';
}
function calculateRadius(totalOrderQuantity) {
        return Math.sqrt(totalOrderQuantity) / 6.5;
    }

    const maxY = 700000;

    function scaleOrderQuantity(totalOrderQuantity) {
        const scaleFactor = (totalSvgHeight - 200) / maxY;
        return totalOrderQuantity * scaleFactor;
    }

    const totalSvgHeight = 1500; 
</script>

<style>
    circle:hover, rect:hover {
        fill: #ADD8E6; 
        cursor: pointer; 
    }
</style>
<svg width="1800" height={totalSvgHeight} style="border: 1px solid #ccc;">
    <!-- Title -->
    <text x="900" y="50" fill="black" font-size="35" text-anchor="middle">
        Total Order Quantities by Country and Plants
    </text>

    <line x1="100" y1="100" x2="100" y2={totalSvgHeight - 100} stroke="black" stroke-width="2" />
    {#each Array(8).fill(0) as _, index}
        <line 
            x1="90" 
            y1={totalSvgHeight - 100 - (index * ((totalSvgHeight - 200) / 7))} 
            x2="100" 
            y2={totalSvgHeight - 100 - (index * ((totalSvgHeight - 200) / 7))} 
            stroke="black"
            />
            <text 
            x="80" 
            y={totalSvgHeight - 95 - (index * ((totalSvgHeight - 200) / 7))}  
            fill="black" 
            font-size="12" 
            text-anchor="end"
        >
            {index * 100000}
        </text>
    {/each}

    {#each Object.entries(sortedTotalOrderQuantityByCountry) as [country, totalOrderQuantity], i}
    <g transform="translate({i * 65 + 150}, 0)">
        <!-- Composite Shape (Circle + Rectangle) -->
        <g>
            <!-- Rectangle -->
            <rect
                x="10"
                y={totalSvgHeight - 100 - scaleOrderQuantity(totalOrderQuantity)}  
                width="20" 
                height={scaleOrderQuantity(totalOrderQuantity)} 
                fill={getColor(data.mergedData.find(client => client.CustomerCountry === country)?.PlantKey || 'gray')}
                stroke="#000"
                stroke-width="1"
            >
             <!-- Tooltip -->
             <title>
                {country}: {totalOrderQuantity/1000} 
            </title>
        </rect>

        <circle
        cx="20" 
        cy={totalSvgHeight - 100 - scaleOrderQuantity(totalOrderQuantity) - calculateRadius(totalOrderQuantity)} 
        r={calculateRadius(totalOrderQuantity)} 
        fill={getColor(data.mergedData.find(client => client.CustomerCountry === country)?.PlantKey || 'gray')} 
        stroke="black"
        stroke-width="1"
        >
    <!-- Tooltip -->
    <title>
        {country}: {totalOrderQuantity/1000} 
    </title>
</circle>

        
    </g>

        <!-- X-Axis Country Labels (Rotated) -->
        <text
                x="20"
                y={totalSvgHeight - 80}
                fill="black"
                font-size="12"
                text-anchor="middle"
                transform={`rotate(-45, 20, ${totalSvgHeight - 80})`}
            >
                {country}
            </text>
        </g>
    {/each}
     <!-- Y-Axis Label -->
     <text x="35" y={totalSvgHeight / 2} fill="black" font-size="16" transform="rotate(-90, 40, {totalSvgHeight / 2})">
        Total Order Quantity
    </text>

    <!-- Legend -->
    <text x="1700" y="30" fill="black" font-size="16">Plant Key</text>
    {#each Object.keys(legendColors) as key, index}
        <rect x="1750" y={50 + (index * 20)} width="20" height="10" fill={legendColors[key]} />
        <text x="1780" y={60 + (index * 20)} fill="black">{key}</text>
    {/each}
</svg>
