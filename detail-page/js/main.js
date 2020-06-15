// The svg
var svg = d3.select("svg"),
    width = +svg.attr("width"),
    height = +svg.attr("height");

// Map and projection
var projection = d3.geoMercator()
    .center([0,0])                // GPS of location to zoom on
    .scale(100)                       // This is like the zoom
    .translate([ width/2, height/2 ])

d3.queue()
    // .defer(d3.json, "https://raw.githubusercontent.com/shawnbot/topogram/master/data/us-states.geojson")  // World shape
    .defer(d3.json, "http://enjalot.github.io/wwsd/data/world/world-110m.geojson")  // World shape
    .defer(d3.csv, "https://gist.githubusercontent.com/mariors/20c4e7043dd5e8d9042ea944fbe9970d/raw/d18cf84b954e86c502187df576040c0f838c9d14/gistfile1.txt") // Position of circles
    .await(ready);

function ready(error, dataGeo, data) {

    // Create a color scale

    // Add a scale for bubble size
    var valueExtent = d3.extent(data, function(d) { return +d.amount; })
    var size = d3.scaleSqrt()
        .domain(valueExtent)  // What's in the data
        .range([ 1, 50])  // Size in pixel

    // Draw the map
    svg.append("g")
        .selectAll("path")
        .data(dataGeo.features)
        .enter()
        .append("path")
        .attr("fill", "#b8b8b8")
        .attr("d", d3.geoPath()
            .projection(projection)
        )
        .style("stroke", "none")
        .style("opacity", .3)

    // Add circles:
    svg
        .selectAll("myCircles")
        .data(data.sort(function(a,b) { return +b.amount - +a.amount }).filter(function(d,i){ return i<1000 }))
        .enter()
        .append("circle")
        .attr("cx", function(d){ return projection([+d.longitude, +d.latitude])[0] })
        .attr("cy", function(d){ return projection([+d.longitude, +d.latitude])[1] })
        .attr("r", function(d){ return size(+d.amount) * 1/2 })
        .style("fill", function(d){ return "green" })
        .attr("stroke", function(d){ if(d.amount>2000){return "black"}else{return "none"}  })
        .attr("stroke-width", 1)
        .attr("fill-opacity", .3)



    // Add title and explanation



    // --------------- //
    // ADD LEGEND //
    // --------------- //

    // Add legend: circles


    // Add legend: segments
    svg
        .selectAll("legend")
        .data(valuesToShow)
        .enter()
        .append("line")
        .attr('x1', function(d){ return xCircle + size(d) } )
        .attr('x2', xLabel)
        .attr('y1', function(d){ return height - size(d) } )
        .attr('y2', function(d){ return height - size(d) } )
        .attr('stroke', 'black')
        .style('stroke-dasharray', ('2,2'))

    // Add legend: labels
    svg
        .selectAll("legend")
        .data(valuesToShow)
        .enter()
        .append("text")
        .attr('x', xLabel)
        .attr('y', function(d){ return height - size(d) } )
        .text( function(d){ return d } )
        .style("font-size", 10)
        .attr('alignment-baseline', 'middle')
}