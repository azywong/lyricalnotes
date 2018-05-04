function loadviz4 () {
var margin = {top: 20, right: 200, bottom: 30, left: 50},
    width = 900 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;
var svg = d3.select("#chart svg")
          .attr("width", width + margin.left + margin.right)
          .attr("height", height + margin.top + margin.bottom)
var g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");


var parseTime = d3.timeParse("%Y"),
    bisectDate = d3.bisector(function(d) { return d.year; }).left;

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


d3.csv("data/viz4-mod.csv", function(d, _, columns) {
  var e = {}
  e.year = parseTime(d.year);
  for (var i = 1; i < columns.length; ++i) {
    var c = columns[i];
    e[c] = +d[c];
  }
  return e;
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

  var remove = function() {
    g.selectAll(".keyword").remove();
  }

  var draw = function (word) {
    var index = -1;
    word = word.trim();
    for (var i = 0; i < keywords.length; i++) {
      if (keywords[i].id == word) {
        index = i;
        break;
      }
    };
    if (index > -1) {
    var keyword = g.selectAll(".keyword")
  	.data([keywords[index]])
  	.enter().append("g")
  	.attr("class", "keyword");

    var paths = keyword.append("path")
      .attr("fill", "steelblue")
      .attr("d", function(d) {return area(d.values); })
    	.attr("opacity", 0.5)
    	.attr("id", function(d) {
        	return d.id.toUpperCase();
        });

    var focus = g.append("g")
          .attr("class", "focus")
          .style("display", "none");
  	focus.append("line")
          .attr("class", "x-hover-line hover-line")
          .attr("y1", 0)
          .attr("y2", height);

      focus.append("line")
          .attr("class", "y-hover-line hover-line")
          .attr("x1", width)
          .attr("x2", width);

      focus.append("text")
          .attr("x", 15)
        	.attr("dy", ".31em");

    svg.append("rect")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
          .attr("class", "overlay")
          .attr("width", width)
          .attr("height", height)
          .on("mouseover", function() { focus.style("display", null); })
          .on("mouseout", function() { focus.style("display", "none"); })
          .on("mousemove", mousemove);

      function mousemove() {
        var x0 = x.invert(d3.mouse(this)[0]),
            i = bisectDate(keywords[index].values, x0, 1),
            d0 = keywords[index].values[i - 1],
            d1 = keywords[index].values[i],
            d = x0 - d0.year > d1.year - x0 ? d1 : d0;
        focus.attr("transform", "translate(" + x(d.year) + "," + 0 + ")");
        focus.select("text").text(function() { return d.year.getFullYear() + "| " + d.count + " instances"; });
        focus.select(".x-hover-line").attr("y2", height);
        // focus.select(".y-hover-line").attr("x2", width);
      }
    } else {
      console.log("not found")
    }

  }

  draw("baby");
// New select element for allowing the user to select a group!
var $inputSelector = document.querySelector('.viz4-form');

$inputSelector.onsubmit = function(e) {
  e.preventDefault();
  remove()
  var word = document.querySelector('.input-select').value;
  console.log(word);
  draw(word);
};

});
}