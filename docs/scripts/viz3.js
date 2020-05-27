function loadviz3() {
  var margin = {top: 120, right: 250, bottom: 100, left: 100},
        width = 900 - margin.left - margin.right,
        height = 550 - margin.top - margin.bottom;

    var svg = d3.select("#chart svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g");

    var g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var parseTime = d3.timeParse("%Y");
    var parseDate = d3.timeParse("%Y-%m-%d");

    var x = d3.scaleTime().range([0, width]),
        y = d3.scaleLinear().rangeRound([height, 0]),
        z = d3.scaleOrdinal(d3.schemeCategory10);

    var xAxis = d3.axisBottom(x)
            .tickFormat(d3.timeFormat("%Y"))
            .ticks(d3.timeYear.every(5));

    var yAxis = d3.axisLeft(y)
            .ticks(4);

    var yGroup = g.append("g")
            .attr("transform", "translate("+ (0) + ",0)")

    var xGroup = g.append("g")
                .attr("transform", "translate(0," + height + ")");

    var area = d3.area()
          .curve(d3.curveBasis)
          .y0(y(0))
            .x(function(d) { return x(d.year); })
            .y1(function(d) { return y(d.count); });

    var line = d3.line()
             .curve(d3.curveBasis)
             .x(function(d) { return x(d.year); })
             .y(function(d) { return y(d.count); });

    g.append("clipPath")
        .attr("id", "clip")
        .append("rect")
        .attr("width", width)
        .attr("height", height);

    var colors = {"love":"rgb(220,20,60)",
            "baby":"rgb(135,206,250)",
              "why":"rgb(128,0,128)",
              "money":"rgb(0,139,139)",
            "burn":"rgb(255,99,71)"}

    g.append("text")
           .attr("class", "title")
           .attr("x", width/2)
       .attr("y", -45)
       .attr("text-anchor", "middle")
       .text("Words Across Time");

    g.append("text")
           .attr("class", "subtitle")
           .attr("x", width/2)
       .attr("y", -25)
       .attr("text-anchor", "middle")
       .text("Number Of Times Selected Words Were Used Each Year");

    g.append("text")
           .attr("class", "instruction")
           .attr("x", width + 25)
       .attr("y", margin.top -22)
       .attr("text-anchor", "start")
       .text("Hover over text to filter");

    g.append("text")
           .attr("class", "instruction")
           .attr("x", width + 25)
       .attr("y", margin.top - 10)
       .attr("text-anchor", "start")
       .text("Click for annotations");

    d3.csv("data/viz3_FINAL.csv", function(d, _, columns) {
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
        d3.max(keywords, function(c) {
          return Math.ceil(d3.max(c.values, function(d) { return d.count/5000; }))*5000;
        })
    ]);
    z.domain(keywords.map(function(c) { return c.id; }));

      xGroup.call(xAxis)
          .append("text")
        .attr("class", "axis")
          .attr("fill", "#000")
          .attr("y", 50)
          .attr("x", width/2)
          .attr("text-anchor", "middle")
          .style("font-family", "Poppins")
          .style("font-size", "12px")
          .text("Year")
        .select(".domain").remove();

    yGroup.call(yAxis)
        .append("text")
        .attr("class", "axis")
          .attr("fill", "#000")
          .attr("transform", "rotate(-90)")
          .attr("y", -margin.left/1.5)
          .attr("x", -height/2)
          .attr("dy", "0.71em")
          .attr("text-anchor", "middle")
          .style("font-family", "Poppins")
          .style("font-size", "12px")
          .text("Count")
        .select(".domain").remove();

      var keyword = g.selectAll(".keyword")
              .data(keywords)
              .enter().append("g")
              .attr("class", "keyword");

      var paths = keyword.append("path")
                .attr("clip-path", "url(#clip)")
                .attr("class", "pathAreas")
                .attr("fill", function(d) { return colors[d.id]})
                .attr("d", function(d) {return area(d.values); })
                .attr("opacity", 0.8)
                .attr("id", function(d) {
                    return d.id.toUpperCase();
                });

    // var lines = keyword.append("path")
    //          .attr("clip-path", "url(#clip)")
    //          .attr("class", "pathLines")
    //            .attr("d", function(d) {return line(d.values); })
    //            .style("opacity", 0.3)
    //            .style("fill", "none")
    //            .style("stroke-width", 0)
    //            .style("stroke", function(d) {
    //              return colors[d.id];
    //            })
    //            .attr("id", function(d) {
    //                return d.id.toUpperCase();
    //            });

    var clicked = false;

    keyword.append("text")
            .datum(function(d) {
            return {id: d.id, value: d.values[d.values.length - 1]};
          })
            .attr("x", width + 23)
          .attr("fill", function(d) { return colors[d.id]; })
          .attr("y", function (d, i) {
              return margin.top + 30 + i*40;
          })
          .attr("text-anchor", "start")
            .style("font-family", "Noto Sans")
            .style("font-weight", "400")
            .style("font-size", "30px")
          .text(function(d) { return "\"" + d.id[0].toUpperCase() + d.id.substr(1) + "\""; })
          .on('click', function(d) {
            if (clicked == false) {
              clicked = true;
              var id = d.id.toUpperCase();
              // console.log(id)
              if (id == "BURN") {
                const annotationsElbow = [
                            {
                                  note: {
                                    label: "Ellie Goulding's \"Burn\" is released, but oddly, this is the beginning of the decline of the word's popularity. It makes you wonder things doesn't it?",
                                    title: "August 2013",
                                    wrap: 250
                                  },
                                  connector: {
                                    end: "arrow" // 'arrow' also available
                                  },
                                  x: x(parseDate("2013-08-10")) + margin.left,
                                  y: y(2000) + margin.top,
                                  dy: -50,
                                  dx: -0.1
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
            else if (id == "LOVE") {
              const annotationsElbow = [
                            {
                                  note: {
                                    label: "In the wake of September 11, rallies for peace and outpours of support sees the word \"love\" flood the airwaves.",
                                    title: "September 2001",
                                    wrap: 250,
                                    align: "middle"
                                  },
                                  connector: {
                                    end: "arrow",
                                  },
                                  x: x(parseDate("2001-09-11")) + margin.left,
                                  y: y(11400) + margin.top,
                                  dy: -50,
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
            else if (id == "BABY") {
              const annotationsElbow = [
                            {
                                  note: {
                                    label: "Yes, you guessed it! It was at this fateful moment in time that we were blessed with Justin Bieber's \"Baby\". Subsequently, the word became less popular.",
                                    title: "January 2010",
                                    wrap: 250
                                  },
                                  connector: {
                                    end: "arrow",
                                  },
                                  x: x(parseDate("2010-01-12")) + margin.left,
                                  y: y(11900) + margin.top,
                                  dy: -50,
                                  dx: -0.1
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
            else if (id == "WHY") {
              const annotationsElbow = [
                            {
                                  note: {
                                    label: "The first Shrek movie was released. Judging from the downward trend, people's questions were answered.",
                                    title: "April 2001",
                                    wrap: 120,
                                    // align: "middle"
                                  },
                                  connector: {
                                    end: "arrow" // 'arrow' also available
                                    // type: "curve"
                                    // points: [[100, 14],[190, 52]],
                                  },
                                  x: x(parseDate("2001-04-11")) + margin.left,
                                  y: y(3800) + margin.top,
                                  dy: -60,
                                  dx: -60
                                },
                                {
                                  note: {
                                    label: "The second Shrek movie was released. Yet again, questions were answered.",
                                    title: "May 2014",
                                    wrap: 110,
                                    align: "middle"
                                  },
                                  connector: {
                                    end: "arrow" // 'arrow' also available
                                  },
                                  x: x(parseDate("2004-05-11")) + margin.left,
                                  y: y(3800) + margin.top,
                                  dy: -60,
                                  dx: 0
                                },
                                {
                                  note: {
                                    label: "You're smart. Figure this one out yourself.",
                                    title: "May 2017",
                                    wrap: 100,
                                    // align: "middle"
                                  },
                                  connector: {
                                    end: "arrow" // 'arrow' also available
                                    // type: "curve",
                                    //can also add a curve type, e.g. curve: d3.curveStep
                                    // points: [[100, 14],[190, 52]]
                                  },
                                  x: x(parseDate("2007-05-18")) + margin.left,
                                  y: y(4000) + margin.top,
                                  dy: -55,
                                  dx: 55
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
            else if (id == "MONEY") {
              const annotationsElbow = [
                            {
                                  note: {
                                    label: "Following the 2008 Financial Crisis, the music industry attempted to stimulate the economy by pumping out music that featured the word \"money\". Conspiracy theories suggest that the crisis was brought about by the general public's devaluation of money over the course of 2006.",
                                    title: "September 2008",
                                    wrap: 250
                                  },
                                  connector: {
                                    end: "arrow" // 'arrow' also available
                                  },
                                  x: x(parseDate("2008-09-12")) + margin.left,
                                  y: y(2500) + margin.top,
                                  dy: -50,
                                  dx: -0.1
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
            }
            })
          .on('mouseover', function(d) {
            d3.event.stopPropagation();
            var id = d.id.toUpperCase();
            d3.selectAll(".pathLines")
              .style("opacity", 0.8)
              // .style("stroke", "black")
              .style("stroke-width", 1.5);
            paths.each(function (d, i) {
              if (this.id != id) {
                d3.select(this)
                      .style("fill", function(d) { return colors[d.id]; })
                      .style("opacity", 0)
                      .style("fill", "none");
              }
              });
            d3.select('#' + id)
              // .transition()
              // .duration(100)
              // .ease(d3.easeLinear)
                  .style("fill", function(d) {
                    return colors[d.id];
                  })
              .style('opacity', 1);
              // this.isHidden = false;
            // var g = document.getElementById(id).parentNode;
            // g.parentNode.appendChild(g);
          })
          .on('mouseout', function (d) {
            // d3.event.stopPropagation();
            // d3.selectAll(".pathLines")
          //    .style("opacity", 0);
            clicked = false;
            paths.each(function (d, i) {
                  d3.select(this)
             //       .transition()
                // .duration(100)
                // .ease(d3.easeLinear)
                    .style("opacity", 0.8)
                    .style("fill", function(d) { return colors[d.id]; })
              });
              d3.selectAll(".annotation-group-outline")
                .transition()
                .duration(100)
                .ease(d3.easeLinear)
                .style("opacity", "0")
                .remove();
              d3.selectAll(".annotation-group")
                .transition()
                .duration(100)
                .ease(d3.easeLinear)
                .style("opacity", "0")
                .remove();
          });

    });

}