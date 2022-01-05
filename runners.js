var svg;
var height;
var timeDataRunner = [];
var labelsDataRunner = []; //informacio de les etiquetes
var arrKmMostrar = [];
var runners = [];

var varEtiquetesTemps = 80;

var xScaleLabel;
var yScaleLabel;

var showNAxisChart = 4;
var separacioEntreKm = 10;

file_ori = 'utmb_'
file_new = 'df_'
currentYear = 2017

d3.csv("./results/" + file_new + currentYear + ".csv", function(data){

	//Array[Names]
	columnsName = d3.keys(data[0]).filter(isPlace)

	//Array[distance]
	columnDistance = Array.from({length: columnsName.length}, (_, i) => i * 10)


	//se modifica el valor de columnsName por un valor entero, representa los segundos
	// for(var i = 0; i < data.length; i++){

	// 	columnsName.forEach(function(key){

	// 		var time = data[i][key]

	// 		var hour = time.slice(0, 2);
	// 		var min = time.slice(3, 5);
	// 		var sec = time.slice(6, 8);
	// 		data[i][key] = (parseInt(hour) * 60 * 60) + (parseInt(min) * 60) + parseInt(sec)
	// 	});
	// }

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
	                elapsedTime: myTime(data[runner][columnsName[place]])
	              })

	 	}
		
		runners.push({id: parseInt(runner), name: data[runner]["name"]})
		timeDataRunner.push(points)

	}

	columnDistance_reverse = columnDistance.reverse()

	//************************************************************
	// Create Margins and Axis and hook our zoom function
	//************************************************************

	var self = this;
	this.cx = 1650; //amplada en pixels de l'interior (amb padding inclos)
	this.cy = 750; //altura en pixels de l'interior (amb padding inclos)

	var margin = {top: 0, right: 40, bottom: 20, left: 40},
	  width = this.cx - margin.left - margin.right;

	height = this.cy - margin.top - margin.bottom;

	var xScale = d3.scaleLinear()
	  .domain([parseFloat(columnDistance_reverse[0]) , 0])
	  .range([0, width])
	  //.domain([0, columnDistance_reverse[0].length - 1])
	 
	xScaleLabel = xScale;

	var yScale = d3.scaleLinear()
	  .domain([0, valorElapsedMax(timeDataRunner)])
	  .range([0, height])

	yScaleLabel = yScale;

	var xAxis = d3.axisBottom(xScale)
		.tickValues(columnDistance_reverse)
		.tickFormat(d3.format('.1f'))
		//.tickFormat(function(d){
		//	return columnsName[d];
		//})
		.tickPadding(10)
		.tickSize(-height)
	// .ticks(6)

	var yAxis = d3.axisLeft(yScale)
	.tickPadding(10)
	.tickSize(-width)
	.ticks(5)


	//************************************************************
	// Generate our SVG object
	//************************************************************  


	svg = d3.select("#stage_id")
	 .append("svg")
	 .attr("viewBox", "-40 20 1650 750")
	 .style("overflow", "visible")
	

	//var arr_kmMostrar = updateAxisXKm(xScale.domain(), columnDistance_reverse);
	var arr_km_show = columnDistance_reverse

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
});

function myTime(time) {
  var hr = ~~(time / 3600);
  var min = ~~((time % 3600) / 60);
  var sec = time % 60;
  var sec_min = "";
  if (hr > 0) {
     sec_min += "" + hr + ":" + (min < 10 ? "0" : "");
  }
  if(isNaN(sec)) return "-";
  sec_min += "" + min + "' " + (sec < 10 ? "0" : "");
  sec_min += "" + sec + "\"";
  return sec_min;
}

function updateAxisXKm(arryDomain, columnsKm){

    var km_maxim_vist = arryDomain[0];
    var km_minim_vist = arryDomain[1];

    var rang_visio = km_maxim_vist - km_minim_vist;

    var inc = rang_visio /(showNAxisChart + 1);

    var inc_ampliat = Math.ceil(inc/separacioEntreKm) * separacioEntreKm;

    var rang_ampliat = inc_ampliat * (showNAxisChart + 1);

    var inc_rang = rang_ampliat - rang_visio;

    var km_min = km_minim_vist - inc_rang / 2;
    arrKmMostrar = [];

    if(rang_visio > (separacioEntreKm * (showNAxisChart + 1))){

      for (var i = 1; i <= showNAxisChart ; i++){
        var km = Math.round((km_min + i * inc_ampliat) / separacioEntreKm) * separacioEntreKm;
        arrKmMostrar.push(km);
      }
    }
    else{

      var inici;
      for(var i = 0; i < columnsKm.length; i++){ //busquem el primer km vist
        if(km_maxim_vist >= parseFloat(columnsKm[i])){ 
          inici = i; 
          break;
        }
      }
      var final = columnsKm.length - 1;
      for(var i = inici + 1; i < columnsKm.length; i++){ //busquem el darrer km vist

        if(km_minim_vist <= parseFloat(columnsKm[i])){
         final = i;
        }
      }

      if(final - inici < showNAxisChart){ //si no n'hi ha masses, els guardo tots
      
        for(var j = inici; j < columnsKm.length; j++){
          arrKmMostrar.push(parseFloat(columnsKm[j]))
        }
      }
      else{ //n'hi ha masses, miro quins hauria de mostrar i els busco
        var kms =[];

        for(var i = 0; i < showNAxisChart; i++){
          kms.unshift(km_min + i * inc_ampliat)
        }

        var j=0;
        for(var i = inici; i < final-1 && j < showNAxisChart; i++){

          if(columnsKm[i] >= kms[j] && columnsKm[i+1] < kms[j]){
            arrKmMostrar.push(parseFloat(columnsKm[i]))
            j++;

          }
        }
      }      
    }
    arrKmMostrar = arrKmMostrar.filter(function(element){
      return element <= arryDomain[0] && element >= arryDomain[1];
    });

    return arrKmMostrar;
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