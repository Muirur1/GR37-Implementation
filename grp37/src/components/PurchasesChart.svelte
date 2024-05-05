<script>
  import { onMount, onDestroy } from 'svelte';
  import Chart from 'chart.js/auto';
  export let chartData;

  let chart;

  onMount(() => {

    // Extract vendor names and their corresponding line and bar chart data
    const lineChartVendorNames = Object.keys(chartData.lineChartData);
    const lineChartVendorData = Object.values(chartData.lineChartData);
    const barChartVendorNames = Object.keys(chartData.barChartData);
    const barChartVendorData = Object.values(chartData.barChartData);

    const colors = [
      'rgba(255, 0, 0)',    
      'rgba(0, 0, 255)', 
      'rgba(0, 128, 0)',  
    ];

    // Prepare line chart datasets for each vendor
    const lineChartDatasets = lineChartVendorNames.map((vendor, index) => ({
      label: `${vendor}`,
      data: lineChartVendorData[index].map(monthData => monthData.average),
      borderColor: colors[index % colors.length],
      backgroundColor: colors[index % colors.length],
      type: 'line',
      yAxisID: 'y-axis-1',
    }));

    const transparentColors = [
      'rgba(255, 0, 0, 0.5)',    
      'rgba(0, 0, 255, 0.5)',  
      'rgba(0, 128, 0, 0.5)',    
    ];

    // Prepare bar chart datasets for each vendor
    const barChartDatasets = barChartVendorNames.map((vendor, index) => ({
      label: `${vendor} Orders`,
      data: barChartVendorData[index].map(monthData => monthData.total),
      backgroundColor: transparentColors[index % transparentColors.length],
      type: 'bar',
      yAxisID: 'y-axis-2',
    }));

    // Create the chart
    const ctx = document.getElementById('myChart').getContext('2d');
    chart = new Chart(ctx, {
      type: 'bar', 
      data: {
        labels: lineChartVendorData[0].map(monthData => monthData.month),
        datasets: [...lineChartDatasets, ...barChartDatasets],
      },
      options: {
        responsive: true,
        plugins: {
          tooltip: {
            mode: 'index',
            intersect: false,
          },
          legend: {
            display: true,
            position: 'left',
            labels: {
              boxWidth: 15,
              padding: 10,
              font: {
                size:10,
                family: 'Arial, sans-serif'
              },
              filter: function(item, data) {
                return data.datasets[item.datasetIndex].type === 'line';
              },
              generateLabels: function(chart) {
                const labels = Chart.defaults.plugins.legend.labels.generateLabels.apply(this, [chart]);
                labels.forEach(label => {
                  label.text = splitLabel(label.text);
                });
                return labels;
              }
            },
            title: {
              display: true,
              text: ['Internal', 'Vendors:'],
              padding: 20,
              font: {
                weight: 'bold', 
                size:12,
                family: 'Arial, sans-serif'
              },
              color: '#000000'
            },
          },
        },
        scales: {
          x: {
            stacked: false, 
            ticks: { 
              maxRotation: 45,
              minRotation: 45,
              font: {
                size: 12,
                family: 'Arial, sans-serif'
              }
            }
          },
          'y-axis-1': {
            type: 'linear',
            display: true,
            position: 'left',
            title: {
              display: true,
              text: 'Receipt Time Deviation',
              font: {
                size: 12,
                family: 'Arial, sans-serif'
              }
            },
            ticks: {  // Add this part
              font: {
                size: 9,  // Set the font size for ticks here
                family: 'Arial, sans-serif'
              }
            } 
          },
          'y-axis-2': {
            type: 'linear',
            display: true,
            position: 'right',
            stacked: false,
            title: {
              display: true,
              text: 'Total Order Quantity per month',
              font: {
                size: 12,
                family: 'Arial, sans-serif'
              }
            },
            grid: {
              drawOnChartArea: false,
            },
            ticks: {
              font: {
                size: 10,
                family: 'Arial, sans-serif'
              }
            }
          },
        },
      },
    });
  });

  function splitLabel(label) {
  const words = label.split(' ');
  if (words.length > 1) {
    return [words.slice(0, Math.ceil(words.length / 2)).join(' '), words.slice(Math.ceil(words.length / 2)).join(' ')];
  }
  return label;
  }
</script>


  
<canvas id="myChart" style="height:225px; width:365px;"></canvas>
  