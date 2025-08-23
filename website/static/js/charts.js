// Charts JavaScript for Framework Performance Dashboard
// Global chart instances for updating
const chartInstances = {};
const originalChartData = {};

// Framework visibility state
let visibleFrameworks = new Set();

// Store original chart data for filtering
function storeOriginalChartData(chartName, chart) {
    if (chartName === 'projectSizePie' || chartName === 'buildTimeDonut') {
        // Already handled separately
        return;
    }
    
    originalChartData[chartName] = {
        labels: chart.data.labels ? [...chart.data.labels] : null,
        datasets: {}
    };
    
    chart.data.datasets.forEach((dataset, index) => {
        const datasetKey = dataset.label || index;
        originalChartData[chartName].datasets[datasetKey] = [...dataset.data];
        
        // Also store color arrays if they exist
        if (Array.isArray(dataset.backgroundColor)) {
            originalChartData[chartName].datasets[datasetKey + '_backgroundColor'] = [...dataset.backgroundColor];
        }
        if (Array.isArray(dataset.borderColor)) {
            originalChartData[chartName].datasets[datasetKey + '_borderColor'] = [...dataset.borderColor];
        }
    });
}

// Initialize framework visibility state
function initializeFrameworkState() {
    const checkboxes = document.querySelectorAll('.framework-toggle');
    checkboxes.forEach(checkbox => {
        if (checkbox.checked) {
            visibleFrameworks.add(checkbox.dataset.framework);
        }
    });
}

// Update chart visibility based on selected frameworks
function updateChartVisibility() {
    Object.entries(chartInstances).forEach(([chartName, chart]) => {
        if (!chart) return;
        
        // Handle different chart types differently
        if (chartName === 'projectSizePie' || chartName === 'buildTimeDonut' || chartName === 'lighthouseRadial') {
            // For pie/donut charts, filter data array directly
            const original = originalChartData[chartName];
            if (!original) return;
            
            const filteredData = [];
            const filteredLabels = [];
            const filteredColors = [];
            const filteredBorderColors = [];
            
            original.labels.forEach((label, index) => {
                const frameworkName = label.toLowerCase();
                const isVisible = Array.from(visibleFrameworks).some(fw => 
                    frameworkName === fw || fw === frameworkName
                );
                
                if (isVisible) {
                    filteredData.push(original.data[index]);
                    filteredLabels.push(label);
                    filteredColors.push(original.backgroundColor[index]);
                    filteredBorderColors.push(original.borderColor[index]);
                }
            });
            
            chart.data.datasets[0].data = filteredData;
            chart.data.labels = filteredLabels;
            chart.data.datasets[0].backgroundColor = filteredColors;
            chart.data.datasets[0].borderColor = filteredBorderColors;
            
        } else {
            // Handle different chart types explicitly
            if (chartName === 'performanceRadar' || 
                chartName === 'buildEfficiencyScatter' || 
                chartName === 'performanceQuadrant' ||
                chartName === 'productionBuildEfficiency') {
                
                // Charts with individual datasets per framework (radar, scatter, polar)
                chart.data.datasets.forEach((dataset, index) => {
                    const frameworkName = dataset.label.toLowerCase();
                    const isVisible = Array.from(visibleFrameworks).some(fw => 
                        frameworkName === fw || fw === frameworkName
                    );
                    
                    // Set dataset visibility
                    chart.setDatasetVisibility(index, isVisible);
                });
                
            } else {
                // Charts with shared labels array (bar, line charts with categorical data)
                const original = originalChartData[chartName];
                if (!original || !original.labels) return;
                
                const filteredIndices = [];
                original.labels.forEach((label, index) => {
                    const frameworkName = label.toLowerCase();
                    const isVisible = Array.from(visibleFrameworks).some(fw => 
                        frameworkName === fw || fw === frameworkName
                    );
                    if (isVisible) {
                        filteredIndices.push(index);
                    }
                });
                
                // Update chart labels
                chart.data.labels = filteredIndices.map(index => original.labels[index]);
                
                // Update each dataset's data and colors
                chart.data.datasets.forEach(dataset => {
                    const originalData = original.datasets[dataset.label || '0'];
                    if (originalData) {
                        dataset.data = filteredIndices.map(index => originalData[index]);
                        
                        // Also filter colors if they exist as arrays
                        if (Array.isArray(dataset.backgroundColor)) {
                            const originalBg = original.datasets[dataset.label + '_backgroundColor'] || dataset.backgroundColor;
                            dataset.backgroundColor = filteredIndices.map(index => originalBg[index]);
                        }
                        if (Array.isArray(dataset.borderColor)) {
                            const originalBorder = original.datasets[dataset.label + '_borderColor'] || dataset.borderColor;
                            dataset.borderColor = filteredIndices.map(index => originalBorder[index]);
                        }
                    }
                });
            }
        }
        
        chart.update('none'); // Update without animation for performance
    });
}

