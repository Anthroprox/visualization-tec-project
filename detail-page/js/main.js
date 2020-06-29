var migration_data = []
var country_lat_long = d3.map();

function migration_data_f (d) {
    if(d.Year === "2017")
        migration_data.push(d);
}

function country_lat_long_f (d) {
    country_lat_long.set(d.code, d);
}


d3.queue()
    .defer(d3.csv, "https://gist.githubusercontent.com/mariors/7ec6842e93dcc36858c99998009549aa/raw/241b640f6def374af3199e6f8e13880dd95c65f0/country_location.csv",country_lat_long_f ) // Position of circles
    .defer(d3.csv, "https://storage.googleapis.com/v_datos/datos.csv", migration_data_f)
    .await(ready_document);

function ready_document(){
    draw_map("CRI");

}


function updateMap(){
    var e = document.getElementById("starting_country");
    var country = e.options[e.selectedIndex].value;
    draw_map(country);
}