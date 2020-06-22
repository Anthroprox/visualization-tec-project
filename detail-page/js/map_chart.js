var svg = d3.select("#main_map"),
    width = +svg.attr("width"),
    height = +svg.attr("height");

// Map and projection
var path = d3.geoPath();
var projection = d3.geoNaturalEarth()
    .scale(width / 3 / Math.PI)
    .translate([width / 2, height / 2])
var path = d3.geoPath()
    .projection(projection);

// Data and color scale
var data = d3.map();
var colorScheme = d3.schemeReds[6];
colorScheme.unshift("#eee")
var colorScale = d3.scaleThreshold()
    .domain([1, 6, 11, 26, 101, 1001])
    .range(colorScheme);

// Legend
var g = svg.append("g")
    .attr("class", "legendThreshold")
    .attr("transform", "translate(20,20)");

// Load external data and boot
d3.queue()
    .defer(d3.json, "http://enjalot.github.io/wwsd/data/world/world-110m.geojson")
    .defer(d3.csv, "https://gist.githubusercontent.com/mariors/20c4e7043dd5e8d9042ea944fbe9970d/raw/d18cf84b954e86c502187df576040c0f838c9d14/gistfile1.txt") // Position of circles
    .defer(d3.csv, "https://gist.githubusercontent.com/mariors/5298d78c6de66999cedc2cad39d2c641/raw/f470e3a5378fd43e729cbb263842741d0b445c3d/mooc.csv", function(d) { data.set(d.code, +d.total); })
    .await(ready);

function draw_arrows(country) {
    var projection_arrow = d3.geoNaturalEarth()
        .scale(width / 3 / Math.PI)
        .translate([width / 2.33, height / 2.57]);

    var newData = country.map(record => {
        var coords = projection_arrow([+record.longitude,+record.latitude]);
        var coords_origin = projection_arrow([-80,10]);
        return {source: {x: coords_origin[0], y: coords_origin[1]}, target: {x: coords[0], y:coords[1]}};
    });
    for (d in newData) {
        current = newData[d];
        var svg = d3.select("#main_map").append("g").attr("transform", "translate(100,50)")

        svg.append("svg:defs")
            .append("svg:marker")
            .attr("id", "arrow")
            .attr("refX", 2)
            .attr("refY", 6)
            .attr("markerWidth", 13)
            .attr("markerHeight", 13)
            .attr("orient", "auto")
            .append("svg:path")
            .attr("d", "M2,2 L2,11 L10,6 L2,2");


        var line = d3.line()
            .x(function (point) {
                return point.lx;
            })
            .y(function (point) {
                return point.ly;
            });

        function lineData(d) {
            // i'm assuming here that supplied datum
            // is a link between 'source' and 'target'
            var points = [
                {lx: d.source.x, ly: d.source.y},
                {lx: d.target.x, ly: d.target.y}
            ];
            return line(points);
        }


        var path = svg.append("svg:path")
            // .data([{source: {x: 0, y: 0}, target: {x: 1000, y: 80}}])
            .data([current])
            .attr("class", "line")
            //.style("marker-end", "url(#arrow)")
            .attr("d", lineData)
// var arrow = svg.append("svg:path")
// .attr("d", "M2,2 L2,11 L10,6 L2,2");


        console.log(path)

        var arrow = svg.append("svg:path")
            .attr("d", d3.symbol().type(d3.symbolTriangle)(10, 1));


        arrow.transition()
            .duration(2000)
            .ease(d3.easeLinear)
            .attrTween("transform", translateAlong(path.node()));
// .each("end", transition);


// Returns an attrTween for translating along the specified path element.
        function translateAlong(path) {
            var l = path.getTotalLength();
            var ps = path.getPointAtLength(0);
            var pe = path.getPointAtLength(l);
            var angl = Math.atan2(pe.y - ps.y, pe.x - ps.x) * (180 / Math.PI) - 270;
            var rot_tran = "rotate(" + angl + ")";
            return function (d, i, a) {
                console.log(d);

                return function (t) {
                    var p = path.getPointAtLength(t * l);
                    return "translate(" + p.x + "," + p.y + ") " + rot_tran;
                };
            };
        }

        var totalLength = path.node().getTotalLength();

        path
            .attr("stroke-dasharray", totalLength + " " + totalLength)
            .attr("stroke-dashoffset", totalLength)
            .transition()
            .duration(2000)
            .ease(d3.easeLinear)
            .attr("stroke-dashoffset", 0);

    }
}

