const countyDataUrl = "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json";
const educationDataUrl = "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json";

const width = 960;  // Set desired width
const height = 900; // Set desired height

Promise.all([
    d3.json(countyDataUrl),
    d3.json(educationDataUrl)
]).then(data => {
    const countyData = data[0];
    const educationData = data[1];
    drawMap(countyData, educationData);
    createLegend(educationData);
});

const svg = d3.select("#map")
    .attr("width", width)
    .attr("height", height);

// Draw the map
const drawMap = (countyData, educationData) => {
    const educationById = {};
    educationData.forEach(d => {
        educationById[d.fips] = d;
    });

    const colorScale = d3.scaleQuantize()
        .domain([d3.min(educationData, d => d.bachelorsOrHigher), d3.max(educationData, d => d.bachelorsOrHigher)])
        .range(d3.schemeBlues[9]);

    const path = d3.geoPath();

    svg.append("g")
        .attr("transform", "translate(0, 100)")
        .selectAll("path")
        .data(topojson.feature(countyData, countyData.objects.counties).features)
        .enter()
        .append("path")
        .attr("d", path)
        .attr("class", "county")
        .attr("fill", d => {
            const result = educationById[d.id];
            return result ? colorScale(result.bachelorsOrHigher) : "#ccc";
        })
        .attr("data-fips", d => d.id)
        .attr("data-education", d => educationById[d.id] ? educationById[d.id].bachelorsOrHigher : 0);

    // Add title and description
    svg.append('text')
        .attr('id', 'title')
        .attr('x', width / 2)  
        .attr('y', 50)   
        .attr('text-anchor', 'middle')  
        .style('font-size', '50px')
        .style('font-weight', 'bold')  
        .text('Education of America');

    svg.append('text')
        .attr('id', 'description')
        .attr('x', width / 2)  
        .attr('y', 90)   
        .attr('text-anchor', 'middle')  
        .style('font-size', '25px')  
        .text('Color represents the percentage of education');
    
    // Tooltip setup
    const tooltip = d3.select("body").append("div")
        .attr("id", "tooltip")
        .style("opacity", 0);

    svg.selectAll(".county")
        .on("mouseover", (event, d) => {
            const educationData = educationById[d.id];
            tooltip.transition()
                .duration(200)
                .style("opacity", .9);
            tooltip.html(`${educationData.area_name}<br>Education: ${educationData.bachelorsOrHigher}%`)
                .attr("data-education", educationData.bachelorsOrHigher)
                .style("left", (event.pageX + 5) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", () => {
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        });
};

const createLegend = (educationData) => {
    const legendWidth = 700;  // Width of the legend
    const legendHeight = 50;   // Height of the legend
    const legendY = height - 70; // Positioning the legend near the bottom of the SVG

    // Define the color scale using quantize
    const colorScale = d3.scaleQuantize()
        .domain([d3.min(educationData, d => d.bachelorsOrHigher), d3.max(educationData, d => d.bachelorsOrHigher)])
        .range(d3.schemeBlues[9]);

    // Create the legend group
    const legend = svg.append("g")
        .attr("id", "legend")
        .attr("transform", `translate(${width - legendWidth - 100}, ${legendY})`);

    // Create the rectangles for the legend
    legend.selectAll(".legend-rect")
        .data(colorScale.range())
        .enter()
        .append("rect")
        .attr("class", "legend-rect")
        .attr("x", (d, i) => i * (legendWidth / colorScale.range().length))
        .attr("y", 0)
        .attr("width", legendWidth / colorScale.range().length)
        .attr("height", legendHeight)
        .attr("fill", d => d); // Use the color directly from the scale

    // Add labels below the rectangles
    legend.selectAll(".legend-label")
        .data(colorScale.range().map(d => colorScale.invertExtent(d)))
        .enter()
        .append("text")
        .attr("class", "legend-label")
        .style('font-weight', 'bold')
        .style('font-size', '15px')  // Added 'px'
        .attr("x", (d, i) => i * (legendWidth / colorScale.range().length) + (legendWidth / (colorScale.range().length * 2)) + 5) // Adjust for more gap
        .attr("y", legendHeight + 20)
        .attr("text-anchor", "middle")
        .text(d => {
            const min = Math.round(d[0]);
            const max = Math.round(d[1]);
            return `${min}% - ${max}%`; // Display percentage range
        })
};





