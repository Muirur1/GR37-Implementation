<script>
  export let data;

  const svgWidth = 350;
  const svgHeight = 200;
  const padding = 40;

  function processData(dataForCharts) {
    let chartData = {};
    let allYValues = [];
    for (const country in dataForCharts) {
      const values = dataForCharts[country];
      const maxValue = Math.max(...Object.values(values));
      const years = Object.keys(values).sort(); 
      const points = years.map((year, index) => {
        const yPos = svgHeight - padding - (values[year] / maxValue * (svgHeight - 2 * padding));
        allYValues.push(yPos);
        return {
          x: padding + (index * (svgWidth - 2 * padding) / (years.length - 1)),
          y: yPos,
          year
        };
      });
      chartData[country] = points;
    }
    const middleYValue = calculateMiddleYValue(allYValues);
    return { chartData, middleYValue };
  }

  function calculateMiddleYValue(values) {
    const mid = Math.floor(values.length / 2);
    const nums = [...values].sort((a, b) => a - b);
    return values.length % 2 !== 0 ? nums[mid] : (nums[mid - 1] + nums[mid]) / 2;
  }
  
  let selectedCountry = null;

  function handleCountryChange(event) {
  selectedCountry = event.target.value;
  }

  let { chartData, middleYValue } = processData(data.dataForCharts);
  let tooltip = null;
  let tooltipContent = '';


  function hideTooltip() {
    tooltip = null;
  }
  function showTooltip(event, point, quantity) {
    tooltip = { x: event.clientX, y: event.clientY };
    tooltipContent = `Year: ${point.year}, Quantity: ${quantity}`;
  }
</script>

<style>
  svg {
    width: 100%;
    max-width: 350px;
    border: 1px solid #ccc;
    margin-top: 20px;
  }
  line, .axis-line {
    stroke: #bbb;
    stroke-width: 1;
  }
  .middle-line {
    stroke: red;
    stroke-dasharray: 4;
  }
  circle {
    fill: #0074d9;
    stroke: none;
  }
  text, .axis-label, .tick-label {
    font-size: 12px;
    fill: #333;
    font-weight: normal;
    text-anchor: middle;
  }
  .axis-label {
    font-weight: bold;
  }

  .country-container {
  margin-bottom: 20px;
  }

  select {
  margin-bottom: 20px;
  }
  .tooltip {
    position: fixed;
    pointer-events: none;
    background: rgba(0, 0, 0, 0.6);
    color: white;
    padding: 5px;
    border-radius: 5px;
    font-size: 12px;
  }
</style>

<h1>Order Quantities by Country and Year</h1>

<select on:change={handleCountryChange}>
<option value="">-- Select a country --</option>
{#each Object.keys(chartData) as country}
  <option value={country}>{country}</option>
{/each}
</select>
<h4>The Red line represents the Average of Order Quantity</h4>
{#if selectedCountry}
<div class="country-container">
  <h2>{selectedCountry}</h2>
  <svg viewBox="0 0 {svgWidth} {svgHeight}">
    {#each chartData[selectedCountry] as point, index (point)}
      {#if index < chartData[selectedCountry].length - 1}
        <line x1={point.x} y1={point.y} x2={chartData[selectedCountry][index + 1].x} y2={chartData[selectedCountry][index + 1].y} />
      {/if}
      <circle cx={point.x} cy={point.y} r="3" on:mouseover={event => showTooltip(event, point, data.dataForCharts[selectedCountry][point.year])} on:mouseout={hideTooltip} on:focus={event => showTooltip(event, point, data.dataForCharts[selectedCountry][point.year])} on:blur={hideTooltip} role="button" tabindex="0" />
      <!-- Adding x-ticks and labels -->
      <line class="axis-line" x1={point.x} y1={svgHeight - padding} x2={point.x} y2={svgHeight - padding + 5} />
      <text class="tick-label" x={point.x} y={svgHeight - padding + 15}>{point.year}</text>
    {/each}
    <line class="middle-line" x1="0" x2={svgWidth} y1={middleYValue} y2={middleYValue} />
    <text class="axis-label" x={svgWidth / 2} y={svgHeight - 5}>Order Creation Year</text>
    <text class="axis-label" x={padding / 2} y={svgHeight / 2} transform={`rotate(-90, ${padding / 2}, ${svgHeight / 2})`}>
      Order Quantity
    </text>
  </svg>
</div>
{/if}

{#if tooltip}
<div class="tooltip" style="left: {tooltip.x}px; top: {tooltip.y}px;">
  {tooltipContent}
</div>
{/if}