function ready(error, topo, country) {
    if (error) throw error;

    // Draw the map
    svg.append("g")
        .attr("class", "countries")
        .selectAll("path")
        .data(topo.features)
        .enter().append("path")
        .attr("fill", function (d){
            // Pull data for this country
            d.total = data.get(d.id) || 0;
            // Set the color
            return colorScale(Math.random()*1000);
        })
        .attr("d", path);

    // --------------------------

    draw_arrows(country);
}
//
// var svg = d3.select("#main_map"),
//     width = +svg.attr("width"),
//     height = +svg.attr("height");
//
// // Map and projection
// var projection = d3.geoMercator()
//     .center([0, 0])                // GPS of location to zoom on
//     .scale(100)                       // This is like the zoom
//     .translate([width / 2, height / 2])
//
// d3.queue()
//     // .defer(d3.json, "https://raw.githubusercontent.com/shawnbot/topogram/master/data/us-states.geojson")  // World shape
//     .defer(d3.json, "http://enjalot.github.io/wwsd/data/world/world-110m.geojson")  // World shape
//     .defer(d3.csv, "https://gist.githubusercontent.com/mariors/20c4e7043dd5e8d9042ea944fbe9970d/raw/d18cf84b954e86c502187df576040c0f838c9d14/gistfile1.txt") // Position of circles
//     .await(ready);
//
// function ready(error, dataGeo, data) {
//
//     // Create a color scale
//
//     // Add a scale for bubble size
//     var valueExtent = d3.extent(data, function (d) {
//         return +d.amount;
//     })
//     var size = d3.scaleSqrt()
//         .domain(valueExtent)  // What's in the data
//         .range([1, 50])  // Size in pixel
//
//     // Draw the map
//     svg.append("g")
//         .selectAll("path")
//         .data(dataGeo.features)
//         .enter()
//         .append("path")
//         .attr("transform", "translate(100,50)")
//         .attr("fill", "#b8b8b8")
//         .attr("d", d3.geoPath()
//             .projection(projection)
//         )
//         .style("stroke", "none")
//         .style("opacity", .3)
//
//     // Add circles:
//     svg
//         .selectAll("myCircles")
//         .data(data.sort(function (a, b) {
//             return +b.amount - +a.amount
//         }).filter(function (d, i) {
//             return i < 1000
//         }))
//         .enter()
//         .append("circle")
//         .attr("cx", function (d) {
//             return projection([+d.longitude, +d.latitude])[0]
//         })
//         .attr("cy", function (d) {
//             return projection([+d.longitude, +d.latitude])[1]
//         })
//         .attr("r", function (d) {
//             return size(+d.amount) * 1 / 2
//         })
//         .style("fill", function (d) {
//             return "green"
//         })
//         .attr("stroke", function (d) {
//             if (d.amount > 2000) {
//                 return "black"
//             } else {
//                 return "none"
//             }
//         })
//         .attr("stroke-width", 1)
//         .attr("fill-opacity", .3)
//
//
//     // Add title and explanation
//
//
//     // --------------- //
//     // ADD LEGEND //
//     // --------------- //
//
//     // Add legend: circles
//
//
//     // Add legend: segments
//     // svg
//     //     .selectAll("legend")
//     //     .data(valuesToShow)
//     //     .enter()
//     //     .append("line")
//     //     .attr('x1', function(d){ return xCircle + size(d) } )
//     //     .attr('x2', xLabel)
//     //     .attr('y1', function(d){ return height - size(d) } )
//     //     .attr('y2', function(d){ return height - size(d) } )
//     //     .attr('stroke', 'black')
//     //     .style('stroke-dasharray', ('2,2'))
//     //
//     // // Add legend: labels
//     // svg
//     //     .selectAll("legend")
//     //     .data(valuesToShow)
//     //     .enter()
//     //     .append("text")
//     //     .attr('x', xLabel)
//     //     .attr('y', function(d){ return height - size(d) } )
//     //     .text( function(d){ return d } )
//     //     .style("font-size", 10)
//     //     .attr('alignment-baseline', 'middle')
//
//
//
//
//
//
//
// }
//
//