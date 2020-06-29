// http://bl.ocks.org/palewire/d2906de347a160f38bc0b7ca57721328#mooc-countries.csv
// https://github.com/d3/d3-scale-chromatic

var data_map = d3.map();
var position_map = d3.map();
var inflow_map = d3.map();
var outflow_map = d3.map();

function load_inflow_outflow_maps(type_map_path, function_color_map) {
    // The svg
    var inflow = d3.select("#inflow_map"),
        inflow_width = +inflow.attr("width"),
        inflow_height = +inflow.attr("height");

    var outflow = d3.select("#outflow_map"),
        outflow_width = +inflow.attr("width"),
        outflow_height = +inflow.attr("height");


    // Map and projection
    var inflow_projection = d3.geoNaturalEarth()
        .center([0,0])                // GPS of location to zoom on
        .scale(100)                       // This is like the zoom
        .translate([ inflow_width/2, inflow_height/2 ])

    var outflow_projection = d3.geoNaturalEarth()
        .center([0,0])                // GPS of location to zoom on
        .scale(100)                       // This is like the zoom
        .translate([ outflow_width/2, outflow_height/2 ])


    var position_mapper = (row) => {
        position_map.set(row.code,row)
        return row;
    }

    var inflow_mapper = (row) =>{
        inflow_map.set(row.code,row);
        return row;
    }

    var outflow_mapper = (row) =>{
        outflow_map.set(row.code,row);
        return row;
    }


    d3.queue()
        // .defer(d3.json, "https://raw.githubusercontent.com/shawnbot/topogram/master/data/us-states.geojson")  // World shape
        .defer(d3.json, "http://enjalot.github.io/wwsd/data/world/world-110m.geojson")  // World shape
        .defer(d3.csv, type_map_path,function(d) { data_map.set(d.code, +d.total); return d;})
        .defer(d3.csv, "https://gist.githubusercontent.com/mariors/7ec6842e93dcc36858c99998009549aa/raw/38307b0f7ac48cdf9d1187d9925fa1c136b978fa/country_location.csv", position_mapper) // Country Position
        .defer(d3.csv, "https://gist.githubusercontent.com/Anthroprox/c6fbf8c7c22988087f7b5cbd5f572b0e/raw/178c84df45ab42d947eda2715e0de732777d9ec7/inflow",inflow_mapper) // Inflow
        .defer(d3.csv, "https://gist.githubusercontent.com/Anthroprox/c6fbf8c7c22988087f7b5cbd5f572b0e/raw/178c84df45ab42d947eda2715e0de732777d9ec7/outflow",outflow_mapper) // Outflow
        .await(ready);

    var global_dataGeo = undefined;

    function ready(error, dataGeo, data, position, inflow_percentage, outflow_percentage) {
        global_dataGeo = dataGeo
        // console.log(error);
        // console.log(dataGeo);
        // console.log(data);
        // console.log(position)
        // console.log(inflow_percentage);
        // console.log(outflow_percentage);

        // Create a color scale

        // Add a scale for bubble size
        var size_inflow = d3.scaleSqrt()
            // .domain(d3.extent(position, function(row) { return inflow_map.get(row.code)? +inflow_map.get(row.code).percentage : 0; }))  // What's in the data
            .domain([0, 1])
            .range([ 1, 3])  // Size in pixel

        var size_out = d3.scaleSqrt()
            // .domain(d3.extent(position, function(row) { return inflow_map.get(row.code)? +inflow_map.get(row.code).percentage : 0; }))  // What's in the data
            .domain([0, 1])
            .range([ 1, 3])  // Size in pixel


        // Draw the map
        inflow.append("g")
            .attr("class", "countries")
            .selectAll("path")
            .data(dataGeo.features)
            .enter()
            .append("path")
            .attr("fill", function_color_map)
            .attr("d", d3.geoPath()
                .projection(inflow_projection)
            )
            .style("opacity", .3)

        // Add circles:
        inflow
            .selectAll("circles_inflow")
            .data(inflow_percentage)
            .enter()
            .append("circle")
            .attr("cx", function(row){ var location = position_map.get(row.code); return inflow_projection([+location.longitude, +location.latitude])[0] })
            .attr("cy", function(row){ var location = position_map.get(row.code); return inflow_projection([+location.longitude, +location.latitude])[1]; })
            .attr("r", function(row) { return size_inflow(inflow_map.get(row.code)? +inflow_map.get(row.code).percentage : 0); })
            .style("fill", function(row){ return "green" })
            .attr("stroke", function(row){ return "none" })
            .attr("stroke-width", 1)
            .attr("fill-opacity", .3)


        // Draw the map
        outflow.append("g")
            .attr("class", "countries")
            .selectAll("path")
            .data(dataGeo.features)
            .enter()
            .append("path")
            .attr("fill", function_color_map)
            .attr("d", d3.geoPath()
                .projection(inflow_projection)
            )
            .style("opacity", .3)

        // Add circles:
        outflow
            .selectAll("circles_outflow")
            .data(outflow_percentage)
            .enter()
            .append("circle")
            .attr("cx", function(row){ var location = position_map.get(row.code); return inflow_projection([+location.longitude, +location.latitude])[0] })
            .attr("cy", function(row){ var location = position_map.get(row.code); return inflow_projection([+location.longitude, +location.latitude])[1]; })
            .attr("r", function(row) { return size_inflow(outflow_map.get(row.code)? +outflow_map.get(row.code).percentage : 0); })
            .style("fill", function(row){ return "red" })
            .attr("stroke", function(row){ return "none" })
            .attr("stroke-width", 1)
            .attr("fill-opacity", .3)

        // Add title and explanation



        // --------------- //
        // ADD LEGEND //
        // --------------- //

        // Add legend: circles


        // Add legend: segments
        inflow
            .selectAll("legend")
            // .data(valuesToShow)
            .enter()
            .append("line")
            .attr('x1', function(d){ return xCircle + size(d) } )
            // .attr('x2', xLabel)
            .attr('y1', function(d){ return inflow_height - size(d) } )
            .attr('y2', function(d){ return inflow_height - size(d) } )
            .attr('stroke', 'black')
            .style('stroke-dasharray', ('2,2'))

        // Add legend: labels
        outflow
            .selectAll("legend")
            // .data(valuesToShow)
            .enter()
            .append("text")
            // .attr('x', xLabel)
            .attr('y', function(d){ return outflow_height - size(d) } )
            .text( function(d){ return d } )
            .style("font-size", 10)
            .attr('alignment-baseline', 'middle')

        // Add legend: segments
        outflow
            .selectAll("legend")
            // .data(valuesToShow)
            .enter()
            .append("line")
            .attr('x1', function(d){ return xCircle + size(d) } )
            // .attr('x2', xLabel)
            .attr('y1', function(d){ return inflow_height - size(d) } )
            .attr('y2', function(d){ return inflow_height - size(d) } )
            .attr('stroke', 'black')
            .style('stroke-dasharray', ('2,2'))

        // Add legend: labels
        outflow
            .selectAll("legend")
            // .data(valuesToShow)
            .enter()
            .append("text")
            // .attr('x', xLabel)
            .attr('y', function(d){ return outflow_height - size(d) } )
            .text( function(d){ return d } )
            .style("font-size", 10)
            .attr('alignment-baseline', 'middle')
    }
}

