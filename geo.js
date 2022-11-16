/* Define width and height */ 
var width = 850,
    height = 400;


/* Define and append svg */ 
var svg = d3.select("body").append("svg")
    .attr("width", width) // set svg width 
    .attr("height", height); // sets svg height 


/* Create dictionaries to relate counties in json to values in csv */ 
var densityById = d3.map(); // relates pop density to id 
var nameById = d3.map(); // relates county name to id 


/* Define redColor function to create 9 distinct classes */ 
var redColor = d3.scaleThreshold() 
    .domain([1, 10, 50, 200, 500, 1000, 2000, 4000]) 
    // sets domain according to Bostock's classes of population density
    .range(d3.schemeOrRd[9]); 
    // sets range to array of 9 red html codes 

/* Define blueColor function to create 9 distinct classes */ 
var blueColor = d3.scaleThreshold()
    .domain([200, 300, 600, 800, 1000, 1600, 1800, 10000]) 
    // sets domain according to new classes of population density
    .range(d3.schemeBlues[9]); 
    // sets range to array of 9 blue html codes 


/* Set projection to the Albers’ equal area-conic projection */ 
var projection = d3.geoAlbersUsa() 
    .scale(10000) 
    // sets projection scale factor
    .translate([(width / 2) - 3325, (height / 2) + 1050]);
    // translates the pixel coordinates of the projection’s center 


/* Declare path generator to draw json geometries */ 
var path = d3.geoPath()
    .projection(projection); // applies previously defined projection 


/* Call displayViz() function to display the visualization initially */ 
displayViz();


