function loadviz1() {
var margin = {top: 200, right: 200, bottom: 50, left: 100},
	h = 600 - margin.top - margin.bottom,
	w = 900 - margin.right - margin.left;

var svg = d3.select("#viz1 .chart svg")
		    .attr("width", w + margin.left + margin.right)
		    .attr("height", h + margin.top + margin.bottom)
		  	.append("g");

var t = d3.transition()
		  .duration(100)
		  .ease(d3.easeLinear);

// var imgs = svg.selectAll("image").data([0]);

//       imgs.enter()
//           .append("svg:image")
//           .attr("xlink:href", "2000px-Billboard_logo.png")
//           .attr("x", (w + margin.left + margin.right)/2 + 30)
//           .attr("y", margin.top/2 + 36.5)
//           .attr("text-anchor", "start")
//           .attr("width", "60")
//           .attr("height", "16");

// imgs.enter()
//     .append("svg:image")
//     .attr("xlink:href", "hot100-stack.svg")
//     .attr("x", 450)
//     .attr("y", margin.top/2 - 31)
//     .attr("width", "70")
//     .attr("height", "110");

svg.append("text")
   .attr("class", "title")
   .attr("x", (w + margin.left + margin.right)/2)
   .attr("y", margin.top/2 - 20)
   .attr("text-anchor", "middle")
   .text("Billboard's Hottest Artists");

svg.append("text")
   .attr("class", "title")
   .attr("x", (w + margin.left + margin.right)/2 - 10)
   .attr("y", margin.top/2 + 30)
   .attr("text-anchor", "middle")
   .text("1990 - 2015");

svg.append("text")
   .attr("class", "subtitle")
   .attr("x", (w + margin.left + margin.right)/2 - 10)
   .attr("y", margin.top/2 + 53)
   .attr("text-anchor", "middle")
   .text("By Number of Features in Billboard Top 100");

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
   .text("Number of Features");

svg.append("text")
   .attr("class", "instruction")
   .attr("x", w + margin.left + 20)
   .attr("y", margin.top - 40)
   .attr("text-anchor", "start")
   .text("Hover over text to filter");

svg.append("text")
   .attr("class", "instruction")
   .attr("x", w + margin.left + 20)
   .attr("y", margin.top - 28)
   .attr("text-anchor", "start")
   .text("Click for annotations");

var years = [1990, 1995, 2000, 2005, 2010, 2015];

var parseDate = d3.timeParse("%d/%m/%y");
var parseDate2 = d3.timeParse("%d/%m/%Y");

var rad = 12; // anno circle rad

var colors = {"kei":"rgb(255,165,0)",
			  "ken":"rgb(0,120,120)",
		      "mar":"rgb(255,105,180)",
			  "tay":"rgb(139,0,0)",
			  "tim":"rgb(20,20,200)"}

// arrat for plotted date, real-date of observation(rdate) and num weeks on chart for tswift
var annoTS = [{date:"23/4/2006", rdate:"23/9/2006", num:1},
			  {date:"22/11/2008", rdate:"22/11/2008", num:163},
			  {date:"6/4/2014", rdate:"6/9/2014", num:625},
			  {date:"26/12/2015", rdate:"26/12/2015", num:789}]
annoTS.forEach(function(d) {
	d.date = parseDate2(d.date);
})

var annoKC = [{date:"6/11/1998", rdate:"6/2/1999", num:8},
			  {date:"20/6/2009", rdate:"20/6/2009", num:491},
			  {date:"26/12/2015", rdate:"26/12/2015", num:695}]
annoKC.forEach(function(d) {
	d.date = parseDate2(d.date);
})

var annoTM = [{date:"5/1/1994", rdate:"5/3/1994", num:1},
			  {date:"12/6/2004", rdate:"12/6/2004", num:350},
			  {date:"15/12/2012", rdate:"15/12/2012", num:611},
			  {date:"26/12/2015", rdate:"26/12/2015", num:683}]
annoTM.forEach(function(d) {
	d.date = parseDate2(d.date);
})

var annoMC = [{date:"27/8/1990", rdate:"27/10/1990", num:22},
			  {date:"29/11/2004", rdate:"29/1/2005", num:397},
			  {date:"22/12/2012", rdate:"22/12/2012", num:575},
			  {date:"26/12/2015", rdate:"26/12/2015", num:587}]
annoMC.forEach(function(d) {
	d.date = parseDate2(d.date);
})

var annoKU = [{date:"15/11/2000", rdate:"15/7/2000", num:16},
			  {date:"23/12/2006", rdate:"23/12/2006", num:250},
			  {date:"18/4/2009", rdate:"18/4/2009", num:347},
			  {date:"26/12/2015", rdate:"26/12/2015", num:582}]
annoKU.forEach(function(d) {
	d.date = parseDate2(d.date);
})

// load in data
d3.csv("data/viz1ArtistsYearly.csv", function(dataset) {

	dataset.forEach(function (d) {
		d.date = parseDate(d.date);
		d.keith = +d.keith;
		d.kenny = +d.kenny;
		d.mariah = +d.mariah;
		d.taylor = +d.taylor;
		d.tim = +d.tim;
	});

	function killswitch() {
		switcher = 0; // turn off
			d3.selectAll(".annoCircle").transition(t).style("opacity", "0").remove();
			d3.selectAll(".annoNum").transition(t).style("opacity", "0").remove();
			d3.selectAll(".annotation-group-outline").transition(t).style("opacity", "0").remove();
			d3.selectAll(".annotation-group").transition(t).style("opacity", "0").remove();
	}

	var artists = dataset.columns.slice(1).map(function(id) {
		return {
			id: id,
			values: dataset.map(function (d) {
				return {date: d.date, count: d[id]}
			})
		}
	});
	// console.log(artists)

	var switcher = 0; // 0 = off, 1 = on

	var xScale = d3.scaleTime()
				   .domain(d3.extent(dataset, function(d) { return d.date; }))
				   .range([0, w]),
		yScale = d3.scaleLinear()
				   .domain([0, 800])
				   .range([h, 0]);

	var xAxis = d3.axisBottom()
				  .scale(xScale)
				  .ticks(d3.timeYear.every(5));
		yAxis = d3.axisLeft()
				  .scale(yScale);

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

	var artist = svg.selectAll(".artist")
	             	.data(artists)
	                .enter()
	                .append("g")
	                .attr("class", "artist");

	var line = d3.line()
			     .curve(d3.curveBasis)
			     .x(function(d) { return xScale(d.date); })
			     .y(function(d) { return yScale(d.count); });

	artist.append("path")
	      .attr("class", "line")
	      .attr("id", function(d) {
	        return d.id.substring(0,3).toLowerCase();
	      })
	      .attr("d", function(d) {
	      	return line(d.values);
	      })
	      .attr("transform", "translate(" + margin.left + ", " + margin.top + ")")
	      .style("fill", "none")
	      .style("stroke-width", "2")
	      .style("opacity", "0.7")
	      .style("stroke", function(d) {
	      	var col = d.id.substring(0,3).toLowerCase()
	      	return colors[col];
	      });

	 // initial text append function
	// artist.append("text")
 //          .datum(function(d) {
 //        		return {id: d.id, value: d.values[d.values.length - 1]};
 //          })
 //          .attr("transform", function(d) {
 //          	return "translate(" + xScale(d.value.date) + "," + yScale(d.value.count) + ")";
 //          })
 //          .attr("x", 10 + margin.left)
 //          .attr("y", margin.top)
 //          .text(function(d) {
 //          	return d.id;
 //          })
 //          .style("stroke", function(d) {
	//       	var col = d.id.substring(0,3).toLowerCase()
	//       	return colors[col];
	//       })
 //          .style("font", "10px sans-serif");

 	svg.append("rect")
	   .attr("height", h + margin.bottom + margin.top)
	   .attr("width", w + margin.left + margin.right)
	   .style("opacity", 0)
	   .style("fill", "blue")
	   .on("click", function (d) {
	   	if (switcher == 1) {
	   		killswitch();
	   		var keys = Object.keys(colors);
	       		for (index in colors) {
	       			var dur = 250, del = 0;
	       			d3.select("path#" + index)
	       			  .transition()
	       			  .delay(del)
	       			  .duration(dur)
	       			  .ease(d3.easeLinear)
	         	 	  .style("opacity", "0.7")
	       			  .style("stroke", function(d) {
				      	return colors[index];
				      });
	       			d3.selectAll(".axis path")
	       			  .style("opacity", "0")
	       			  .transition()
	       			  .delay(del)
	       			  .duration(dur)
	       			  .ease(d3.easeLinear)
	       			  .style("opacity", "0.3");
				    d3.select(".labels#" + index)
				      .style("opacity", "0")
	       			  .transition()
	       			  .delay(del)
	       			  .duration(dur)
	       			  .ease(d3.easeLinear)
	           		  .style("opacity", "1")
		      	  	  .style("fill", function(d) {
			      		return colors[index];
		   		  	  })
	       		}
	   	}
	   });

	// taylor swift label and interaction
 	svg.append("text")
 	   .attr("class", "labels")
 	   .attr("x", 20 + margin.left)
 	   .attr("id", function(d) {
 	   		var name = "Taylor Swift";
	        return name.substring(0,3).toLowerCase();
	   })
  	   .attr("y", margin.top + 2)
  	   .attr("transform", function(d) {
          	return "translate(" + xScale(dataset[dataset.length - 1].date) + "," + yScale(dataset[dataset.length - 1].taylor) + ")";
       })
       .attr("text-anchor", "start")
       .style("fill", function(d) {
	      	var col = this.id;
	      	return colors[col];
	   })
       .text("Taylor Swift")
       .on("mouseover", function (d) { // mouseover brushing
       		if (switcher == 0) {
	       		d3.selectAll("path")
	         	  .transition()
	         	  .duration(50)
	         	  .ease(d3.easeLinear)
	         	  .style("opacity", "0.3")
	              .style("stroke", "rgb(220,220,220)");
	            d3.selectAll(".labels")
	         	  .transition()
	         	  .duration(50)
	         	  .ease(d3.easeLinear)
	           	  .style("fill", "rgb(220,220,220)");
	         	d3.select("path#" + this.id)
	         	  .transition()
	         	  .duration(50)
	         	  .ease(d3.easeLinear)
	         	  .style("opacity", "1")
	           	  .style("stroke", function(d) {
		      		var col = this.id;
		      		return colors[col];
		      	  });
		      	d3.select(".labels#" + this.id)
	         	  .transition()
	         	  .duration(50)
	         	  .ease(d3.easeLinear)
		      	  .style("fill", function(d) {
			      	return colors[this.id];
		   		  })
	       	}
       })
       .on("mouseout", function (d) { // mouse off brushing and restoring
       		if (switcher == 0) {
       			var keys = Object.keys(colors);
	       		for (index in colors) {
	       			d3.select("path#" + index)
	         	 	  .transition(t)
	         	 	  .style("opacity", "0.7")
	       			  .style("stroke", function(d) {
				      	return colors[index];
				      });
	       			d3.selectAll(".axis path")
	       			  .style("opacity", "0.3");
				    d3.select(".labels#" + index)
	           		  .transition(t)
	           		  .style("opacity", "1")
		      	  	  .style("fill", function(d) {
			      		return colors[index];
		   		  	  })
	       		}
       		}
       })
       .on("click", function(d) {
       		if (switcher == 0) {
       			switcher = 1; // change switch
       			d3.selectAll("path")
	         	  .transition(t)
	         	  .style("opacity", "0");
				d3.selectAll(".labels")
	         	  .transition(t)
	           	  .style("opacity", "0");
	       		d3.select("path#" + this.id)
	         	  .transition(t)
	         	  .style("opacity", "1");
		      	d3.select(".labels#" + this.id)
	         	  .transition(t)
	         	  .style("opacity", "1")
		      	  .style("fill", function(d) {
			      	return colors[this.id];
		   		  });
		   		var annoCircles = svg.selectAll("annoCircle")
								   .data(annoTS)
								   .enter()
								   .append("circle")
								   .attr("class", "annoCircle")
								   .attr("cx", function(d) {
								   		return xScale(d.date) + margin.left;
								   })
								   .attr("cy", function(d) {
										return yScale(d.num) + margin.top;
								   })
								   .style("stroke-width", "1.5")
								   .style("stroke", colors.tay)
								   .style("fill", "white")
								   .transition(t)
								   .style("opacity", "1")
								   .attr("r", rad);
				var annoNums = svg.selectAll("text.annoNum")
								  .data(annoTS)
								  .enter()
								  .append("text")
								  .attr("class", "annoNum")
								  .attr("x", function(d) {
							   		return xScale(d.date) + margin.left;
								   })
								  .attr("y", function(d) {
									return yScale(d.num) + margin.top + 3.8;
								  })
								  .style("text-anchor", "middle")
								  .style("fill", colors.tay)
								  .transition(t)
								  .text(function(d) {
									return d.num;
			 					  });
			 	const annotationsElbow = [
				 							{
									          note: {
									            label: "Debut single Tim Mcgraw is released and features on Billboard's Top 100",
									            title: "September 2006",
									            wrap: 170
									          },
									          x: xScale(annoTS[0].date) + margin.left - rad,
									          y: yScale(annoTS[0].num) + margin.top - rad,
									          dy: -50,
									          dx: -100
									        },
									        {
									          note: {
									            label: "You Belong with Me hits the charts for the first of 50 consecutive weeks",
									            title: "November 2008",
									            wrap: 170
									          },
									          x: xScale(annoTS[1].date) + margin.left - rad,
									          y: yScale(annoTS[1].num) + margin.top - rad,
									          dy: -80,
									          dx: -90
									        }
								        ]
				const makeAnnotations = d3.annotation()
								          .type(d3.annotationCalloutElbow)
								          .annotations(annotationsElbow)
				d3.select("svg")
		          .append("g")
		          .attr("class", "annotation-group-outline")
		          .call(makeAnnotations)
		        d3.select("svg")
		          .append("g")
		          .attr("class", "annotation-group")
		          .call(makeAnnotations)
				const annotationsCallout = [
										        {
										          note: {
										            label: "T-Swift's second 50-week run begins with the release of Shake It Off",
										            title: "September 2014",
										            wrap: 170
										          },
										          x: xScale(annoTS[2].date) + margin.left - rad - 4,
										          y: yScale(annoTS[2].num) + margin.top,
										          dy: -0.1,
										          dx: -70
										        }
										    ]

		        const makeAnnotations1 = d3.annotation()
								         .type(d3.annotationCallout)
								         .annotations(annotationsCallout)
				d3.select("svg")
		          .append("g")
		          .attr("class", "annotation-group-outline")
		          .call(makeAnnotations1)
		        d3.select("svg")
		          .append("g")
		          .attr("class", "annotation-group")
		          .call(makeAnnotations1)
       		}
       		else {
       			killswitch();
       		}
       });

	// kenny chesney label and interaction
    svg.append("text")
 	   .attr("class", "labels")
 	   .attr("x", 20 + margin.left)
  	   .attr("y", margin.top - 3)
 	   .attr("id", function(d) {
 	   		var name = "Kenny Chesney";
	        return name.substring(0,3).toLowerCase();
	   })
  	   .attr("transform", function(d) {
          	return "translate(" + xScale(dataset[dataset.length - 1].date) + "," + yScale(dataset[dataset.length - 1].kenny) + ")";
       })
       .attr("text-anchor", "start")
       .style("fill", function(d) {
	      	var col = this.id;
	      	return colors[col];
	   })
       .text("Kenny Chesney")
       .on("mouseover", function (d) { // mouseover brushing
       		if (switcher == 0) {
	       		d3.selectAll("path")
	         	  .transition()
	         	  .duration(50)
	         	  .ease(d3.easeLinear)
	         	  .style("opacity", "0.3")
	              .style("stroke", "rgb(220,220,220)");
	            d3.selectAll(".labels")
	         	  .transition()
	         	  .duration(50)
	         	  .ease(d3.easeLinear)
	           	  .style("fill", "rgb(220,220,220)");
	         	d3.select("path#" + this.id)
	         	  .transition()
	         	  .duration(50)
	         	  .ease(d3.easeLinear)
	         	  .style("opacity", "1")
	           	  .style("stroke", function(d) {
		      		var col = this.id;
		      		return colors[col];
		      	  });
		      	d3.select(".labels#" + this.id)
	         	  .transition()
	         	  .duration(50)
	         	  .ease(d3.easeLinear)
		      	  .style("fill", function(d) {
			      	return colors[this.id];
		   		  })
	       	}
       })
       .on("mouseout", function (d) { // mouse off brushing and restoring
       		if (switcher == 0) {
       			var keys = Object.keys(colors);
	       		for (index in colors) {
	       			d3.select("path#" + index)
	         	 	  .transition(t)
	         	 	  .style("opacity", "0.7")
	       			  .style("stroke", function(d) {
				      	return colors[index];
				      });
	       			d3.selectAll(".axis path")
	       			  .style("opacity", "0.3");
				    d3.select(".labels#" + index)
	           		  .transition(t)
	           		  .style("opacity", "1")
		      	  	  .style("fill", function(d) {
			      		return colors[index];
		   		  	  })
	       		}
       		}
       })
       .on("click", function(d) {
       		if (switcher == 0) {
       			switcher = 1; // change switch
       			d3.selectAll("path")
	         	  .transition(t)
	         	  .style("opacity", "0");
				d3.selectAll(".labels")
	         	  .transition(t)
	           	  .style("opacity", "0");
	       		d3.select("path#" + this.id)
	         	  .transition(t)
	         	  .style("opacity", "1");
		      	d3.select(".labels#" + this.id)
	         	  .transition(t)
	         	  .style("opacity", "1")
		      	  .style("fill", function(d) {
			      	return colors[this.id];
		   		  });
		   		var annoCircles = svg.selectAll("annoCircle")
								   .data(annoKC)
								   .enter()
								   .append("circle")
								   .attr("class", "annoCircle")
								   .attr("cx", function(d) {
								   		return xScale(d.date) + margin.left;
								   })
								   .attr("cy", function(d) {
										return yScale(d.num) + margin.top;
								   })
								   .style("fill", "white")
								   .style("stroke-width", "1.5")
								   .style("stroke", colors.ken)
								   .transition(t)
								   .attr("r", rad);
				var annoNums = svg.selectAll("text.annoNum")
								  .data(annoKC)
								  .enter()
								  .append("text")
								  .attr("class", "annoNum")
								  .attr("x", function(d) {
							   		return xScale(d.date) + margin.left;
								   })
								  .attr("y", function(d) {
									return yScale(d.num) + margin.top + 3.8;
								  })
								  .style("text-anchor", "middle")
								  .style("fill", colors.ken)
								  .transition(t)
								  .text(function(d) {
									return d.num;
			 					  });
			 	const annotationsElbow = [
				 							{
									          note: {
									            label: "Chesney's How Forever Feels features on the Top 100 for the first of 20 weeks",
									            title: "February 1999",
									            wrap: 120
									          },
									          x: xScale(annoKC[0].date) + margin.left,
									          y: yScale(annoKC[0].num) + margin.top - rad*1.5,
									          dy: -60,
									          dx: -0.5
									        },
									        {
									          note: {
									            label: "Out Last Night climbs to spot 16, the highest spot of all Chesney's songs",
									            title: "June 2009",
									            wrap: 120
									          },
									          x: xScale(annoKC[1].date) + margin.left - rad,
									          y: yScale(annoKC[1].num) + margin.top - rad,
									          dy: -30,
									          dx: -70
									        }
								        ]
				const makeAnnotations = d3.annotation()
								          .type(d3.annotationCalloutElbow)
								          .annotations(annotationsElbow)
				d3.select("svg")
		          .append("g")
		          .attr("class", "annotation-group-outline")
		          .call(makeAnnotations)
		        d3.select("svg")
		          .append("g")
		          .attr("class", "annotation-group")
		          .call(makeAnnotations)
       		}
       		else {
       			killswitch();
       		}
       });

    // tim mcgraw label and interaction
    svg.append("text")
 	   .attr("class", "labels")
 	   .attr("x", 20 + margin.left)
  	   .attr("y", margin.top + 9)
 	   .attr("id", function(d) {
 	   		var name = "Tim Mcgraw";
	        return name.substring(0,3).toLowerCase();
	   })
  	   .attr("transform", function(d) {
          	return "translate(" + xScale(dataset[dataset.length - 1].date) + "," + yScale(dataset[dataset.length - 1].tim) + ")";
       })
       .attr("text-anchor", "start")
       .style("fill", function(d) {
	      	var col = this.id;
	      	return colors[col];
	   })
       .text("Tim McGraw")
       .on("mouseover", function (d) { // mouseover brushing
       		if (switcher == 0) {
	       		d3.selectAll("path")
	         	  .transition()
	         	  .duration(50)
	         	  .ease(d3.easeLinear)
	         	  .style("opacity", "0.3")
	              .style("stroke", "rgb(220,220,220)");
	            d3.selectAll(".labels")
	         	  .transition()
	         	  .duration(50)
	         	  .ease(d3.easeLinear)
	           	  .style("fill", "rgb(220,220,220)");
	         	d3.select("path#" + this.id)
	         	  .transition()
	         	  .duration(50)
	         	  .ease(d3.easeLinear)
	         	  .style("opacity", "1")
	           	  .style("stroke", function(d) {
		      		var col = this.id;
		      		return colors[col];
		      	  });
		      	d3.select(".labels#" + this.id)
	         	  .transition()
	         	  .duration(50)
	         	  .ease(d3.easeLinear)
		      	  .style("fill", function(d) {
			      	return colors[this.id];
		   		  })
	       	}
       })
       .on("mouseout", function (d) { // mouse off brushing and restoring
       		if (switcher == 0) {
       			var keys = Object.keys(colors);
	       		for (index in colors) {
	       			d3.select("path#" + index)
	         	 	  .transition(t)
	         	 	  .style("opacity", "0.7")
	       			  .style("stroke", function(d) {
				      	return colors[index];
				      });
	       			d3.selectAll(".axis path")
	       			  .style("opacity", "0.3");
				    d3.select(".labels#" + index)
	           		  .transition(t)
	           		  .style("opacity", "1")
		      	  	  .style("fill", function(d) {
			      		return colors[index];
		   		  	  })
	       		}
       		}
       })
       .on("click", function(d) {
       		if (switcher == 0) {
       			switcher = 1; // change switch
       			d3.selectAll("path")
	         	  .transition(t)
	         	  .style("opacity", "0");
				d3.selectAll(".labels")
	         	  .transition(t)
	           	  .style("opacity", "0");
	       		d3.select("path#" + this.id)
	         	  .transition(t)
	         	  .style("opacity", "1");
		      	d3.select(".labels#" + this.id)
	         	  .transition(t)
	         	  .style("opacity", "1")
		      	  .style("fill", function(d) {
			      	return colors[this.id];
		   		  });
		   		var annoCircles = svg.selectAll("annoCircle")
								   .data(annoTM)
								   .enter()
								   .append("circle")
								   .attr("class", "annoCircle")
								   .attr("cx", function(d) {
								   		return xScale(d.date) + margin.left;
								   })
								   .attr("cy", function(d) {
										return yScale(d.num) + margin.top;
								   })
								   .style("fill", "white")
								   .style("stroke-width", "1.5")
								   .style("stroke", colors.tim)
								   .transition(t)
								   .style("opacity", "1")
								   .attr("r", rad);
				var annoNums = svg.selectAll("text.annoNum")
								  .data(annoTM)
								  .enter()
								  .append("text")
								  .attr("class", "annoNum")
								  .attr("x", function(d) {
							   		return xScale(d.date) + margin.left;
								   })
								  .attr("y", function(d) {
									return yScale(d.num) + margin.top + 3.8;
								  })
								  .style("text-anchor", "middle")
								  .style("fill", colors.tim)
								  .transition(t)
								  .text(function(d) {
									return d.num;
			 					  });
			 	const annotationsElbow = [
				 							{
									          note: {
									            label: "McGraw and Indian Outlaw debut with a 20-week run",
									            title: "March 1994",
									            wrap: 100
									          },
									          x: xScale(annoTM[0].date) + margin.left ,
									          y: yScale(annoTM[0].num) + margin.top - rad*1.5,
									          dy: -40,
									          dx: -0.5
									        },
									        {
									          note: {
									            label: "Live Like You Were Dying, McGraw's most popular song, with 23 features, is released",
									            title: "June 2004",
									            wrap: 140
									          },
									          x: xScale(annoTM[1].date) + margin.left - rad,
									          y: yScale(annoTM[1].num) + margin.top - rad,
									          dy: -50,
									          dx: -70
									        },
									        {
									          note: {
									            label: "One Of Those Nights, and subsequent releases Highway Don't Care and Trucker Girl, keep McGraw on the Top 100 till December 2013",
									            title: "December 2012",
									            wrap: 140,
									            padding: 10
									          },
									          x: xScale(annoTM[2].date) + margin.left,
									          y: yScale(annoTM[2].num) + margin.top + rad*1.5,
									          dy: 50,
									          dx: 0
									        }
								        ]
				const makeAnnotations = d3.annotation()
								          .type(d3.annotationCalloutElbow)
								          .annotations(annotationsElbow)
				d3.select("svg")
		          .append("g")
		          .attr("class", "annotation-group-outline")
		          .call(makeAnnotations)
		        d3.select("svg")
		          .append("g")
		          .attr("class", "annotation-group")
		          .call(makeAnnotations)
       		}
       		else {
       			killswitch();
       		}
       });

	// mariah carey label and interaction
    svg.append("text")
 	   .attr("class", "labels")
 	   .attr("x", 20 + margin.left)
  	   .attr("y", margin.top - 3)
 	   .attr("id", function(d) {
 	   		var name = "Mariah Carey";
	        return name.substring(0,3).toLowerCase();
	   })
  	   .attr("transform", function(d) {
          	return "translate(" + xScale(dataset[dataset.length - 1].date) + "," + yScale(dataset[dataset.length - 1].mariah) + ")";
       })
       .attr("text-anchor", "start")
       .style("fill", function(d) {
	      	var col = this.id;
	      	return colors[col];
	   })
       .text("Mariah Carey")
       .on("mouseover", function (d) { // mouseover brushing
       		if (switcher == 0) {
	       		d3.selectAll("path")
	         	  .transition()
	         	  .duration(50)
	         	  .ease(d3.easeLinear)
	         	  .style("opacity", "0.3")
	              .style("stroke", "rgb(220,220,220)");
	            d3.selectAll(".labels")
	         	  .transition()
	         	  .duration(50)
	         	  .ease(d3.easeLinear)
	           	  .style("fill", "rgb(220,220,220)");
	         	d3.select("path#" + this.id)
	         	  .transition()
	         	  .duration(50)
	         	  .ease(d3.easeLinear)
	         	  .style("opacity", "1")
	           	  .style("stroke", function(d) {
		      		var col = this.id;
		      		return colors[col];
		      	  });
		      	d3.select(".labels#" + this.id)
	         	  .transition()
	         	  .duration(50)
	         	  .ease(d3.easeLinear)
		      	  .style("fill", function(d) {
			      	return colors[this.id];
		   		  })
	       	}
       })
       .on("mouseout", function (d) { // mouse off brushing and restoring
       		if (switcher == 0) {
       			var keys = Object.keys(colors);
	       		for (index in colors) {
	       			d3.select("path#" + index)
	         	 	  .transition(t)
	         	 	  .style("opacity", "0.7")
	       			  .style("stroke", function(d) {
				      	return colors[index];
				      });
	       			d3.selectAll(".axis path")
	       			  .style("opacity", "0.3");
				    d3.select(".labels#" + index)
	           		  .transition(t)
	           		  .style("opacity", "1")
		      	  	  .style("fill", function(d) {
			      		return colors[index];
		   		  	  })
	       		}
       		}
       })
       .on("click", function(d) {
       		if (switcher == 0) {
       			switcher = 1; // change switch
       			d3.selectAll("path")
	         	  .transition(t)
	         	  .style("opacity", "0");
				d3.selectAll(".labels")
	         	  .transition(t)
	           	  .style("opacity", "0");
	       		d3.select("path#" + this.id)
	         	  .transition(t)
	         	  .style("opacity", "1");
		      	d3.select(".labels#" + this.id)
	         	  .transition(t)
	         	  .style("opacity", "1")
		      	  .style("fill", function(d) {
			      	return colors[this.id];
		   		  });
		   		var annoCircles = svg.selectAll("annoCircle")
								   .data(annoMC)
								   .enter()
								   .append("circle")
								   .attr("class", "annoCircle")
								   .attr("cx", function(d) {
								   		return xScale(d.date) + margin.left;
								   })
								   .attr("cy", function(d) {
										return yScale(d.num) + margin.top;
								   })
								   .style("fill", "white")
								   .style("stroke-width", "1.5")
								   .style("stroke", colors.mar)
								   .transition(t)
								   .style("opacity", "1")
								   .attr("r", rad);
				var annoNums = svg.selectAll("text.annoNum")
								  .data(annoMC)
								  .enter()
								  .append("text")
								  .attr("class", "annoNum")
								  .attr("x", function(d) {
							   		return xScale(d.date) + margin.left;
								   })
								  .attr("y", function(d) {
									return yScale(d.num) + margin.top + 3.8;
								  })
								  .style("text-anchor", "middle")
								  .style("fill", colors.mar)
								  .transition(t)
								  .text(function(d) {
									return d.num;
			 					  });
			 	const annotationsElbow = [
				 							{
									          note: {
									            label: "Carey's Vision Of Love run, which comprises of 4 weeks in the number 1 spot, ends",
									            title: "October 1990",
									            wrap: 100
									          },
									          x: xScale(annoMC[0].date) + margin.left ,
									          y: yScale(annoMC[0].num) + margin.top - rad*1.5,
									          dy: -100,
									          dx: 0
									        },
									        {
									          note: {
									            label: "A stellar 2005 for Carey, boosted by collaborations and hits It's Like That and We Belong Together, earns her multiple features each week for 58 weeks, and an incredible 16 weeks in the number 1 spot",
									            title: "January 2005",
									            wrap: 200,
									            padding: 10
									          },
									          x: xScale(annoMC[1].date) + margin.left,
									          y: yScale(annoMC[1].num) + margin.top + rad*1.5,
									          dy: 20,
									          dx: 0
									        },
									        {
									          note: {
									            label: "All I Want For Christmas sneaks up on the charts; it happens again in 2013, 2014, and in 2015",
									            title: "December 2012",
									            wrap: 140,
									          },
									          x: xScale(annoMC[2].date) + margin.left - rad,
									          y: yScale(annoMC[2].num) + margin.top - rad,
									          dy: -20,
									          dx: -20
									        }
								        ]
				const makeAnnotations = d3.annotation()
								          .type(d3.annotationCalloutElbow)
								          .annotations(annotationsElbow)
				d3.select("svg")
		          .append("g")
		          .attr("class", "annotation-group-outline")
		          .call(makeAnnotations)
		        d3.select("svg")
		          .append("g")
		          .attr("class", "annotation-group")
		          .call(makeAnnotations)
       		}
       		else {
       			killswitch();
       		}
       });

	// keith urban label and interaction
    svg.append("text")
 	   .attr("class", "labels")
 	   .attr("x", 20 + margin.left)
  	   .attr("y", margin.top + 12)
 	   .attr("id", function(d) {
 	   		var name = "Keith Urban";
	        return name.substring(0,3).toLowerCase();
	   })
  	   .attr("transform", function(d) {
          	return "translate(" + xScale(dataset[dataset.length - 1].date) + "," + yScale(dataset[dataset.length - 1].keith) + ")";
       })
       .attr("text-anchor", "start")
       .style("fill", function(d) {
	      	var col = this.id;
	      	return colors[col];
	   })
       .text("Keith Urban")
       .on("mouseover", function (d) { // mouseover brushing
       		if (switcher == 0) {
	       		d3.selectAll("path")
	         	  .transition()
	         	  .duration(50)
	         	  .ease(d3.easeLinear)
	         	  .style("opacity", "0.3")
	              .style("stroke", "rgb(220,220,220)");
	            d3.selectAll(".labels")
	         	  .transition()
	         	  .duration(50)
	         	  .ease(d3.easeLinear)
	           	  .style("fill", "rgb(220,220,220)");
	         	d3.select("path#" + this.id)
	         	  .transition()
	         	  .duration(50)
	         	  .ease(d3.easeLinear)
	         	  .style("opacity", "1")
	           	  .style("stroke", function(d) {
		      		var col = this.id;
		      		return colors[col];
		      	  });
		      	d3.select(".labels#" + this.id)
	         	  .transition()
	         	  .duration(50)
	         	  .ease(d3.easeLinear)
		      	  .style("fill", function(d) {
			      	return colors[this.id];
		   		  })
	       	}
       })
       .on("mouseout", function (d) { // mouse off brushing and restoring
       		if (switcher == 0) {
       			var keys = Object.keys(colors);
	       		for (index in colors) {
	       			d3.select("path#" + index)
	         	 	  .transition(t)
	         	 	  .style("opacity", "0.7")
	       			  .style("stroke", function(d) {
				      	return colors[index];
				      });
	       			d3.selectAll(".axis path")
	       			  .style("opacity", "0.3");
				    d3.select(".labels#" + index)
	           		  .transition(t)
	           		  .style("opacity", "1")
		      	  	  .style("fill", function(d) {
			      		return colors[index];
		   		  	  })
	       		}
       		}
       })
       .on("click", function(d) {
       		if (switcher == 0) {
       			switcher = 1; // change switch
       			d3.selectAll("path")
	         	  .transition(t)
	         	  .style("opacity", "0");
				d3.selectAll(".labels")
	         	  .transition(t)
	           	  .style("opacity", "0");
	       		d3.select("path#" + this.id)
	         	  .transition(t)
	         	  .style("opacity", "1");
		      	d3.select(".labels#" + this.id)
	         	  .transition(t)
	         	  .style("opacity", "1")
		      	  .style("fill", function(d) {
			      	return colors[this.id];
		   		  });
		   		var annoCircles = svg.selectAll("annoCircle")
								   .data(annoKU)
								   .enter()
								   .append("circle")
								   .attr("class", "annoCircle")
								   .attr("cx", function(d) {
								   		return xScale(d.date) + margin.left;
								   })
								   .attr("cy", function(d) {
										return yScale(d.num) + margin.top;
								   })
								   .style("fill", "white")
								   .style("stroke-width", "1.5")
								   .style("stroke", colors.kei)
								   .transition(t)
								   .style("opacity", "1")
								   .attr("r", rad);
				var annoNums = svg.selectAll("text.annoNum")
								  .data(annoKU)
								  .enter()
								  .append("text")
								  .attr("class", "annoNum")
								  .attr("x", function(d) {
							   		return xScale(d.date) + margin.left;
								   })
								  .attr("y", function(d) {
									return yScale(d.num) + margin.top + 3.8;
								  })
								  .style("text-anchor", "middle")
								  .style("fill", colors.kei)
								  .transition(t)
								  .text(function(d) {
									return d.num;
			 					  });
			 	const annotationsElbow = [
				 							{
									          note: {
									            label: "Debut song Your Everything features on the Top 100 for the 16th week",
									            title: "October 1990",
									            wrap: 130
									          },
									          x: xScale(annoKU[0].date) + margin.left - rad,
									          y: yScale(annoKU[0].num) + margin.top - rad,
									          dy: -50,
									          dx: -80
									        },
									        {
									          note: {
									            label: "At this point of his career, following Stupid Boy's release, Urban has had multiple songs with 20-week chart runs; impressively, his shortest run was 14 weeks with Once In A Lifetime",
									            title: "December 2016",
									            wrap: 150,
									          },
									          x: xScale(annoKU[1].date) + margin.left - rad,
									          y: yScale(annoKU[1].num) + margin.top - rad,
									          dy: -60,
									          dx: -80
									        },
									        {
									          note: {
									            label: "Urban releases Kiss A Girl, his best performing song, which peaks at 16th spot",
									            title: "April 2009",
									            wrap: 200,
									            padding: 10
									          },
									          x: xScale(annoKU[2].date) + margin.left,
									          y: yScale(annoKU[2].num) + margin.top + rad*1.5,
									          dy: 20,
									          dx: 0
									        }
								        ]
				const makeAnnotations = d3.annotation()
								          .type(d3.annotationCalloutElbow)
								          .annotations(annotationsElbow)
				d3.select("svg")
		          .append("g")
		          .attr("class", "annotation-group-outline")
		          .call(makeAnnotations)
		        d3.select("svg")
		          .append("g")
		          .attr("class", "annotation-group")
		          .call(makeAnnotations)
       		}
       		else {
       			killswitch();
       		}
       });

	});
}
