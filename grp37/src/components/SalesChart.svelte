<script>
    import { onMount } from 'svelte';
    import Chart from 'chart.js/auto';
    export let customerChartData;

    let customerChart;
    
  
    onMount(() => {
  
      // Assuming lineChartData and barChartData are structured with keys corresponding to different customers
      const lineChartCustomerNames = Object.keys(customerChartData.lineChartData);
      const lineChartCustomerData = Object.values(customerChartData.lineChartData);
      const barChartCustomerNames = Object.keys(customerChartData.barChartData);
      const barChartCustomerData = Object.values(customerChartData.barChartData);
  
      // Prepare line chart datasets for each customer
      const lineChartDatasets = lineChartCustomerNames.map((customer, index) => ({
        label: `${customer}`,
        data: lineChartCustomerData[index].map(monthData => monthData.average),
        borderColor: `hsl(${index * 30}, 70%, 50%)`,
        backgroundColor: `hsl(${index * 30}, 70%, 50%)`,
        fill: false,
        type: 'line',
        yAxisID: 'y-axis-1',
      }));
  
      // Prepare bar chart datasets for each customer
      const barChartDatasets = barChartCustomerNames.map((customer, index) => ({
        label: `${customer} Orders`,
        data: barChartCustomerData[index].map(monthData => monthData.total),
        backgroundColor: `hsl(${index * 30}, 50%, 70%)`,
        stack: 'stackedBar',
        type: 'bar',
        yAxisID: 'y-axis-2',
      }));
  
      // Create the chart
      const ctx = document.getElementById('customerChartCanvas').getContext('2d');
      customerChart = new Chart(ctx, {
        type: 'bar', // base type, mix with line
        data: {
          labels: lineChartCustomerData[0].map(monthData => monthData.month),
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
                padding: 5,
                font: {
                  size:10,
                  family: 'Arial, sans-serif'
                },
                filter: function(item, data) {
                  return data.datasets[item.datasetIndex].type === 'bar';
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
                text: ['Distribution', 'Centers:'],
                padding: 17.5,
                font: {
                  weight: 'bold', 
                  size:12,
                  family: 'Arial, sans-serif'
                },
                color: '#000000' 
              }
            },
          },
          scales: {
            x: {
              stacked: true,
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
                text: 'Delivery Time Deviation',
                font: {
                  size: 11,
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
              stacked: true,
              title: {
                display: true,
                text: 'Total Order Quantity per month',
                font: {
                  size: 11,
                  family: 'Arial, sans-serif'
                }
              },
              grid: {
                drawOnChartArea: false, // only want the grid lines for one axis to show up
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
  
<canvas id="customerChartCanvas" style="height:225px; width:200px; bottom: 0;"></canvas>
  