// Handle framework toggle
function handleFrameworkToggle(event) {
    const framework = event.target.dataset.framework;
    
    if (event.target.checked) {
        visibleFrameworks.add(framework);
    } else {
        visibleFrameworks.delete(framework);
    }
    
    updateChartVisibility();
}

// Handle select/deselect all
function handleSelectAll() {
    const checkboxes = document.querySelectorAll('.framework-toggle');
    checkboxes.forEach(checkbox => {
        checkbox.checked = true;
        visibleFrameworks.add(checkbox.dataset.framework);
    });
    updateChartVisibility();
}

function handleDeselectAll() {
    const checkboxes = document.querySelectorAll('.framework-toggle');
    checkboxes.forEach(checkbox => {
        checkbox.checked = false;
        visibleFrameworks.delete(checkbox.dataset.framework);
    });
    updateChartVisibility();
}

// Initialize charts function - to be called from homepage with chartConfigs
function initializeCharts(chartConfigs) {
    // Initialize framework state
    initializeFrameworkState();
    
    // Add event listeners
    document.querySelectorAll('.framework-toggle').forEach(checkbox => {
        checkbox.addEventListener('change', handleFrameworkToggle);
    });
    
    document.getElementById('selectAll').addEventListener('click', handleSelectAll);
    document.getElementById('deselectAll').addEventListener('click', handleDeselectAll);
    
    // Performance Radar Chart
    if (chartConfigs.performance_radar) {
        const radarCtx = document.getElementById('performanceRadar').getContext('2d');
        chartInstances.performanceRadar = new Chart(radarCtx, chartConfigs.performance_radar);
        storeOriginalChartData('performanceRadar', chartInstances.performanceRadar);
    }
    
    // Bundle Size Comparison Chart
    if (chartConfigs.bundle_size_comparison) {
        const bundleCtx = document.getElementById('bundleSizeComparison').getContext('2d');
        chartInstances.bundleSizeComparison = new Chart(bundleCtx, chartConfigs.bundle_size_comparison);
        storeOriginalChartData('bundleSizeComparison', chartInstances.bundleSizeComparison);
    }
    
    // Load Timeline Chart
    if (chartConfigs.load_timeline) {
        const timelineCtx = document.getElementById('loadTimeline').getContext('2d');
        chartInstances.loadTimeline = new Chart(timelineCtx, chartConfigs.load_timeline);
        storeOriginalChartData('loadTimeline', chartInstances.loadTimeline);
    }
    
    // Resource Consumption Chart
    if (chartConfigs.resource_consumption) {
        const resourceCtx = document.getElementById('resourceConsumption').getContext('2d');
        chartInstances.resourceConsumption = new Chart(resourceCtx, chartConfigs.resource_consumption);
        storeOriginalChartData('resourceConsumption', chartInstances.resourceConsumption);
    }
    
    // Build Efficiency Scatter Chart
    if (chartConfigs.build_efficiency_scatter) {
        const scatterCtx = document.getElementById('buildEfficiencyScatter').getContext('2d');
        const scatterConfig = {...chartConfigs.build_efficiency_scatter};
        
        // Add custom tooltip formatter
        scatterConfig.options.plugins.tooltip.callbacks = {
            title: function(ctx) {
                return ctx[0].dataset.label;
            },
            label: function(ctx) {
                const data = ctx.raw;
                return [
                    `Build Time: ${data.buildTime.toFixed(2)}s`,
                    `Bundle Size: ${data.bundleSize.toFixed(1)} KB (gzipped)`,
                    `Compression: ${data.compression.toFixed(1)}x`
                ];
            }
        };
        
        chartInstances.buildEfficiencyScatter = new Chart(scatterCtx, scatterConfig);
        storeOriginalChartData('buildEfficiencyScatter', chartInstances.buildEfficiencyScatter);
    }
    
    // Performance Quadrant Chart
    if (chartConfigs.performance_quadrant) {
        const quadrantCtx = document.getElementById('performanceQuadrant').getContext('2d');
        const quadrantConfig = {...chartConfigs.performance_quadrant};
        
        // Add custom tooltip formatter
        quadrantConfig.options.plugins.tooltip.callbacks = {
            title: function(ctx) {
                return ctx[0].dataset.label;
            },
            label: function(ctx) {
                const data = ctx.raw;
                return [
                    `Performance Score: ${data.performance}`,
                    `Bundle Size: ${data.bundleSize.toFixed(1)} KB (gzipped)`
                ];
            }
        };
        
        chartInstances.performanceQuadrant = new Chart(quadrantCtx, quadrantConfig);
        storeOriginalChartData('performanceQuadrant', chartInstances.performanceQuadrant);
    }
    
    // Lighthouse Radial Chart
    if (chartConfigs.lighthouse_radial) {
        const lighthouseCtx = document.getElementById('lighthouseRadial').getContext('2d');
        chartInstances.lighthouseRadial = new Chart(lighthouseCtx, chartConfigs.lighthouse_radial);
        
        // Store original data for filtering (like pie/donut charts)
        originalChartData.lighthouseRadial = {
            data: [...chartConfigs.lighthouse_radial.data.datasets[0].data],
            labels: [...chartConfigs.lighthouse_radial.data.labels],
            backgroundColor: [...chartConfigs.lighthouse_radial.data.datasets[0].backgroundColor],
            borderColor: [...chartConfigs.lighthouse_radial.data.datasets[0].borderColor]
        };
    }
    
    // Source Analysis Chart
    if (chartConfigs.source_analysis) {
        const sourceCtx = document.getElementById('sourceAnalysis').getContext('2d');
        chartInstances.sourceAnalysis = new Chart(sourceCtx, chartConfigs.source_analysis);
        storeOriginalChartData('sourceAnalysis', chartInstances.sourceAnalysis);
    }
    
    // Project Size Pie Chart
    if (chartConfigs.project_size_pie) {
        const pieCtx = document.getElementById('projectSizePie').getContext('2d');
        const pieConfig = {...chartConfigs.project_size_pie};
        
        // Add custom tooltip formatter
        pieConfig.options.plugins.tooltip.callbacks = {
            label: function(ctx) {
                const label = ctx.label || '';
                const value = ctx.parsed;
                const percentage = ((value / ctx.dataset.data.reduce((a, b) => a + b, 0)) * 100).toFixed(1);
                return `${label}: ${value.toFixed(1)} KB (${percentage}%)`;
            }
        };
        
        chartInstances.projectSizePie = new Chart(pieCtx, pieConfig);
        
        // Store original data for filtering
        originalChartData.projectSizePie = {
            data: [...pieConfig.data.datasets[0].data],
            labels: [...pieConfig.data.labels],
            backgroundColor: [...pieConfig.data.datasets[0].backgroundColor],
            borderColor: [...pieConfig.data.datasets[0].borderColor]
        };
    }
    
    
    // Build Time Donut Chart
    if (chartConfigs.build_time_donut) {
        const donutCtx = document.getElementById('buildTimeDonut').getContext('2d');
        const donutConfig = {...chartConfigs.build_time_donut};
        
        // Add custom tooltip formatter
        donutConfig.options.plugins.tooltip.callbacks = {
            label: function(ctx) {
                const label = ctx.label || '';
                const value = ctx.parsed;
                const percentage = ((value / ctx.dataset.data.reduce((a, b) => a + b, 0)) * 100).toFixed(1);
                return `${label}: ${value.toFixed(2)}s (${percentage}%)`;
            }
        };
        
        chartInstances.buildTimeDonut = new Chart(donutCtx, donutConfig);
        
        // Store original data for filtering
        originalChartData.buildTimeDonut = {
            data: [...donutConfig.data.datasets[0].data],
            labels: [...donutConfig.data.labels],
            backgroundColor: [...donutConfig.data.datasets[0].backgroundColor],
            borderColor: [...donutConfig.data.datasets[0].borderColor]
        };
    }
    
    // Dev Server Performance Chart
    if (chartConfigs.dev_server_performance) {
        const devServerCtx = document.getElementById('devServerPerformance').getContext('2d');
        chartInstances.devServerPerformance = new Chart(devServerCtx, chartConfigs.dev_server_performance);
        storeOriginalChartData('devServerPerformance', chartInstances.devServerPerformance);
    }
    
    // Production Build Efficiency Chart
    if (chartConfigs.production_build_efficiency) {
        const prodBuildCtx = document.getElementById('productionBuildEfficiency').getContext('2d');
        const prodBuildConfig = {...chartConfigs.production_build_efficiency};
        
        // Add custom tooltip formatter
        prodBuildConfig.options.plugins.tooltip.callbacks = {
            title: function(ctx) {
                return ctx[0].dataset.label || 'Framework';
            },
            label: function(ctx) {
                return `Build: ${ctx.parsed.x.toFixed(1)}s, Output: ${ctx.parsed.y}MB`;
            }
        };
        
        chartInstances.productionBuildEfficiency = new Chart(prodBuildCtx, prodBuildConfig);
        storeOriginalChartData('productionBuildEfficiency', chartInstances.productionBuildEfficiency);
    }
}