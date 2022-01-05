var svg;
var height;
var timeDataRunner = [];
var labelsDataRunner = []; //informacio de les etiquetes
var arrKmMostrar = [];
var runners = [];

var varEtiquetesTemps = 80;

var xScaleLabel;
var yScaleLabel;

var showNAxisChart = 5;
var separacioEntreKm = 10;

file_ori = 'utmb_'
file_new = 'df_'
sourcefile1 = "./results/df_2016.csv"
sourcefile2 = "./results/df_2017.csv"

currentYear = 2017

// allYears = ["./results/df_2016.csv", "./results/df_2017.csv"]
allYears = ["Results UTMB 2016", "Results UTMB 2017"]


d3.select("#selectButton")
      .selectAll('myOptions')
      .data(allYears)
      .enter()
      .append('option')
      .text(function (d) { return d; }) // text showed in the menu
      .attr("value", function (d) { return d; }) // corresponding value returned by the button

function updateChart(result_selected) {

	year = result_selected.slice(-4)
	sourcefile = "./results/df_" + year + ".csv"

	d3.csv(sourcefile, function(data){

		
		//Array[Names]
		columnsName = d3.keys(data[0]).filter(isPlace)

		//Array[distance]
		columnDistance = Array.from({length: columnsName.length}, (_, i) => i * 10)


		// *****************
		// Points runners
		// *****************

		var dataRunners = data.slice(0, data.length)

		for(runner in dataRunners){

			var points = [];

			
		 	for(place in columnsName){

		 		var position_place = columnsName[place].toLowerCase() + "_pos"
		 		//console.log(position_place);
		 		// sum to y ---> parseInt(data[runner][position_place])

		 		points.push({id: parseInt(runner),
		 						x: parseFloat(columnDistance[place]),
		 						y: parseInt(data[runner][columnsName[place]]) + parseInt(data[runner][position_place]),
		 		});

			    labelsDataRunner.push({id: parseInt(runner),
		                x: parseFloat(columnDistance[place]),
		                y: parseInt(data[runner][columnsName[place]]) + parseInt(data[runner][position_place]),
		                elapsedTime: data[runner][columnsName[place]].toString().toHHMMSS(),
		                provPosition: data[runner][position_place], 
		                name: data[runner]['name']
		              })

		 	}
			
			runners.push({id: parseInt(runner), name: data[runner]["name"]})
			timeDataRunner.push(points)

		}
		//columnDistance = columnDistance.reverse()

		//************************************************************
		// Create Margins and Axis and hook our zoom function
		//************************************************************

		var self = this;
		this.cx = 1650; //amplada en pixels de l'interior (amb padding inclos)
		this.cy = 750; //altura en pixels de l'interior (amb padding inclos)

		var margin = {top: 0, right: 70, bottom: 50, left: 70},
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
				var tick_text = (columnsName[d/10]).toString()
				return tick_text;
			})
			.tickPadding(10)
			.tickSize(-height)
			//.tickFormat(d3.format('.1f'))

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
			.attr("width", width)
			.attr("height", height);

		//************************************************************
		// Create D3 line object + Pintar las lineas (corredores)
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
	  	// Zoom specific updates
	 	 //************************************************************
	  	function zoomed() {

		    // create new scale ojects based on event
		    var new_xScale = d3.event.transform.rescaleX(xScale);
		    var new_yScale = d3.event.transform.rescaleY(yScale);

		    // guarda scale dels labels per si es fa selectRider despres de zoom
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

updateChart(allYears[0]);


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
  
  // check if column name contains a letter in upper case
  return !(infoColumn == infoColumn.toLowerCase() && infoColumn != infoColumn.toUpperCase());
}