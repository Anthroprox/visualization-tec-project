
function draw_map(origin, origin_migration_data)
{


    d3.select("#main_map").selectAll("*").remove()
    var svg = d3.select("#main_map"),
        width = +svg.attr("width"),
        height = +svg.attr("height");

    var path = d3.geoPath();
    var projection = d3.geoNaturalEarth()
        .scale(width / 3 / Math.PI)
        .translate([width / 2, height / 2])
    var path = d3.geoPath()
        .projection(projection);

    var colorScheme = d3.schemeBuGn[9];
    // colorScheme.unshift("#eee")
    var colorScale = d3.scaleThreshold()
        .domain([1,5,25,50, 100, 250, 500, 800, 1001])
        .range(colorScheme);

    var g = svg.append("g")
        .attr("class", "legendThreshold")
        .attr("transform", "translate(20,20)");


    d3.queue()
        .defer(d3.json, "http://enjalot.github.io/wwsd/data/world/world-110m.geojson")
        .await(ready);

    function draw_arrows() {
        var projection_arrow = d3.geoNaturalEarth()
            .scale(width / 3 / Math.PI)
            .translate([width / 2.33, height / 2.57]);

        var newData = origin_migration_data.keys().map(key => {
            country_data = country_lat_long.get(key)
            origin_country_data = country_lat_long.get(origin)
            var coords = projection_arrow([+country_data.longitude, +country_data.latitude]);
            var coords_origin = projection_arrow([+origin_country_data.longitude, +origin_country_data.latitude]);
            return {source: {x: coords_origin[0], y: coords_origin[1]}, target: {x: coords[0], y: coords[1]}};
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
                var points = [
                    {lx: d.source.x, ly: d.source.y},
                    {lx: d.target.x, ly: d.target.y}
                ];
                return line(points);
            }


            var path = svg.append("svg:path")
                .data([current])
                .attr("class", "line")
                .attr("d", lineData)

            var arrow = svg.append("svg:path")
                .attr("d", d3.symbol().type(d3.symbolTriangle)(10, 1));


            arrow.transition()
                .duration(2000)
                .ease(d3.easeLinear)
                .attrTween("transform", translateAlong(path.node()));

            function translateAlong(path) {
                var l = path.getTotalLength();
                var ps = path.getPointAtLength(0);
                var pe = path.getPointAtLength(l);
                var angl = Math.atan2(pe.y - ps.y, pe.x - ps.x) * (180 / Math.PI) - 270;
                var rot_tran = "rotate(" + angl + ")";
                return function (d, i, a) {
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

    function ready(error, topo) {
        if (error) throw error;

        svg.append("g")
            .attr("class", "countries")
            .selectAll("path")
            .data(topo.features)
            .enter().append("path")
            .attr("fill", function (d) {
                d.total = +origin_migration_data.get(d.id) || 0;
                return colorScale(d.total);
            })
            .attr("d", path);

        draw_arrows();
    }
}
