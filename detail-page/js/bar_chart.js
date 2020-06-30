var active_link = "0"

function paint_bar_charts(origin_country_code, destiny_country) {
    active_link = "0"
    var datas = []
    var current = {}

    function bar_map_data(d) {
        if (d['2017'] && (destiny_country.has(d['Country Code']) || d['Country Code'] === origin_country_code))
            datas.push({code: d['Country Code'], name: d['Country Name'], value: +d['2017']});
        if (d['Country Code'] === origin_country_code)
            current = {code: d['Country Code'], name: d['Country Name'], value: +d['2017']};

    }

    d3.queue()
        .defer(d3.csv, "https://gist.githubusercontent.com/mariors/89c302bc8d5dded88f2a83b2bfee35fc/raw/3bfe2f88a5379d5ec19097979c425462741f0b09/GDP.csv", bar_map_data)
        .await(do_paint);

    function do_paint() {
        datas = datas.sort(function (a, b) {
            return d3.ascending(a.value, b.value);
        })

        var margin = {
            top: 15,
            right: 25,
            bottom: 15,
            left: 100
        };


        var width = 300 - margin.left - margin.right,
            height = 1600 - margin.top - margin.bottom;
        d3.select("#bar_chart").selectAll("*").remove()
        var svg = d3.select("#bar_chart").append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        var x = d3.scaleLinear()
            .range([0, width])
            .domain([0, d3.max(datas, function (d) {
                return d.value;
            })]);

        var y = d3.scaleBand()
            .rangeRound([height / 2, 0]).padding(0.1)
            .domain(datas.map(function (d) {
                return d.name;
            }));

//make y axis to show bar names
        var yAxis = d3.axisLeft()
            .scale(y)
            //no tick marks
            .tickSize(0);

        var gy = svg.append("g")
            .attr("class", "y axis")
            .call(yAxis)

        var bars = svg.selectAll(".bar")
            .data(datas)
            .enter()
            .append("g")

//append rects
        bars.append("rect")
            // .attr("class", "bar")
            .attr("y", function (d) {
                return y(d.name);
            }).attr("height", y.bandwidth())
            .attr("x", 0)
            .attr("fill", function (d) {
                return d.code === origin_country_code ? "#666666" : (d.value > current.value ? "#228b22" : "#e50b0b");
            }).attr("width", function (d) {
            return x(d.value);
        }).on("mouseover", function (d) {

            var delta = d.y1 - d.y0;
            var xPos = parseFloat(d3.select(this).attr("x"));
            var yPos = parseFloat(d3.select(this).attr("y"));
            var height = parseFloat(d3.select(this).attr("height"))

            d3.select(this).attr("stroke", "blue").attr("stroke-width", 0.8);

            svg.append("text")
                .attr("x", xPos)
                .attr("y", yPos + height / 2)
                .attr("class", "tooltip")
                .text(d.name + ": " + delta);
            if (active_link === "0") d3.select(this).style("cursor", "pointer");
            else {
                if (active_link.split("class").pop() === this.id.split("id").pop()) {
                    d3.select(this).style("cursor", "pointer");
                } else d3.select(this).style("cursor", "auto");
            }
        }).on("mouseout", function () {
            svg.select(".tooltip").remove();
            d3.select(this).attr("stroke", "pink").attr("stroke-width", 0.2);

        }).on("click",function(d){

            alert(JSON.stringify(d));

        });


//add a value label to the right of each bar
        bars.append("text")
            // .attr("class", "label")
            .attr("class", "label")
            //y position of the label is halfway down the bar
            .attr("y", function (d) {
                return y(d.name) + y.bandwidth() / 2 + 4;
            })
            //x position is 3 pixels to the right of the bar
            .attr("x", function (d) {
                return x(d.value) + 3;
            })
            .text(function (d) {
                // return d.value;
                return "";
            });
    }
}