/* Define displayViz() function */ 
function displayViz() {

    /* Load in data files */
    d3.queue() 
        .defer(d3.json, "ma.json") // loads json file data 
        .defer(d3.csv, "population.csv", function(d) { 
            densityById.set(d.id, +d.density); // sets densityById 
            nameById.set(d.id, d.county); // sets nameById 
        }) 
        .await(ready); // waits for ready function 
    

    /* Define ready function */ 
    function ready(error, ma) { 
        
        if (error) throw error; // throw error 

    
        /* Print objects to console for verification */ 
        console.log(ma.objects); 
    
        
        
        
        /* Append legend: */ 
    
        
        /* Append white rect to cover previously appended legend */ 
        svg.append("rect") 
            .attr("height", 60) // sets height 
            .attr("x", 20) // sets x position 
            .attr("y", 20) // sets y position 
            .attr("width", width) // sets width 
            .attr("fill", "#fff"); // sets fill color to white 
    
        
        /* Define x scale */ 
        var x = d3.scaleSqrt() 
            .domain([0, 12415.6]) // set domain from 0 to max density value 
            .rangeRound([20, 770]); // set range to on-screen position 

        
        /* Define g variable to append elements to svg */ 
        var g = svg.append("g")
            .attr("transform", "translate(0,40)");
            // translates g elements downward 

        
        /* Append rectangles */ 
        g.selectAll("rect")
            .data(function() { 
                /* If color button pressed an odd # of times: */ 
                if ( colorCount%2 === 1 ) { 
                    return (blueColor.range().map(function(d) { 
                        d = blueColor.invertExtent(d); 
                        // returns domain associated with d in range 
                        if (d[0] == null) d[0] = x.domain()[0]; 
                        // if first element is null, set to 0 
                        if (d[1] == null) d[1] = x.domain()[1]; 
                        // if second element is null, set to 12415.6 
                        return d; // return resulting domain 
                    })); // returns map of 9 domains 
                } 
                /* If color button pressed an even # of times: */ 
                else { 
                    return (redColor.range().map(function(d) { 
                        d = redColor.invertExtent(d); 
                        // returns domain associated with d in range 
                        if (d[0] == null) d[0] = x.domain()[0]; 
                        // if first element is null, set to 0 
                        if (d[1] == null) d[1] = x.domain()[1]; 
                        // if second element is null, set to 12415.6 
                        return d; 
                    })); // returns map of 9 domains 
                } 
            }) 
            .enter() // enters data 
            .append("rect") // appends new rectangle 
            .attr("height", 8) // sets height 
            .attr("x", function(d) { return x(d[0]); }) 
            // sets x position according to x scale of first domain element 
            .attr("width", function(d) { return x(d[1]) - x(d[0]); }) 
            // sets width according to x scale of domain 
            .attr("fill", function(d) {
                if (colorCount%2 === 1) return blueColor(d[0]);
                else return redColor(d[0]); 
            }); // fills red or blue according to colorCount 
    
        
        /* Append legend text label: */ 
        g.append("text") // appends text 
            .attr("x", x.range()[0]) 
            // sets x position to first range element in x scale
            .attr("y", -6) // sets y position to -6 
            .attr("fill", "#000") // sets text color to black 
            .attr("text-anchor", "start") // anchors text at start 
            .attr("font-weight", "bold") // sets text bold 
            .text("Population per square mile"); // sets text value 

        
        /* Define bluexAxis */ 
        var bluexAxis = d3.axisBottom(x)
            .tickSize(13) // sets tick size 
            .tickValues(blueColor.domain()); 
            // sets tick values according to blueColor domain 
        
        /* Define redxAxis */ 
        var redxAxis = d3.axisBottom(x)
            .tickSize(13) //sets tick size 
            .tickValues(redColor.domain());
            // sets tick values according to redColor domain 

        /* Set properties of axis text: */ 
        /* If color button has been pressed an odd # of times: */
        if ( colorCount%2 === 1 ) {
            g.call(bluexAxis) // calls bluexAxis 
                .selectAll(".tick text") // selects tick text 
                .attr("x", 10) // sets x position 
                .attr("dy", "-0.05em") // sets y position 
                .attr("transform", "rotate(30)") 
                // rotates text 30 degrees 
                .style("text-anchor", "start");
                // anchors text at the start 
        }
        /* If color button has been pressed an even # of times: */
        else {
            g.call(redxAxis) // calls redxAxis 
                .selectAll(".tick text") // selects tick text 
                .attr("x", 10) // sets x position 
                .attr("dy", "-0.05em") // sets y position 
                .attr("transform", "rotate(30)") 
                // rotates text 30 degrees 
                .style("text-anchor", "start");
                // anchors text at the start 
        }
    
    
        /* Remove axis line: */ 
        /* If color button has been pressed an odd # of times: */ 
        if ( colorCount%2 === 1 ) { 
            g.call(bluexAxis) // calls bluexAxis 
                .select(".domain") // selects domain 
                .remove(); // removes axis line 
        }
        /* If color button has been pressed an even # of times: */ 
        else {
            g.call(redxAxis) // calls redxAxis 
                .select(".domain") // selects domain 
                .remove(); // removes axis line 
        }
    
    
        /* Append counties and add tooltip */ 
        svg.append("g") 
            .selectAll("path") // selects path 
            .data(topojson.feature(ma, ma.objects.counties).features) 
            // converts json data to geojson data 
            .enter() // enters data 
            .append("path") // appends path  
            .attr("d", path) // draw counties 
            .attr("fill", function(d) { 
                /* If color button pressed odd # of times: */ 
                if(colorCount%2 === 1) { 
                    return blueColor(densityById.get(d.id));
                    // returns blue map 
                }
                /* If color button pressed even # of times: */ 
                else { 
                    return redColor(densityById.get(d.id)); 
                    // returns red map 
                }
            }) // fills counties according to data and color mapping 
            .style("stroke-opacity", function(d) { 
                /* If county button pressed odd # of times: */ 
                if( countyCount%2 === 1) { 
                    return 0; // sets stroke opacity to 0% 
                }
                /* If county button pressed even # of times: */ 
                else { 
                    return 0.5; // sets stroke opacity to 50% 
                } 
            })
        
    
            /* Apply mouseover tooltip: */ 
            /* When mouse enters area of a county: */ 
            .on("mouseover", function(d) { 
                d3.select("#tooltip") // selects tooltip 
                    .select("#name") // selects id: "name" 
                    .text(nameById.get(d.id)); // inserts country name 
                d3.select("#tooltip") // selects tooltip 
                    .select("#density") // selects id: "density" 
                    .text(densityById.get(d.id).toLocaleString()); 
                    // inserts density formatted with commas 
                d3.select("#tooltip") // selects tooltip 
                    .classed("hidden", false) // shows tooltip 
                    .transition() // adds transition 
                    .duration(500) // determines length of transition
                    .style("left", (d3.event.pageX) - 115 + "px") 
                    // sets x position according to cursor 
                    .style("top", (d3.event.pageY) + 30 + "px");
                    // sets y position according to cursor 
            })
        
            /* When mouse moves: */ 
            .on("mousemove", function() {
                d3.select("#tooltip") // selects tooltip 
                    .classed("hidden", false) // shows tooltip
                    .transition() // adds transition 
                    .duration(5) // determines length of transition 
                    .style("left", (d3.event.pageX) - 115 + "px") 
                    // sets x position according to cursor 
                    .style("top", (d3.event.pageY) + 30 + "px");
                    // sets y position according to cursor 
            })
        
            /* When mouse leaves area of a county: */ 
            .on("mouseout", function() { 
                d3.select("#tooltip") // selects tooltip 
                    .classed("hidden", true); // hides tooltip 
            }); 
    
    
        /* Append state boundary: */ 
        svg.append("g")
            svg.append("path") // append path 
                .datum(topojson.feature(ma, ma.objects.states))
                // converts json data to geojson data 
                .attr("class", "states") // sets class to "states"  
                .attr("d", path); // draw state 

    }
    
}


/* To keep track of how many times color has been toggled: */ 
var colorCount = 0; 

/* To keep track of how many times county has been toggled */ 
var countyCount = 0; 


/* Define function to update colorCount on button press */ 
function updateColor() { colorCount++; }

/* Define function to update countyCount on button press */ 
function updateCounties() { countyCount++; }
