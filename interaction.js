var colors = ["#e41a1c", "#377eb8", "#4daf4a", "#7570b3"]
var ridersSelect = [];


$(document).on('click', 'path.line', function(event, i){

    var id = parseInt((this.id).slice(1, (this.id).length));

    indexColor = 0;
    refresh();
    showRunner(id, runners, this);
    

});

d3.select("#selectButton").on("change", function(d) {
    // recover the option that has been chosen
    var year_selected = d3.select(this).property("value")
    d3.select("svg").remove();
    timeDataRunner = [];
    labelsDataRunner = []; //informacio de les etiquetes
    arrKmMostrar = [];
    updateChart(year_selected)
})

function showRunner(id_runner, runners, elem){


  var riderStage = runners.filter(r => r.id === id_runner);
  
  var clicked = d3.select(elem);

  clicked.style("stroke", colors[indexColor])
    .style("stroke-width", "2.5px");

  showLabelInformation(riderStage);

}

//refresh all on delete keyboard event
function refresh(){

    d3.selectAll(".line").classed("active", false)
                         .style("stroke", "")
                         .style("stroke-width", "1px");

    d3.selectAll("circle").remove();
    $( ".card" ).remove();     
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

            div.html("Elapsed time: " + d.elapsedTime + "<br/>"  + "Provisional Position: " + d.provPosition + "<br/>"  + "Name: " + d.name)  
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