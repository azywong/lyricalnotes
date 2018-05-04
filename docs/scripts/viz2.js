function loadviz2 () {

//to-do
/*
	bring highlighted song to front (append)
	use color to highlight the songs by the same artist (use class)
  legend for color
  sync colors
  rewrite labels with css
*/

		var width = 800;
		var height = 470;
		var padding = 100;
    var xLabel = "Year";
    var yLabel1 = "Number";
    var yLabel2 = "of words";
    var title = "Unique Word Count of Top Songs";

		var dataset, xScale, yScale, zScale, color, xAxis, yAxis;

		//strings to dates
		var parseTime = d3.timeParse("%Y-%m-%d");

		//dates to strings
		var formatTime = d3.timeFormat("%Y");

		//Function for converting CSV values from strings to Dates and numbers
			var rowConverter = function(d) {
				return {
          song_name: d.song_name,
          artist: d.artist,
					first_app: parseTime(d.first_app),
					vocab: parseInt(d.vocab),
					num_apps: parseInt(d.num_apps)
				};
			}

		d3.csv("data/viz2.csv", rowConverter, function(data) {
				//Copy data into global dataset
      dataset = data;

				//Get start and end dates in dataset
				var startDate = d3.min(dataset, function(d) { return d.first_app; });
				var endDate = d3.max(dataset, function(d) { return d.first_app; });

				//Create scale functions
				xScale = d3.scaleTime()
							   .domain([
									d3.timeYear.offset(startDate, -1),  //startDate minus one year for padding
									d3.timeYear.offset(endDate, 1)	  //endDate plus one year for padding
								  ])
							   .range([padding, width - padding]);
				yScale = d3.scaleLinear() //zero baseline
							   .domain([0, d3.max(dataset, function(d) { return d.vocab; })])
							   .range([height - padding, padding]);

      	zScale = d3.scaleLinear() //zero baseline
							   .domain([0, d3.max(dataset, function(d) { return d.num_apps; })])
							   .range([2, 10]);

      	color = d3.scaleQuantize()
      					.domain([d3.min(dataset, function(d){ return d.num_apps; }), d3.max(dataset, function(d){ return d.num_apps; })])
      					.range(["rgb(107,183,255)", "rgb(28,188,0)", "rgb(255,242,127)", "rgb(255,195,127)", "rgb(255,127,135)"]); //sync colors with group

				//Define X axis
				xAxis = d3.axisBottom()
								  .scale(xScale)
								  .ticks(10)
								  .tickFormat(formatTime);
				//Define Y axis
				yAxis = d3.axisLeft()
								  .scale(yScale)
								  .ticks(10);

				//Create SVG element
				var svg = d3.select("#viz2 .chart svg")
							.attr("width", width)
							.attr("height", height);

				var circles = svg.selectAll("circle")
				   .data(dataset)
				   .enter()
				   .append("circle")
        	 .attr("id", function(d) { return d.artist; })
				   .attr("cx", function(d) {
				   		return xScale(d.first_app);
				   })
				   .attr("cy", function(d) {
				   		return yScale(d.vocab);
				   })
				   .attr("r", function(d) {
          		//return zScale(d.num_apps);
          		return d.num_apps * 0.1;
        	 })
        	 .attr("fill", function(d){
             return color(d.num_apps);
           })
        	 .on("mouseover", function(d) {
             circles.transition()
             				.attr("fill", "LightGray");

          //Get x/y values
					var xPosition = parseFloat(d3.select(this).attr("cx"));
					var yPosition = parseFloat(d3.select(this).attr("cy")) / 2 + height / 2;
					//Update the tooltip position and value
					var tooltip = d3.select("#tooltip")
						.style("left", xPosition + "px")
						.style("top", yPosition + "px")

          tooltip.select("#title")
          			 .text(d.song_name)

          tooltip.select("#artist")
								 .text(d.artist)

          tooltip.select("#first_app")
           			 .text(formatTime(d.first_app));

          tooltip.select("#num_apps")
          			 .text(d.num_apps);


					//Show the tooltip
					d3.select("#tooltip").classed("hidden", false);
        	 })
        	 .on("mouseout", function(d) {
          	d3.select("#tooltip").classed("hidden", true);
            circles.transition(t)
            		 .attr("fill", function(d) {
            			return color(d.num_apps);
           });
            			 //.attr("fill", "black");
        });

	   			//Create X axis
	   			svg.append("g")
	   				.attr("class", "axis")
	   				.attr("transform", "translate(0," + (height - padding) + ")")
	   				.call(xAxis);

	   			//Create Y axis
	   			svg.append("g")
	   				.attr("class", "axis")
	   				.attr("transform", "translate(" + padding + ",0)")
	   				.call(yAxis);


      		//rewrite below with css later

      		//x-axis label
      		svg.append("text")
          	 .attr("x", width/2 - 20)
          	 .attr("y", height - 50)
          	 .attr("font-family", "sans-serif")
          	 .attr("font-size", "12px")
          	 .text(xLabel);

      		//y-axis label
      		svg.append("text")
          	 .attr("x", 10)
          	 .attr("y", height/2)
          	 .attr("font-family", "sans-serif")
          	 .attr("font-size", "12px")
          	 .text(yLabel1);

      		svg.append("text")
          	 .attr("x", 10)
          	 .attr("y", height/2 + 20)
             .attr("font-family", "sans-serif")
          	 .attr("font-size", "12px")
          	 .text(yLabel2);

      		svg.append("text")
          	 .attr("x", width/4)
          	 .attr("y", 50)
          	 .attr("font-family", "sans-serif")
          	 .attr("font-size", "24px")
          	 .text(title);

			});
}