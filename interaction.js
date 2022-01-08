var line_select = -1
var line_unselect = -1

$(document).on('click', 'path.line', function(event, i){

    line_select = parseInt((this.id).slice(1, (this.id).length));

    if(line_select > 2){ // runner final position > third

        removeLine(line_unselect);
    
        line_unselect = line_select

        indexColor = 3
        var clicked = d3.select(this);
        showRunner(line_select, runners, clicked, indexColor);

        //update legend value
        var riderStage = runners.filter(r => r.id === line_select)[0];
        position = riderStage.finalPos.toString()
        name = riderStage.name.slice(0, riderStage.name.indexOf(" "))
        document.getElementById("otherRunner").textContent = "POSITION: " + position + ", " + name;

    }
});

d3.select("#selectYear").on("change", function(d) {
    // recover the option that has been chosen
    var year_selected = d3.select(this).property("value")
    d3.select("svg").remove();
    timeDataRunner = [];
    labelsDataRunner = []; //informacio de les etiquetes
    arrKmMostrar = [];
    runners = [];
    document.getElementById("selectRunnersNumber").selectedIndex = 0;
    updateChart(year_selected, "Top 5")
})

d3.select("#selectRunnersNumber").on("change", function(d) {
    // recover the option that has been chosen
    d3.select("svg").remove();
    timeDataRunner = [];
    labelsDataRunner = []; //informacio de les etiquetes
    arrKmMostrar = [];
    runners = [];
    selected_year = document.getElementById("selectYear").value;
    top_selected = d3.select(this).property("value")
    updateChart(selected_year, top_selected) //update the same year chart, other lines
})

function showWinners(runners){

    w1_name = runners[FIRST].name
    w2_name = runners[SECOND].name
    w3_name = runners[THIRD].name

    w1_last_name = w1_name.slice(0, w1_name.indexOf(" "))
    w2_last_name = w2_name.slice(0, w2_name.indexOf(" "))
    w3_last_name = w3_name.slice(0, w3_name.indexOf(" "))

    document.getElementById("winner1").innerHTML = "<b>"+w1_last_name+"</b>";
    document.getElementById("winner2").innerHTML = "<b>"+w2_last_name+"</b>";
    document.getElementById("winner3").innerHTML = "<b>"+w3_last_name+"</b>";  
}

function showRunner(id_runner, runners, clicked, indexColor){


  var riderStage = runners.filter(r => r.id === id_runner);
  
  clicked.style("stroke", colors[indexColor])
    .style("stroke-width", "3.5px");

  showLabelInformation(riderStage);
}

//removeLine selected
function removeLine(idLineSelected){

    d3.select("#r"+idLineSelected).classed("active", false)
                                  .style("stroke", "")
                                  .style("stroke-width", "2px");

    svg.selectAll('circle').each(function(d,i) { 
        if(d.id === idLineSelected)
            this.remove();
    });    
}

function showLabelInformation(runners){
//*** Show label information of runner select ***//
    let labelRunnerSelect = [];

    runners.map((runner) => {
        labelRunnerSelect = labelRunnerSelect.concat(labelsDataRunner.filter(label => label.id === runner.id));
    });

    var div = d3.select("body").append("div") 
        .attr("class", "tooltip")       
        .style("opacity", 0);

    var divRider = d3.select("body").append("div") 
        .attr("class", "tooltipRunner")       
        .style("opacity", 0);

    svg.selectAll("dot")  
        .data(labelRunnerSelect)     
        .enter()
        .append("circle")
        .attr("clip-path", "url(#clip)")               
        .attr("r", 5)   
        .attr("cx", function(d) { return xScaleLabel(d.x); })     
        .attr("cy", function(d) { if(isNaN(yScaleLabel(d.y))){
                                 return height; 
                                } 
                                else return yScaleLabel(d.y); })   
        .on("mouseover", function(d) {   
            
            div.transition()    
               .duration(200)    
               .style("opacity", .9);    

            div.html("Elapsed time: " + d.elapsedTime + "<br/>" + "Time: "+ d.time + "<br/>" + "Place: " + d.namePlace)
               .style("left", (d3.event.pageX + 5) + "px")   
               .style("top", (d3.event.pageY - 30) + "px"); 
            
        })          
        .on("mouseout", function(d) {   
            div.transition()    
               .duration(500)    
               .style("opacity", 0); 

            divRider.transition()    
               .duration(500)    
               .style("opacity", 0);
        });
}