var colorScheme_blue = d3.schemeBlues[6];
colorScheme_blue.unshift("#eee")
var colorScale_blue = d3.scaleThreshold()
    .domain([1, 6, 11, 26, 101, 1001])
    .range(colorScheme_blue);


function_mapping_blue  = (d) => {
    // Pull data for this country
    d.total = data_map.get(d.id) || 0;
    // Set the color
    return colorScale_blue(d.total);
}

var colorScheme_red = d3.schemeReds[6];
colorScheme_red.unshift("#eee")
var colorScale_red = d3.scaleThreshold()
    .domain([1, 6, 11, 26, 101, 1001])
    .range(colorScheme_red);


function_mapping_red  = (d) => {
    // Pull data for this country
    d.total = data_map.get(d.id) || 0;
    // Set the color
    return colorScale_red(d.total);
}

var colorScheme_green = d3.schemeBuGn[6];
colorScheme_green.unshift("#eee")
var colorScale_green = d3.scaleThreshold()
    .domain([1, 6, 11, 26, 101, 1001])
    .range(colorScheme_green);


function_mapping_green  = (d) => {
    // Pull data for this country
    d.total = data_map.get(d.id) || 0;
    // Set the color
    return colorScale_green(d.total);
}

var colorScheme_purple = d3.schemeBuPu[6];
colorScheme_purple.unshift("#eee")
var colorScale_purple = d3.scaleThreshold()
    .domain([1, 6, 11, 26, 101, 1001])
    .range(colorScheme_purple);


function_mapping_purple  = (d) => {
    // Pull data for this country
    d.total = data_map.get(d.id) || 0;
    // Set the color
    return colorScale_purple(d.total);
}

$( document ).ready(function() {
    load_inflow_outflow_maps("https://gist.githubusercontent.com/palewire/d2906de347a160f38bc0b7ca57721328/raw/3429696a8d51ae43867633ffe438128f8c396998/mooc-countries.csv", "#b8b8b8");
});

const NONE = 0;
const GINI = 1;
const GDP = 2;
const CORRUPTION = 3;
const CRIME = 4;

$( "#select_type_button_id" ).click(function() {
    const DATA = "https://gist.githubusercontent.com/palewire/d2906de347a160f38bc0b7ca57721328/raw/3429696a8d51ae43867633ffe438128f8c396998/mooc-countries.csv";
    var option = +$("#select_type_id").val();
    console.log(option)
    switch(option) {
        case NONE:
            console.log("NONE");
            load_inflow_outflow_maps(DATA, "#b8b8b8");
            break;
        case GINI:
            console.log("GINE");
            load_inflow_outflow_maps(DATA, "#b8b8b8");
            load_inflow_outflow_maps(DATA, function_mapping_blue);
            break;
        case GDP:
            console.log("GDP");
            load_inflow_outflow_maps(DATA, "#b8b8b8");
            load_inflow_outflow_maps(DATA, function_mapping_red);
            break;
        case CORRUPTION:
            console.log("CORRUPTION");
            load_inflow_outflow_maps(DATA, "#b8b8b8");
            load_inflow_outflow_maps(DATA, function_mapping_green);
            break;
        case CRIME:
            console.log("CRIME");
            load_inflow_outflow_maps(DATA, "#b8b8b8");
            load_inflow_outflow_maps(DATA, function_mapping_purple);
            break;
        default:
        // code block
    }

});
