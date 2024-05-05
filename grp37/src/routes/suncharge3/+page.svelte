<script>
    import { onMount } from 'svelte';
    import * as d3 from 'd3';
    import { scaleLinear, scaleOrdinal } from 'd3-scale';
    import { schemeDark2 } from 'd3-scale-chromatic';
    import { feature } from 'topojson-client';
    import { geoPath, geoMercator } from 'd3-geo';
    import * as d3Tip from 'd3-tip';

    export let data;    

    const scaleX = scaleLinear().domain([3, 9]).range([0,600])
    const scaleY = scaleLinear().domain([7, 31]).range([0,600])
    const scaleColour = scaleLinear().domain([3, 9]).range(["red", "green"])
    const categories = [...new Set(data.mergedData.map(v => v.CustomerCountry))]
    const fill = scaleOrdinal(schemeDark2).domain(categories)
    let europe;

    let chartContainer2;
    let chartContainer3;
    let chartContainer4;

    let selectedPlantKey;
    let selectedCustomerCountry;
    let selectedMaterialType;

    let newData;

    function filterData() {
        const filteredData = newData.filter(d =>
            (!selectedPlantKey || d.PlantName === selectedPlantKey) &&
            (!selectedCustomerCountry || d.CustomerCountry === selectedCustomerCountry) &&
            (!selectedMaterialType || d.MaterialDescription === selectedMaterialType)
        );

        drawChart2(filteredData, chartContainer2);
        drawChart3(filteredData, chartContainer3);

        const url = "https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json";

        d3.json(url).then(data => {
            const europe = data.features.filter(feature => {
                const europeCountries = ["Albania", "Andorra", "Austria", "Belgium", "Bulgaria", "Bosnia and Herzegovina", "Belarus", "Switzerland", "Cyprus", "Czech Republic", "Germany", "Denmark", "Spain", "Estonia", "Finland", "France", "United Kingdom", "Greece", "Croatia", "Hungary", "Ireland", "Iceland", "Italy", "Kosovo", "Liechtenstein", "Lithuania", "Luxembourg", "Latvia", "Monaco", "Moldova", "Macedonia", "Malta", "Montenegro", "Netherlands", "Norway", "Poland", "Portugal", "Romania", "Russia", "San Marino", "Serbia", "Slovakia", "Slovenia", "Sweden", "Ukraine", "Vatican City"];
                return europeCountries.includes(feature.properties.name);
            });

            const selectedCountry = newData.find(data => data.CustomerCountry === selectedCustomerCountry) ? selectedCustomerCountry : null;

            drawCountryChart({type: "FeatureCollection", features: europe}, selectedCountry);
        });

    }
    onMount(() => {
        newData = data.mergedData.map(obj => ({
            ...obj,
            year: new Date(obj.DeliveryDate).getFullYear(),
            quarter: 'Q' + (Math.floor(new Date(obj.DeliveryDate).getMonth() / 3) + 1),
            yearQuarter: new Date(obj.DeliveryDate).getFullYear() + '-Q' + (Math.floor(new Date(obj.DeliveryDate).getMonth() / 3) + 1) // Format year and quarter
        }))
        .reduce((acc, obj) => {
            const key = [obj.PlantName, obj.yearQuarter, obj.CustomerCountry, obj.MaterialDescription].join('-');
            if (!acc[key]) {
                acc[key] = {
                PlantName: obj.PlantName,
                yearQuarter: obj.yearQuarter,
                CustomerCountry: obj.CustomerCountry,
                PlantCity: obj.PlantCity,
                MaterialDescription: obj.MaterialDescription,
                customer: new Set(),
                Customers: 0,
                SumOrders: 0
                };
            }
            acc[key].customer.add(obj.CustomerKey);
            acc[key].Customers = acc[key].customer.size;
            acc[key].SumOrders += parseFloat(obj.OrderQuantity);
            return acc;
        }, {});

        for (const key in newData){
            delete newData[key].customer;
        }

        newData = Object.values(newData);

        newData.sort((a, b) => a.yearQuarter.localeCompare(b.yearQuarter));

        const plantKeys = [...new Set(newData.map(d => d.PlantName))];
        const customerCountries = [...new Set(newData.map(d => d.CustomerCountry))];
        const materialTypes = [...new Set(newData.map(d => d.MaterialDescription))];

        selectedPlantKey = plantKeys[0];
        selectedCustomerCountry = customerCountries[0];
        selectedMaterialType = materialTypes[0];

        const plantKeySelect = document.getElementById('plantKey');
        plantKeys.forEach(key => {
            const option = document.createElement('option');
            option.value = key;
            option.text = key;
            plantKeySelect.appendChild(option);
        });

        const customerCountrySelect = document.getElementById('customerCountry');
        customerCountries.forEach(country => {
            const option = document.createElement('option');
            option.value = country;
            option.text = country;
            customerCountrySelect.appendChild(option);
        });

        customerCountrySelect.addEventListener('change', (event) => {
            selectedCustomerCountry = event.target.value;
            const countryGeoJson = europe.find(d => d.properties.name === selectedCustomerCountry);
            if (countryGeoJson) {
                drawCountryChart(countryGeoJson, selectedCustomerCountry);
            }
            filterData();
        });

        const materialTypeSelect = document.getElementById('materialType');
        materialTypes.forEach(type => {
            const option = document.createElement('option');
            option.value = type;
            option.text = type;
            materialTypeSelect.appendChild(option);
        });        

        plantKeySelect.addEventListener('change', (event) => {
            selectedPlantKey = event.target.value;
            filterData();
        });

        materialTypeSelect.addEventListener('change', (event) => {
            selectedMaterialType = event.target.value;
            filterData();
        });

        document.getElementById('plantKey').addEventListener('change', (event) => {
            selectedPlantKey = event.target.value;
            filterData();
        });

        document.getElementById('customerCountry').addEventListener('change', (event) => {
            selectedCustomerCountry = event.target.value;
            filterData();
        });

        document.getElementById('materialType').addEventListener('change', (event) => {
            selectedMaterialType = event.target.value;
            filterData();
        });

        filterData();

  });

    function drawChart2(data, container) {
        const margin = {top: 20, right: 20, bottom: 30, left: 50}; 
        const width = 500;
        const height = 500;
        const innerRadius = 0;
        const outerRadius = Math.min(width, height) / 2 - 50;

        const parseTime = d3.timeParse("%Y-Q%q");

        const x = d3.scaleTime()
            .domain(d3.extent(data, d => parseTime(d.yearQuarter)))
            .range([0, 2 * Math.PI]);

        const y = d3.scaleRadial()
            .domain([0, d3.max(data, d => d.Customers)])
            .range([innerRadius + 100, outerRadius]);

        d3.select(container).selectAll("*").remove();

        const svg = d3.select(container).append("svg")
            .attr("width", width)
            .attr("height", height)
            .append("g")
            .attr("transform", `translate(${width / 2}, ${height / 2})`);

        createXAxis(svg, x, innerRadius, outerRadius);

        const line = d3.lineRadial()
            .angle(d => x(parseTime(d.yearQuarter)))
            .radius(d => y(d.Customers));

        const yAxis = g => g
            .selectAll("g")
            .data(y.ticks(5).reverse())
            .join("g")
            .attr("fill", "none")
            .attr("stroke", "currentColor")
            .attr("stroke-opacity", 0.1)
            .attr("stroke-width", d => y(d))
            .call(g => g.append("circle")
                .attr("stroke-width", 3)
                .attr("r", y))
            .call(g => g.append("text")
                .attr("y", d => -y(d))
                .attr("dy", "0.35em")
                .attr("stroke", "white")
                .attr("stroke-width", 5)
                .text(y.tickFormat(5, "s"))
                .clone(true)
                .attr("fill", "currentColor")
                .attr("stroke", "none"));

        const radialLines = svg.append("g")
            .selectAll("line")
            .data(x.ticks())
            .join("line")
            .attr("y2", -outerRadius)
            .attr("transform", d => `rotate(${(x(d) * 180 / Math.PI - 90)})`);

        svg.append("path")
            .datum(data)
            .attr("fill", "none")
            .attr("stroke", "steelblue")
            .attr("d", line);

        svg.selectAll("circle.point")
            .data(data)
            .enter().append("circle")
            .attr("class", "point")
            .attr("transform", d => `translate(${line([d]).slice(1, -1)})`)
            .attr("r", 3)
            .attr("fill", "red");

        const points = svg.selectAll("circle.point")
            .data(data)
            .enter().append("circle")
            .attr("class", "point")
            .attr("transform", d => `translate(${line([d]).slice(1, -1)})`)
            .attr("r", 3)
            .attr("fill", "red");

        svg.selectAll("text.pointLabel")
            .data(data)
            .enter().append("text")
            .attr("class", "pointLabel")
            .attr("transform", d => `translate(${line([d]).slice(1, -1)})`)
            .attr("dx", 5)
            .attr("dy", ".35em")
            .attr("font-size", "15px")
            .text(d => d.Customers);

        svg.append("text")
            .attr("x", 0)
            .attr("y", 0 - (margin.top / 2))
            .attr("text-anchor", "middle")
            .style("font-size", "20px")
            .text("Summary by Count of Customers per quarter");

        svg.append("g")
            .call(yAxis);        
            
    }
    function drawChart3(data, container) {
        
        const margin = {top: 20, right: 20, bottom: 30, left: 50}; 
        const width = 500;
        const height = 500;
        const innerRadius = 0;
        const outerRadius = Math.min(width, height) / 2 - 50;

        const parseTime = d3.timeParse("%Y-Q%q");

        const x = d3.scaleTime()
            .domain(d3.extent(data, d => parseTime(d.yearQuarter)))
            .range([0, 2 * Math.PI]);

        const y = d3.scaleRadial()
            .domain([0, d3.max(data, d => d.SumOrders)])
            .range([innerRadius + 100, outerRadius]);

        d3.select(container).selectAll("*").remove();

        const svg = d3.select(container).append("svg")
            .attr("width", width)
            .attr("height", height)
            .append("g")
            .attr("transform", `translate(${width / 2}, ${height / 2})`);

        createXAxis(svg, x, innerRadius, outerRadius);

        const line = d3.lineRadial()
            .angle(d => x(parseTime(d.yearQuarter)))
            .radius(d => y(d.SumOrders));

        const yAxis = g => g
            .selectAll("g")
            .data(y.ticks(5).reverse())
            .join("g")
            .attr("fill", "none")
            .attr("stroke", "currentColor")
            .attr("stroke-opacity", 0.1)
            .attr("stroke-width", d => y(d))
            .call(g => g.append("circle")
                .attr("stroke-width", 3)
                .attr("r", y))
            .call(g => g.append("text")
                .attr("y", d => -y(d))
                .attr("dy", "0.35em")
                .attr("stroke", "white")
                .attr("stroke-width", 5)
                .text(y.tickFormat(5, "s"))
                .clone(true)
                .attr("fill", "currentColor")
                .attr("stroke", "none"));

        const radialLines = svg.append("g")
            .selectAll("line")
            .data(x.ticks())
            .join("line")
            .attr("y2", -outerRadius)
            .attr("transform", d => `rotate(${(x(d) * 180 / Math.PI - 90)})`);

        svg.append("path")
            .datum(data)
            .attr("fill", "none")
            .attr("stroke", "red")
            .attr("d", line);

        svg.selectAll("circle.point")
            .data(data)
            .enter().append("circle")
            .attr("class", "point")
            .attr("transform", d => `translate(${line([d]).slice(1, -1)})`)
            .attr("r", 3)
            .attr("fill", "steelblue");

        const points = svg.selectAll("circle.point")
            .data(data)
            .enter().append("circle")
            .attr("class", "point")
            .attr("transform", d => `translate(${line([d]).slice(1, -1)})`)
            .attr("r", 3)
            .attr("fill", "red");

        svg.selectAll("text.pointLabel")
            .data(data)
            .enter().append("text")
            .attr("class", "pointLabel")
            .attr("transform", d => `translate(${line([d]).slice(1, -1)})`)
            .attr("dx", 5)
            .attr("dy", ".35em")
            .attr("font-size", "15px")
            .text(d => d.SumOrders);

        svg.append("text")
            .attr("x", 0)
            .attr("y", 0 - (margin.top / 2))
            .attr("text-anchor", "middle")
            .style("font-size", "20px")
            .text("Summary by Sum of Orders per quarter");

        svg.append("g")
            .call(yAxis);        
            
    }

    function createXAxis(svg, x, innerRadius, outerRadius) {
        const ticks = x.ticks(12);
        const g = svg.append("g");

        ticks.forEach(tick => {
            const angle = (x(tick) * 180 / Math.PI);
            const y = (outerRadius) + 40;

            g.append("text")
                .attr("transform", `rotate(${angle}) translate(0, ${-y})`)
                .attr("text-anchor", angle < 180 ? "start" : "end")
                .attr("dy", "0.35em")
                .text(d3.timeFormat("%Y-Q%q")(tick));

            g.append("line")
                .attr("y1", -outerRadius)
                .attr("y2", -y)
                .attr("transform", `rotate(${angle})`);
        });
    }

    function drawCountryChart(europe, selectedCustomerCountry) {
        const width = 1005;
        const height = 500;

        const projection = d3.geoMercator().fitSize([width, height], europe);
        const path = d3.geoPath().projection(projection);

        d3.select("#parent-container").selectAll("*").remove();

        const svg = d3.select("#parent-container").append("svg")
            .attr("width", width)
            .attr("height", height);

        const g =svg.append("g")

        const sumOrdersPerCountry = Array.from(d3.rollup(newData, 
            v => d3.sum(v, d => d.SumOrders),
            d => d.CustomerCountry
        ), ([key, value]) => ({key, value}));

        const countriesServedByPlant = sumOrdersPerCountry.filter(d => checkIfPlantServesCountry(selectedPlantKey, d.key));

        const maxSumOrders = d3.max(countriesServedByPlant, d => d.value);

        const colorScale = d3.scaleLinear()
            .domain([0, maxSumOrders])
            .range(["lightyellow", "yellow"]);

        g.selectAll("path")
            .data(europe.features)
            .enter().append("path")
            .attr("d", path)
            .attr("fill", d => {
                if (d.properties.name === selectedCustomerCountry){
                    return "orange";
                } else if(checkIfPlantServesCountry(selectedPlantKey, d.properties.name) ){
                    const countryData = countriesServedByPlant.find(data => data.key === d.properties.name);
                    return countryData ? colorScale(countryData.value) : "lightyellow";
                }
                else {
                    return "teal";
                }
            })
            .attr("stroke", "black");

        const filteredData = newData.filter(d => d.CustomerCountry === selectedCustomerCountry);

        const filteredData2 = newData.filter(d => d.PlantName === selectedPlantKey);

        const totalPerMaterial = Array.from(d3.rollup(filteredData, 
            v => ({ SumOrders: d3.sum(v, d => d.SumOrders), Customers: d3.sum(v, d => d.Customers) }),
            d => d.MaterialDescription
        ), ([key, value]) => ({key, value}));

        const totalPerPlant = Array.from(d3.rollup(newData, 
            v => ({ SumOrders: d3.sum(v, d => d.SumOrders), Customers: d3.sum(v, d => d.Customers) }),
            d => d.PlantName
        ), ([key, value]) => ({key, value}));

        const overallSum = d3.sum(filteredData, d => d.SumOrders);
        const overallCount = d3.sum(filteredData, d => d.Customers);

        const infoDiv = d3.select("#parent-container").append("div")
            .attr("class", "info");

        totalPerMaterial.forEach(MaterialDescription => {
            infoDiv.append("p")
                .text(`${MaterialDescription.key}, Total Orders: ${MaterialDescription.value.SumOrders}, Total Customers: ${MaterialDescription.value.Customers}`);
        });

        function checkIfPlantServesCountry(plantName, countryName) {
            return newData.some(d => d.PlantName === plantName && d.CustomerCountry === countryName);
        }

        totalPerPlant.forEach(PlantName => {
            const plantServesCountry = checkIfPlantServesCountry(PlantName.key, selectedCustomerCountry);
            const plantInfo = infoDiv.append("p")
                .text(`${PlantName.key}, Total Orders: ${PlantName.value.SumOrders}, Total Customers: ${PlantName.value.Customers}`);
            
            if (plantServesCountry) {
                plantInfo.style("color", "red"); 
                plantInfo.style("background-color", "yellow"); 
            }
        });

        infoDiv.append("p")
            .text(`Overall Orders: ${overallSum}, Overall Customers: ${overallCount}`);
            

        infoDiv.style("position", "absolute")
            .style("left", "10px")
            .style("top", "10px")
            .style("background-color", "white")
            .style("padding", "10px")
            .style("border-radius", "5px");

        const zoom = d3.zoom()
            .scaleExtent([1, 8])
            .on("zoom", function(event) {
                g.attr("transform", event.transform);
            });

        const legendScale = d3.scaleLinear()
            .domain([0, maxSumOrders])
            .range([0, 200]);  
            
        const legend = svg.append("g")
            .attr("transform", "translate("+ (width - 100) + "," + (height - 220) + ")");

        const gradient = legend.append("defs")
            .append("linearGradient")
            .attr("id", "gradient")
            .attr("x1", "0%")
            .attr("y1", "100%")
            .attr("x2", "0%")
            .attr("y2", "0%");

        gradient.selectAll("stop")
            .data(colorScale.range())
            .enter().append("stop")
            .attr("offset", (d, i) => i / (colorScale.range().length - 1))
            .attr("stop-color", d => d);

        legend.append("rect")
            .attr("width", 20)
            .attr("height", 200)
            .style("fill", "url(#gradient)");

        const legendAxis = d3.axisRight(legendScale)
            .tickFormat(d3.format(".0f"));

        legend.append("g")
            .attr("transform", "translate(20,0)")
            .call(legendAxis);

        svg.call(zoom);
    }
</script>

<svg width="500" height="500" bind:this={chartContainer2}></svg>

<svg width="500" height="500" bind:this={chartContainer3}></svg>

<div style="display: flex;">
    <div id="chart"></div>
    <div id="filters">
        <label for="plantKey">Plant:</label>
        <select id="plantKey">
        </select>
        <label for="customerCountry">Country:</label>
        <select id="customerCountry">
        </select>
        <label for="materialType">Product:</label>
        <select id="materialType">
        </select>
    </div>
    <div id="chart"></div>
</div>
<div id="parent-container" style="position:relative;">
    <svg width="1005" height="400" bind:this={chartContainer4}></svg>
</div>
<style>
    svg{
        fill: teal;
        border: 1px;
        border-style: solid;
    }
    circle {
      fill-opacity: 0.5;
    }
    .tooltip {
        position: absolute;
        text-align: center;
        width: 120px;
        height: 45px;
        padding: 2px;
        font: 12px sans-serif;
        background: lightsteelblue;
        border: 0px;
        border-radius: 8px;
        pointer-events: none;
    }
</style>