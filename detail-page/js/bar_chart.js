var datas = [{
    "name": "Apples",
    "value": 20,
},
    {
        "name": "Huston",
        "value": 12,
    },
    {
        "name": "New York",
        "value": 19,
    },
    {
        "name": "Costa Rica",
        "value": 5,
    },
    {
        "name": "Washington",
        "value": 16,
    },
    {
        "name": "Miami",
        "value": 26,
    },
    {
        "name": "Los Angeles",
        "value": 30,
    }];

//sort bars based on value
datas = datas.sort(function (a, b) {
    return d3.ascending(a.value, b.value);
})

//set up svg using margin conventions - we'll need plenty of room on the left for labels
var margin = {
    top: 15,
    right: 25,
    bottom: 15,
    left: 100
};



var width = 300 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;

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
    .rangeRound([height/2, 0]).padding(0.1)
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
    })
    .attr("height", y.bandwidth())
    .attr("x", 0)
    .attr("fill", function(d){ return d.name === "Costa Rica" ? "#666666" : "#228B22"})
    .attr("width", function (d) {
        return x(d.value);
    });

//add a value label to the right of each bar
bars.append("text")
    // .attr("class", "label")
    .attr("class", "label")
    //y position of the label is halfway down the bar
    .attr("y", function (d) {
        return y(d.name) + y.bandwidth() /2 +4 ;
    })
    //x position is 3 pixels to the right of the bar
    .attr("x", function (d) {
        return x(d.value) + 3;
    })
    .text(function (d) {
        // return d.value;
        return "";
    });