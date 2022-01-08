var svg;
var height;
var timeDataRunner = [];
var labelsDataRunner = []; //informacio de les etiquetes
var arrKmMostrar = [];
var runners = [];
var ridersSelect = [];
var FIRST = 0
var SECOND = 1
var THIRD = 2
var colors = ["#e41a1c", "#377eb8", "#4daf4a", "#984ea3", "#ff7f00"]

var xScaleLabel;
var yScaleLabel;

var showNAxisChart = 5;
var separacioEntreKm = 10;


allYears = ["YEAR 2008", "YEAR 2011","YEAR 2014","YEAR 2015","YEAR 2016", "YEAR 2017", "YEAR 2018", "YEAR 2019", "YEAR 2021"]

n_runners = ["Top 5", "Top 10", "Top 50", "Top 100", "Top 500", "Top 1000", "ALL"]

d3.select("#selectYear")
      .selectAll('myOptions')
      .data(allYears)
      .enter()
      .append('option')
      .text(function (d) { return d; }) // text showed in the menu
      .attr("value", function (d) { return d; }) // corresponding value returned by the button

d3.select("#selectRunnersNumber")
	      .selectAll('myOptions')
	      .data(n_runners)
	      .enter()
	      .append('option')
	      .text(function (d) { return d; }) // text showed in the menu
	      .attr("value", function (d) { return d; }) // corresponding value returned by the button

