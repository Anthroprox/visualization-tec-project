var migration_data = []
var country_lat_long = d3.map();
var gdp_data = d3.map();
var corruption_data = d3.map();
var gini_data = d3.map();


dummy_data = [
    {date: "2007", price: 0},
    {date: "2008", price: 0},
    {date: "2009", price: 0},
    {date: "2010", price: 0},
    {date: "2011", price: 0},
    {date: "2012", price: 0},
    {date: "2013", price: 0},
    {date: "2014", price: 0},
    {date: "2015", price: 0},
    {date: "2016", price: 0},
    {date: "2017", price: 0}
]


function migration_data_f(d) {
    if (d.Year === "2017")
        migration_data.push(d);
}

function country_lat_long_f(d) {
    country_lat_long.set(d.code, d);
}

function load_gdp_data(d) {
    data = [
        {date: "2007", price: d['2007']||0},
        {date: "2008", price: d['2008']||0},
        {date: "2009", price: d['2009']||0},
        {date: "2010", price: d['2010']||0},
        {date: "2011", price: d['2011']||0},
        {date: "2012", price: d['2012']||0},
        {date: "2013", price: d['2013']||0},
        {date: "2014", price: d['2014']||0},
        {date: "2015", price: d['2015']||0},
        {date: "2016", price: d['2016']||0},
        {date: "2017", price: d['2017']||0}
    ];

    gdp_data.set(d['Country Code'], data);
}

function load_corruption_data(d) {
    data = [
        {date: "2007", price: d['2007']||0},
        {date: "2008", price: d['2008']||0},
        {date: "2009", price: d['2009']||0},
        {date: "2010", price: d['2010']||0},
        {date: "2011", price: d['2011']||0},
        {date: "2012", price: d['2012']||0},
        {date: "2013", price: d['2013']||0},
        {date: "2014", price: d['2014']||0},
        {date: "2015", price: d['2015']||0},
        {date: "2016", price: d['2016']||0},
        {date: "2017", price: d['2017']||0}
    ];

    corruption_data.set(d['Country Code'], data);
}

function load_gini_data(d) {
    data = [
        {date: "2007", price: d['2007']||0},
        {date: "2008", price: d['2008']||0},
        {date: "2009", price: d['2009']||0},
        {date: "2010", price: d['2010']||0},
        {date: "2011", price: d['2011']||0},
        {date: "2012", price: d['2012']||0},
        {date: "2013", price: d['2013']||0},
        {date: "2014", price: d['2014']||0},
        {date: "2015", price: d['2015']||0},
        {date: "2016", price: d['2016']||0},
        {date: "2017", price: d['2017']||0}
    ];

    gini_data.set(d['Country Code'], data);
}

d3.queue()
    .defer(d3.csv, "https://gist.githubusercontent.com/mariors/7ec6842e93dcc36858c99998009549aa/raw/241b640f6def374af3199e6f8e13880dd95c65f0/country_location.csv", country_lat_long_f) // Position of circles
    .defer(d3.csv, "https://storage.googleapis.com/v_datos/datos.csv", migration_data_f)
    .defer(d3.csv, "https://gist.githubusercontent.com/mariors/89c302bc8d5dded88f2a83b2bfee35fc/raw/3bfe2f88a5379d5ec19097979c425462741f0b09/GDP.csv", load_gdp_data)
    .defer(d3.csv, "https://gist.githubusercontent.com/Anthroprox/a4918c3beedfab3468b855abf7c511f9/raw/75ffe1566f2ee33f82e8ab6e0978eb17245b819d/corruption_index.csv", load_corruption_data)
    .defer(d3.csv, "https://gist.githubusercontent.com/Anthroprox/72c1fffd16bcb571a3eb6e7702801955/raw/97f9c41f2fcde19817efe96a17cfc586b0812dd1/GINI.csv", load_gini_data)
    .await(ready_document);

function ready_document() {
    var origin_migration_data = d3.map()
    for (dt in migration_data) {
        if (migration_data[dt].CO2 === "CRI") {
            if (migration_data[dt].Value > 0)
                origin_migration_data.set(migration_data[dt].COU, migration_data[dt].Value);
        }
    }


    draw_map("CRI", origin_migration_data);
    paint_bar_charts("CRI", origin_migration_data);
    draw_line_chart([
        {
            name: "GDP",
            values: gdp_data.get('CRI') || dummy_data
        },
        {
            name: "Corrruption Index",
            values: corruption_data.get('CRI') || dummy_data
        },
        {
            name: "Gini Index",
            values: gini_data.get('CRI') || dummy_data
        }
    ]);

}


function updateMap() {
    var e = document.getElementById("starting_country");
    var country = e.options[e.selectedIndex].value;

    var origin_migration_data = d3.map()
    for (dt in migration_data) {
        if (migration_data[dt].CO2 === country) {
            if (migration_data[dt].Value > 0)
                origin_migration_data.set(migration_data[dt].COU, migration_data[dt].Value);
        }
    }

    draw_map(country, origin_migration_data);
    paint_bar_charts(country, origin_migration_data);
    draw_line_chart([
        {
            name: "GDP",
            values: gdp_data.get(country) || dummy_data
        },
        {
            name: "Corrruption Index",
            values: corruption_data.get(country) || dummy_data
        },
        {
            name: "Gini Index",
            values: gini_data.get(country) || dummy_data
        }
    ]);

}

function update_line_chart(country){
    draw_line_chart([
        {
            name: "GDP",
            values: gdp_data.get(country) || dummy_data
        },
        {
            name: "Corrruption Index",
            values: corruption_data.get(country) || dummy_data
        },
        {
            name: "Gini Index",
            values: gini_data.get(country) || dummy_data
        }
    ]);
}