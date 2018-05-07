function loadviz2 () {
	var data, xScale, yScale, zScale, color, xAxis, yAxis;

	//strings to dates
	var parseTime = d3.timeParse("%Y-%m-%d");
	var parseDate = d3.timeParse("%Y-%m-%d");
	var parseYear = d3.timeParse("%Y");

	//dates to strings
	var formatTime = d3.timeFormat("%Y");

	var margin = {top: 170, right: 250, bottom: 50, left: 100},
		h = 550 - margin.top - margin.bottom,
		w = 900 - margin.right - margin.left;

	var svg = d3.select("#chart svg")
			    .attr("width", w + margin.left + margin.right)
			    .attr("height", h + margin.top + margin.bottom)
			  	.append("g");

	svg.append("text")
	   .attr("class", "axisLabels")
	   .attr("x", w/2 + margin.left)
	   .attr("text-anchor", "middle")
	   .attr("y", h + margin.top + margin.bottom - margin.bottom/2 + 20)
	   .text("Year");

	var yTitlePos = h/2 + margin.top;
	svg.append("text")
       .attr("class", "axisLabels")
	   .attr("x", 0)
	   .attr("y", 0)
	   .attr("text-anchor", "middle")
	   .attr("transform", "translate(30, " + yTitlePos + ")rotate(270)") // translate and rotate y axis label
	   .text("Number of Unique Words");

  	svg.append("text")
      	 .attr("x", (w+margin.right-margin.left)/2)
      	 .attr("y", margin.top/2-20)
      	 .attr("class", "title")
      	 .attr("transform", "translate(" + margin.left + ", " + margin.top + ")")
      	 .attr("text-anchor", "middle")
      	 // .attr("font-family", "sans-serif")
      	 .text("Vocabulary Across Time");

    svg.append("text")
       .attr("class", "subtitle")
       .attr("x", (w+margin.right-margin.left)/2)
	   .attr("y", margin.top/2 + 27-20)
	   .attr("text-anchor", "middle")
	   .text("Number Of Unique Words Of The Top 200 Most Popular Songs");

	// console.log("hi")

	// gridlines in y axis function
	function make_y_gridlines() {
	    return d3.axisLeft(yScale)
	    		 .ticks(5);
	}

	d3.csv("data/viz2_v4.csv", function(dataset) {

      	// console.log(dataset)

      	dataset.forEach(function (d) {
      		d.date = parseDate(d.date);
      		d.year = parseYear(d.year);
      		d.freq = +d.freq;
      		d.vocab = +d.vocab;
      	});

      	// console.log(dataset);

		//Get start and end dates in dataset
		var startDate = d3.min(dataset, function(d) { return d.date; });
		var endDate = d3.max(dataset, function(d) { return d.date; });

		// console.log(startDate);
		// console.log(endDate);

		//Create scale functions
		xScale = d3.scaleTime()
				   	.domain([
						d3.timeYear.offset(startDate, -1),  //startDate minus one year for padding
						d3.timeYear.offset(endDate, 1)	  //endDate plus one year for padding
					])
					.range([0, w]),

		yScale = d3.scaleLinear() //zero baseline
				   .domain([0, Math.ceil(d3.max(dataset, function(d) { return d.vocab/50; }))*50])
				   .range([h, 0]);

      	zScale = d3.scaleLinear() //zero baseline
				   .domain([0, d3.max(dataset, function(d) { return d.freq; })])
				   .range([2, 10]);

      	var colorScale = d3.scaleLinear()
				        .domain([d3.min(dataset, function(d) { return d.freq; }), d3.max(dataset, function(d) { return d.freq; })])
				        .range([0.4, 1]);

		var rScale = d3.scaleLinear()
				       .domain([d3.min(dataset, function(d) { return d.freq; }), d3.max(dataset, function(d) { return d.freq; })])
				       .range([3, 18]);

		//Define X axis
		xAxis = d3.axisBottom()
				  .scale(xScale)
				  .ticks(d3.timeYear.every(5));

		//Define Y axis
		yAxis = d3.axisLeft()
				  .scale(yScale)
				  .ticks(5);

		var xPosX = margin.left,
			xPosY = margin.top + h,
			yPosX = margin.left,
			yPosY = margin.top;

		// draw x axis
		svg.append("g")
			.attr("class", "axis")
			.attr("transform", "translate(" + xPosX + ", " + xPosY + ")")
			.call(xAxis);

		// draw y axis
		svg.append("g")
			.attr("class", "axis")
			.attr("transform", "translate(" + 80 + ", " + yPosY + ")")
			.call(yAxis);

		// add the Y gridlines
	  	svg.append("g")
	       .attr("class", "grid")
	       .style("stroke-width", 0.5)
	       .style("opacity", 0.05)
	       .attr("transform", "translate(" + 80 + ", " + yPosY + ")")
	       .call(make_y_gridlines().tickSize(-w*1.05).tickFormat(""));

	    var min = d3.min(dataset, function(d) { return d.freq; }),
	    	max = d3.max(dataset, function(d) { return d.freq; }),
	    	mid = Math.floor((max + min)/2);

	   	var legendBuffer = 70,
	   		yy = -30;

	   	// console.log(min, max, mid);

	    var legendData = [{"size":18, "value": max, "x": w + margin.left + legendBuffer, "y": margin.top + h/2 + 10 + yy},
	    				  {"size":10, "value": mid, "x": w + margin.left + legendBuffer, "y": margin.top + h/2 + 50 + yy},
	    				  {"size":3, "value": min, "x": w + margin.left + legendBuffer, "y": margin.top + h/2 + 90 + yy}];

		var legend = svg.selectAll(".legend")
		             	.data(legendData)
		                .enter()
		                .append("g")
		                .attr("class", "legend");

		legend.append("circle")
			.attr("class", "legendC")
			.attr("cx", function(c) { return c.x})
		    .attr("cy", function(c) { return c.y})
		    .attr("r", function(c) { return c.size})
		    .style("opacity", 0.7)
		    .style("fill", "rgb(255,165,0)");

		legend.append("text")
		    .attr("y", function(d){ return d.y + 4})
		    .attr("x", function(d){ return d.x + 27})
		    .attr("class", "legend")
		    .style("font-family", "Poppins")
		    .style("font-size", "12px")
		    .attr("text-anchor", "start")
		    .style("font-weight", "300")
		    .text(function(d) {return d.value});

		svg.append("text")
		    .attr("y", margin.top + h/2 - 60 + yy)
		    .attr("class", "legend")
		    .attr("x", w + margin.left + legendBuffer - 18)
		    .style("font-family", "Poppins")
		    .style("font-size", "15px")
		    .attr("text-anchor", "start")
		    .style("text-decoration", "underline")
		    .style("font-weight", "400")
		    .text("Legend");

		svg.append("text")
		    .attr("y", margin.top + h/2 - 45 + yy)
		    .attr("class", "legend")
		    .attr("x", w + margin.left + legendBuffer - 18)
		    .style("font-family", "Poppins")
		    .style("font-size", "12px")
		    .attr("text-anchor", "start")
		    .style("font-weight", "300")
		    .text("Number of times the");

		svg.append("text")
		    .attr("y", margin.top + h/2 - 32 + yy)
		    .attr("class", "legend")
		    .attr("x", w + margin.left + legendBuffer - 18)
		    .style("font-family", "Poppins")
		    .style("font-size", "12px")
		    .attr("text-anchor", "start")
		    .style("font-weight", "300")
		    .text("song has appeared");

		svg.append("text")
		    .attr("y", margin.top + h/2 - 19 + yy)
		    .attr("class", "legend")
		    .attr("x", w + margin.left + legendBuffer - 18)
		    .style("font-family", "Poppins")
		    .style("font-size", "12px")
		    .attr("text-anchor", "start")
		    .style("font-weight", "300")
		    .text("on the Hot 100");

		var circles = svg.selectAll(".circles")
		   .data(dataset)
		   .enter()
		   .append("circle")
		   .attr("class", "circles")
		   .attr("transform", "translate(" + margin.left + ", " + margin.top + ")")
	 	   .attr("id", function(d) { return d.artist; })
		   .attr("cx", function(d) {
		   		return xScale(d.date);
		   })
		   .attr("cy", function(d) {
		   		return yScale(d.vocab);
		   })
		   // ----------------------------
		   // OPTION 1
		   .attr("r", function(d) {
		   		return rScale(d.freq);
		   })
		   .style("fill", "rgb(255,165,0)")
		   // ----------------------------
		   // OPTION 2
		   // .attr("r", 6)
		   // .style("fill", function(d) {
		   // 		return d3.interpolateOranges(colorScale(d.freq));
		   // })
		   // ----------------------------
		   .on("mouseover", function(d) {

	     		d3.selectAll(".circles")
	     		  // .transition()
	     		  // .duration(50)
	     		  // .ease(d3.easeLinear)
	     		  .style("opacity", 0.3);

	     		d3.select(this)
	     		  // .transition(t)
	     		  // .style("stroke-width", 2)
	     		  // .style("stroke", "black")
	     		  .style("fill", "rgb(255,120,71)")
	     		  .style("opacity", 1);

	     		d3.selectAll(".legend")
	     		  .transition()
	     		  .duration(100)
	     		  .ease(d3.easeLinear)
	     		  .style("opacity", 0);

      			//Get x/y values
				var xPosition = parseFloat(d3.select(this).attr("cx"));
				var yPosition = parseFloat(d3.select(this).attr("cy"));

				var xOffset = margin.left-15;

				svg.append("text")
		          .attr("class", "tooltip")
		          .attr("x", xPosition-25)
		          .attr("y", yPosition-81)
		          .attr("transform", "translate(" + xOffset + ", " + margin.top + ")")
		          .attr("text-anchor", "start")
		          .style("font-weight", 600)
		          .style("font-size", "17px")
		          // .style("font-weight", "bold")
		          .text(d.name);

		        svg.append("text")
		          .attr("class", "tooltip")
		          .attr("x", xPosition-25)
		          .attr("y", yPosition-64)
		          .attr("transform", "translate(" + xOffset + ", " + margin.top + ")")
		          .attr("text-anchor", "start")
		          // .style("font-weight", 400)
		          .style("font-size", "15.5px")
		          .text(d.artist);

		        svg.append("text")
		          .attr("class", "tooltip")
		          .attr("x", xPosition-25)
		          .attr("y", yPosition-43)
		          .attr("transform", "translate(" + xOffset + ", " + margin.top + ")")
		          .attr("text-anchor", "start")
		          .style("font-size", "12px")
		          .text("Appearances: " + d.freq);

		        svg.append("text")
		          .attr("class", "tooltip")
		          .attr("x", xPosition-25)
		          .attr("y", yPosition-28)
		          .attr("transform", "translate(" + xOffset + ", " + margin.top + ")")
		          .attr("text-anchor", "start")
		          .style("font-size", "12px")
		          .text("Unique Words: " + d.vocab);

        	})
        	.on("mouseout", function(d) {

        		d3.selectAll(".tooltip").remove();

        		d3.selectAll(".legend")
	     		  .transition()
	     		  .delay(700)
	     		  .duration(100)
	     		  .ease(d3.easeLinear)
	     		  .style("opacity", 1);

	     		d3.selectAll(".legendC")
	     		  .transition()
	     		  .delay(700)
	     		  .duration(100)
	     		  .ease(d3.easeLinear)
	     		  .style("opacity", 0.7);

		        d3.selectAll(".circles")
	      //   	   .style("stroke-width", 0)
	      //   	   .style("fill", function(d) {
				   // 		return d3.interpolateOranges(colorScale(d.freq));
				   // })
				   .attr("r", function(d) {
				   		return rScale(d.freq);
				   })
				   .style("fill", "rgb(255,165,0)")
				   .style("opacity", 0.6);

		    });

	});

}