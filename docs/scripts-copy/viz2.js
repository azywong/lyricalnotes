function loadviz2 () {
var xLabel = "Year";
    var yLabel1 = "Number";
    var yLabel2 = "of words";
    var title = "Unique Word Count of Top Songs";

	var data, xScale, yScale, zScale, color, xAxis, yAxis;

	//strings to dates
	var parseTime = d3.timeParse("%Y-%m-%d");
	var parseDate = d3.timeParse("%Y-%m-%d");
	var parseYear = d3.timeParse("%Y");

	//dates to strings
	var formatTime = d3.timeFormat("%Y");

	var margin = {top: 50, right: 250, bottom: 50, left: 100},
		h = 600 - margin.top - margin.bottom,
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

  	// svg.append("text")
   //    	 .attr("x", (w+margin.right-margin.left)/2)
   //    	 .attr("y", margin.top/2)
   //    	 .attr("class", "title")
   //    	 .attr("transform", "translate(" + margin.left + ", " + margin.top + ")")
   //    	 .attr("text-anchor", "middle")
   //    	 // .attr("font-family", "sans-serif")
   //    	 .text("Unique Word Count of Top Songs");

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

		var circles = svg.selectAll("circle")
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

	     		d3.selectAll("circle")
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

      			//Get x/y values
				var xPosition = parseFloat(d3.select(this).attr("cx"));
				var yPosition = parseFloat(d3.select(this).attr("cy"));

				svg.append("text")
		          .attr("class", "tooltip")
		          .attr("x", xPosition-25)
		          .attr("y", yPosition-81)
		          .attr("transform", "translate(" + margin.left + ", " + margin.top + ")")
		          .attr("text-anchor", "start")
		          .style("font-weight", 600)
		          .style("font-size", "17px")
		          // .style("font-weight", "bold")
		          .text(d.name);

		        svg.append("text")
		          .attr("class", "tooltip")
		          .attr("x", xPosition-25)
		          .attr("y", yPosition-64)
		          .attr("transform", "translate(" + margin.left + ", " + margin.top + ")")
		          .attr("text-anchor", "start")
		          // .style("font-weight", 400)
		          .style("font-size", "15.5px")
		          .text(d.artist);

		        svg.append("text")
		          .attr("class", "tooltip")
		          .attr("x", xPosition-25)
		          .attr("y", yPosition-43)
		          .attr("transform", "translate(" + margin.left + ", " + margin.top + ")")
		          .attr("text-anchor", "start")
		          .style("font-size", "12px")
		          .text("Appearances: " + d.freq);

		        svg.append("text")
		          .attr("class", "tooltip")
		          .attr("x", xPosition-25)
		          .attr("y", yPosition-28)
		          .attr("transform", "translate(" + margin.left + ", " + margin.top + ")")
		          .attr("text-anchor", "start")
		          .style("font-size", "12px")
		          .text("Unique Words: " + d.vocab);

        	})
        	.on("mouseout", function(d) {

        		d3.selectAll(".tooltip").remove();

		        d3.selectAll("circle")
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