function updateChart(year_selected, top_selected) {
	
	year = year_selected.slice(-4)
	sourcefile = "./final_csv/df_" + year + ".csv"

	d3.csv(sourcefile, function(data){

		rank = 5 // by default

		if(top_selected == "ALL"){
			rank = data.length - 1
		}
		else{
			rank = top_selected.slice(top_selected.indexOf(" "), top_selected.length)
		}
			
		//Array[Names]
		columnsName = d3.keys(data[0]).filter(isPlace)

		//Array[distance]
		columnDistance = []
		for(var i = 1; i <= columnsName.length; i++)
			columnDistance.push(i*10)
		

		// ********************************************
		// Points runners and time average of finishers
		// ********************************************

		//n_runners = data.length
		n_runners = parseInt(rank)
		var dataRunners = data.slice(0, n_runners)

		sum_time = 0 // total time of finishers (in seconds)
		finishers = 0
		final_place = columnsName[columnsName.length - 1]

		for(runner in dataRunners){


			var points = [];
			
		 	for(place in columnsName){

		 		// **************
				// Points runners
				// **************
		 		var position_place = columnsName[place].toLowerCase() + "_pos"
		 		var time_place = columnsName[place] + "_time"

		 		points.push({id: parseInt(runner),
		 						x: parseFloat(columnDistance[place]),
		 						y: parseInt(data[runner][columnsName[place]]) + 100,
		 		});

			    labelsDataRunner.push({id: parseInt(runner),
		                x: parseFloat(columnDistance[place]),
		                y: parseInt(data[runner][columnsName[place]]) + 100,
		                elapsedTime: data[runner][columnsName[place]].toString().toHHMMSS(),
		                time: data[runner][time_place], 
		                namePlace: columnsName[place],
		                name: data[runner]['name']
		              })

				// *****************
				// Update total time
				// *****************
				if(columnsName[place] == final_place && data[runner][time_place] != ""){
					f_time_sec = toSeconds(data[runner][time_place])
					sum_time += f_time_sec
					finishers += 1
				}
		 	}

			final_pos_col = d3.keys(data[0]).length - 1
			final_pos_name = d3.keys(data[0])[final_pos_col]
			
			runners.push({id: parseInt(runner), name: data[runner]["name"], finalPos: data[runner][final_pos_name]})
			timeDataRunner.push(points)
		}

		mean_time = (sum_time / finishers).toString().toHHMMSS()

		//************************************************************
		// Create Margins and Axis and hook our zoom function
		//************************************************************

		var self = this;
		this.cx = 1650; //amplada en pixels de l'interior (amb padding inclos)
		this.cy = 750; //altura en pixels de l'interior (amb padding inclos)

		var margin = {top: 0, right: 50, bottom: 0, left: 50},
		  width = this.cx - margin.left - margin.right;

		height = this.cy - margin.top - margin.bottom;

		var xScale = d3.scaleLinear()
		  .domain([0, columnDistance[columnDistance.length -1]])
		  .range([0, width])

		xScaleLabel = xScale;

		var yScale = d3.scaleLinear()
		  .domain([0, valorElapsedMax(timeDataRunner)])
		  .range([0, height])

		yScaleLabel = yScale;

		var xAxis = d3.axisBottom(xScale)
			.tickValues(columnDistance)
			.tickFormat(function(d){
				var tick_text = (columnsName[d/10 - 1]).toString()
				return tick_text;
			})
			.tickPadding(10)
			.tickSize(-height)

		var yAxis = d3.axisLeft(yScale)
		.tickPadding(10)
		.tickSize(-width)
		.ticks(5)

		var zoom = d3.zoom()
		  .scaleExtent([1,20])
		  .translateExtent([[0, 0], [width, height]]) 
		  .extent([[0, 0], [width, height]])
		  .duration([750])
		  .on("zoom", zoomed);

		//************************************************************
		// Generate our SVG object
		//************************************************************  



		svg = d3.select("#stage_id")
		 .append("svg")
		 .attr("viewBox", "-40 20 1650 750")
		 .style("overflow", "visible")
		 .call(zoom)

	 	// svg = d3.select('#stage_id').append("svg")
		 //    .attr("width", '100%')
		 //    .attr("height", '100%')
		 //    .attr('viewBox','0 0 '+Math.min(width,height)+' '+Math.min(width,height))
		 //    .attr('preserveAspectRatio','xMinYMin')
		 //    .style("overflow", "visible")
		 //    .call(zoom)
		

		zoom.scaleBy(svg.transition().duration(750), 0.1)

		var arr_km_show = updateAxisPlace(xScale.domain(), columnDistance);

		var gX = svg.append("g")
		        .attr("class", "x axis")
		        .attr("transform", "translate(0," + height + ")")
		        .call(xAxis)
		        .selectAll(".tick")
		        .style("display", function(){
		          if(arr_km_show.includes(parseFloat(this.textContent))) return "";
		          else return "none";
		        });

		var gY = svg.append("g")
		          .attr("class", "y axis")
		          .call(yAxis)
		          .selectAll(".tick")
		          .style("display", "none");

		svg.append("clipPath")
			.attr("id", "clip")
			.append("rect")
			.attr("width", width+20)
			.attr("height", height);

		//************************************************************
		// Axis labels
		//************************************************************

		svg.append("text")
		    .attr("class", "y label")
		    .attr("text-anchor", "end")
		    .attr("y", -50)
		    .attr("x", 0)
		    .attr("dy", ".75em")
		    .attr("transform", "rotate(-90)")
		    .style("font-size", "22px")
		    .text("ELAPSED TIME (1st.)");


		//************************************************************
		// Create D3 line object + Draw lines (runners)
		//************************************************************

		var line = d3.line()
		  .x(function(d) { return xScale(d.x); })
		  .y(function(d) { return yScale(d.y); });   

		svg.selectAll('.line')
			.data(timeDataRunner)
			.enter()
			.append("path")
			.attr("class", "line")
			.attr("clip-path", "url(#clip)")
			.attr("d", line)
			.attr("id", function(d){
			  return "r"+d[0].id;
		});

		//************************************************************
		// Show the winners of the race
		//************************************************************

		// Draw lines of winners
		var clicked_1 = d3.select("#r"+FIRST);  
		var clicked_2 = d3.select("#r"+SECOND);
		var clicked_3 = d3.select("#r"+THIRD);

		showRunner(FIRST, runners, clicked_1, FIRST);
		showRunner(SECOND, runners, clicked_2, SECOND);
		showRunner(THIRD, runners, clicked_3, THIRD);

		// Paint the colors of the winning names
		showWinners(runners)


		// Paint legend of the winners
		svg.append("rect").attr("x", width-1510).attr("y",height-250).attr("width", 17).attr("height", 17).style("fill", "#e41a1c")
		svg.append("rect").attr("x",width-1510).attr("y",height-220).attr("width", 17).attr("height", 17).style("fill", "#377eb8")
		svg.append("rect").attr("x",width-1510).attr("y",height-190).attr("width", 17).attr("height", 17).style("fill", "#4daf4a")
		svg.append("rect").attr("x",width-1510).attr("y",height-160).attr("width", 17).attr("height", 17).style("fill", "#984ea3")
		svg.append("text").attr("x", width-1480).attr("y", height-235).text("FIRST").style("font-size", "22px").attr("alignment-baseline","middle")
		svg.append("text").attr("x", width-1480).attr("y", height-205).text("SECOND").style("font-size", "22px").attr("alignment-baseline","middle")
		svg.append("text").attr("x", width-1480).attr("y", height-175).text("THIRD").style("font-size", "22px").attr("alignment-baseline","middle")
		svg.append("text").attr("id", "otherRunner").attr("x", width-1480).attr("y", height-145).text("OTHER").style("font-size", "22px").attr("alignment-baseline","middle");	

		//************************************************************
		// Show the mean of the runners
		//************************************************************

		svg.append("text").attr("x", width-1510).attr("y", height-80).text("FINISHERS AVG.: " + mean_time).style("font-size", "22px").attr("alignment-baseline","middle")

		//************************************************************
	  	// Zoom specific updates
	 	//************************************************************
	  	function zoomed() {

		    // create new scale ojects based on event
		    var new_xScale = d3.event.transform.rescaleX(xScale);
		    var new_yScale = d3.event.transform.rescaleY(yScale);

		    // save scale of labels if select a runner after zoomed
		    xScaleLabel = new_xScale; 
		    yScaleLabel = new_yScale;

		    var arr_km_show = updateAxisPlace(new_xScale.domain(), columnDistance);

		    // re-scale axes
		    svg.select(".y.axis")
		        .call(yAxis.scale(new_yScale))
		        .selectAll(".tick")
		        .style("display", "none");;

		    svg.select(".x.axis")
		        .call(xAxis.scale(new_xScale))
		        .selectAll(".tick")
		        .style("display", function(){
		          if(arr_km_show.includes(this.textContent)){ 
		          	return "";
		          }
		          else {
		          	return "none";
		          }
		        });


		    // re-draw line
		    plotLine = d3.line()
		        .x(function (d) {
		            return new_xScale(d.x);
		        })
		        .y(function (d) {
		            return new_yScale(d.y);
		        });

		    svg.selectAll('path.line').attr("d", plotLine);


		    //re-draw dots
		    svg.selectAll("circle")
		      .attr("cx",  function(d) {
		        return new_xScale(d.x);
		      })
		      .attr("cy",  function(d) {
		        return new_yScale(d.y);
		      })
	  	}
	});

}

