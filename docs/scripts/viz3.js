function loadviz3() {
  var svg = d3.select("#viz3 .chart svg"),
    margin = {top: 20, right: 200, bottom: 30, left: 100},
    width = 900 - margin.left - margin.right,
    height = 420 - margin.top - margin.bottom;
  svg.attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
  var g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");


var parseTime = d3.timeParse("%Y");

var x = d3.scaleTime().range([0, width]),
    y = d3.scaleLinear().rangeRound([height, 0]),
    z = d3.scaleOrdinal(d3.schemeCategory10);

var xAxis = d3.axisBottom(x)
	.tickFormat(d3.timeFormat("%Y"));
var yAxis = d3.axisLeft(y);

  var yGroup =  g.append("g")

  var xGroup = g.append("g")
      .attr("transform", "translate(0," + height + ")");

 var area = d3.area()
 		.curve(d3.curveBasis)
 		.y0(y(0))
    .x(function(d) { return x(d.year); })
    .y1(function(d) { return y(d.count); });

g.append("clipPath")
    .attr("id", "clip")
  .append("rect")
    .attr("width", width)
    .attr("height", height);

d3.csv("data/viz3_v2.csv", function(d, _, columns) {
  d.year = parseTime(d.year);
  for (var i = 1, n = columns.length, c; i < n; ++i) d[c = columns[i]] = +d[c];
  return d;
}, function(error, data) {
  if (error) throw error;
	var keywords = data.columns.slice(1).map(function(id) {
    return {
      id: id,
      values: data.map(function(d) {
        return {year: d.year, count: d[id]};
      })
    };
  });

  var xExtent = d3.extent(data, function(d) { return d.year; });

  x.domain(d3.extent(data, function(d) { return d.year; }));
  y.domain([
    d3.min(keywords, function(c) { return d3.min(c.values, function(d) { return d.count; }); }),
    d3.max(keywords, function(c) { return d3.max(c.values, function(d) { return d.count; }); })
  ]);
  z.domain(keywords.map(function(c) { return c.id; }));

  xGroup.call(xAxis);
	yGroup.call(yAxis)
    .append("text")
      .attr("fill", "#000")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", "0.71em")
      .attr("text-anchor", "end")
      .text("Count")
  	.select(".domain").remove();

  var keyword = g.selectAll(".keyword")
  	.data(keywords)
  	.enter().append("g")
  	.attr("class", "keyword");

  var paths = keyword.append("path")
  	.attr("clip-path", "url(#clip)")
    .attr("fill", function(d) { return z(d.id)})
    .attr("d", function(d) {return area(d.values); })
  	.attr("opacity", 0.5)
  	.attr("id", function(d) {
      	return d.id.toUpperCase();
      });

//   var zoom = d3.zoom()
//     .scaleExtent([1, 4])
//     .translateExtent([[-width, -Infinity], [width, Infinity]])
//     .on("zoom", zoomed);

//   var zoomRect = svg.append("rect")
//     .attr("width", width)
//     .attr("height", height)
//     .attr("fill", "none")
//     .attr("pointer-events", "all")
//     .call(zoom);

//     zoom.translateExtent([[x(xExtent[0]), -Infinity], [x(xExtent[1]), Infinity]])
//   	zoomRect.call(zoom.transform, d3.zoomIdentity);


// 		function zoomed() {
//       var xz = d3.event.transform.rescaleX(x);
//       xGroup.call(xAxis.scale(xz));
//       paths.attr("d", function(d) {
//         area.x(function(d) { return xz(d.year); });
//         return area(d.values);
//       })
//     }

  keyword.append("text")
      .datum(function(d) {
    return {id: d.id, value: d.values[d.values.length - 1]}; })
       .attr("x", width + 5)
  		.attr("fill", function(d) { return z(d.id); })
  		.attr("y", function (d, i) {
    			return margin.top + i*20;
  		})
      .attr("dy", "0.35em")
      .style("font", "15px sans-serif")
  		.text(function(d) { return d.id; })
    .on('click', function(d) {
    			var id = d.id.toUpperCase();
    			var isHidden   = this.isHidden ? false : true;
    			if (this.isHidden) {
            d3.select('#' + id).style('opacity', 0.5);
          } else {
            d3.select('#' + id).style('opacity', 0);
          }
          this.isHidden = isHidden;
       })
  	.on('mouseover', function(d) {
    		var id = d.id.toUpperCase();
    		paths.each(function (d, i) {
          d3.select(this)
          	.style("fill", "#cccccc");
        });
    		d3.select('#' + id)
          .style("fill", function(d) { return z(d.id); })
    			.style('opacity', 0.5);
    		this.isHidden = false;
    		var g = document.getElementById(id).parentNode;
    		g.parentNode.appendChild(g);
  		})
  		.on('mouseout', function (d) {
    		paths.each(function (d, i) {
          d3.select(this)
          	.style("fill", function(d) { return z(d.id); })
        });
  });
});
}