updateChart(allYears[0], n_runners[0]);


String.prototype.toHHMMSS = function () {

    var sec_num = parseInt(this, 10); // don't forget the second param
    var hours   = Math.floor(sec_num / 3600);
    var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
    var seconds = sec_num - (hours * 3600) - (minutes * 60);

    if (hours   < 10) {hours   = "0"+hours;}
    if (minutes < 10) {minutes = "0"+minutes;}
    if (seconds < 10) {seconds = "0"+seconds;}
    return hours+':'+minutes+':'+seconds;
}


function toSeconds(time){

	h = parseInt(time[0] + time[1])
    m = parseInt(time[3] + time[4])
    s = parseInt(time[6] + time[7])

    total_seconds = s + m*60 + h*60*60
	
	return total_seconds
}

function updateAxisPlace(arryDomain, columnsDistance){

    var km_minim_vist = arryDomain[0];
    var km_maxim_vist = arryDomain[1];

    var rang_visio = km_maxim_vist - km_minim_vist;

    var inc = rang_visio /(showNAxisChart + 1);

    var inc_ampliat = Math.ceil(inc/separacioEntreKm) * separacioEntreKm;

    var rang_ampliat = inc_ampliat * (showNAxisChart + 1);

    var inc_rang = rang_ampliat - rang_visio;

    var km_min =  km_minim_vist - (inc_rang / 2);

    arrPlaceShow = [];

    if(rang_visio > (separacioEntreKm * (showNAxisChart + 1))){

      for (var i = 1; i <= showNAxisChart ; i++){
        var km = Math.round((km_min + i * inc_ampliat) / separacioEntreKm) * separacioEntreKm;
        arrPlaceShow.push(km);
      }
    }
    else{

      var inici;
      for(var i = 0; i < columnsDistance.length; i++){ //busquem el primer km vist
        if(km_maxim_vist >= parseFloat(columnsDistance[i])){ 
          inici = i; 
          break;
        }
      }
      var final = columnsDistance.length - 1;
      for(var i = inici + 1; i < columnsDistance.length; i++){ //busquem el darrer km vist

        if(km_minim_vist <= parseFloat(columnsDistance[i])){
         final = i;
        }
      }


      if(final - inici < showNAxisChart){ //si no n'hi ha masses, els guardo tots
      
        for(var j = inici; j < columnsDistance.length; j++){
          arrPlaceShow.push(parseFloat(columnsDistance[j]))
        }
      }
      else{ //n'hi ha masses, miro quins hauria de mostrar i els busco
        var kms =[];

        for(var i = 0; i < showNAxisChart; i++){
          kms.unshift(km_min + i * inc_ampliat)
        }

        var j=0;
        for(var i = inici; i < final-1 && j < showNAxisChart; i++){

          if(columnsDistance[i] >= kms[j] && columnsDistance[i+1] < kms[j]){
            arrPlaceShow.push(parseFloat(columnsDistance[i]))
            j++;

          }
        }
      }      
    }

    arrPlaceShow = arrPlaceShow.filter(function(element){
      return element <= arryDomain[1] && element >= arryDomain[0];
    });

 	place_idx_show = arrPlaceShow.map(function(item) { return item/10 })

 	arr_place_name = []

 	for(var i = 0; i < place_idx_show.length; i++){
 		arr_place_name.push(columnsName[place_idx_show[i]])
 	}
    return arr_place_name;
}



function valorElapsedMax(dataElapsed){

  var res = 0;

  for(var i = 0; i < dataElapsed.length; i++){

    var runners = dataElapsed[i];

    for(var j = 0; j < runners.length; j++){

      if(runners[j].y > res) res = runners[j].y
    }

  }
  
  return res;
}


function isPlace(infoColumn){
  
  if(!infoColumn.includes("_time")){
  		// check if column name contains a letter in upper case
  		return !(infoColumn == infoColumn.toLowerCase() && infoColumn != infoColumn.toUpperCase());  	
  }
  else{
  	return false
  }  
}