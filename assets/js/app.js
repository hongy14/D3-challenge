var svgWidth = 800;
var svgHeight = 500;

var margin = {
  top: 20,
  right: 20,
  bottom: 90,
  left: 50
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

var chosenXAxis = "poverty"

function xScale(stateData, chosenXAxis) {
  var xLinearScale = d3.scaleLinear()
                       .domain([d3.min(stateData, d=>d[chosenXAxis]) * 0.8,
                                d3.max(stateData, d=>d[chosenXAxis]) * 1.2])
                       .range([0, width]);

  return xLinearScale;
}

function renderAxis(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
       .duration(1000)
       .call(bottomAxis);
  
  return xAxis;
}

function renderCircles(circlesGroup, newXScale, chosenXAxis) {
  circlesGroup.transition()
              .duration(1000)
              .attr("cx", d=> newXScale(d[chosenXAxis]));
  
  return circlesGroup;
}

function updateToolTip(chosenXAxis, circlesGroup) {
  var label;

  if (chosenXAxis === "poverty") {
    label = "poverty";
  } else if (chosenXAxis === "age") {
    label = "age";
  } else {
    label = "income";
  }

  var toolTip = d3.tip()
                  .attr("class", "d3-tip")
                  .offset([80, -60])
                  .html(function(d){
                    return (`${d.state}<br>${label}<br>${d[chosenXAxis]}`)
                  })

  circlesGroup.call(toolTip);

  circlesGroup.on("mouseover", function(data) {
    toolTip.show(data);
  })
    .on("mouseout", function(data, index) {
      toolTip.hide(data);
    });

  return circlesGroup;
}

d3.csv("assets/data/data.csv").then(function(stateData, err) {
    //console.log(data);
    if (err) throw err;

    stateData.forEach(function(data) {
        data.poverty = +data.poverty;
        data.age = +data.age;
        data.income = +data.income;
        data.healthcare = +data.healthcare;
    });

    var xLinearScale = xScale(stateData, chosenXAxis)

    var yLinearScale = d3.scaleLinear()
                         .domain([d3.min(stateData, d=>d.healthcare)*0.8, d3.max(stateData, d=>d.healthcare)*1.2])
                         .range([height, 0]); 

    var bottomAxis  = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    var xAxis = chartGroup.append("g")
                          .classed("x-axis", true)
                          .attr("transform", `translate(0, ${height})`)
                          .call(bottomAxis);

    chartGroup.append("g")
              .call(leftAxis);

    // line generator
    //var line = d3.line()
    //.x(d => xScale(d.poverty))
    //.y(d => yScale(d.healthcare));

    // append circles
    var circlesGroup = chartGroup.selectAll("circle")
                                 .data(stateData)
                                 .enter()
                                 .append("circle")
                                 .attr("cx", d => xLinearScale(d[chosenXAxis]))
                                 .attr("cy", d => yLinearScale(d.healthcare))
                                 .attr("r", "8")
                                 .attr("fill", "#8FBC8F")
                                 .attr("opacity", ".8");
                         
    var labelsGroup = chartGroup.append("g")
                                .attr("transform", `translate(${width / 2}, ${height + 20})`);

    var povertyLabel = labelsGroup.append("text")
                                  .attr("x", 0)
                                  .attr("y", 20)
                                  .attr("value", "poverty") // value to grab for event listener
                                  .classed("active", true)
                                  .text("In Poverty (%)");

    var ageLabel = labelsGroup.append("text")
                              .attr("x", 0)
                              .attr("y", 40)
                              .attr("value", "age") // value to grab for event listener
                              .classed("inactive", true)
                              .text("Age (Median)");
                              
    var incomeLabel = labelsGroup.append("text")
                                 .attr("x", 0)
                                 .attr("y", 60)
                                 .attr("value", "income") // value to grab for event listener
                                 .classed("inactive", true)
                                 .text("Household Income (Median)");

    // append y axis
    chartGroup.append("text")
              .attr("transform", "rotate(-90)")
              .attr("y", 0 - margin.left)
              .attr("x", (0 - (height / 2)) - 60)
              .attr("dy", "1em")
              .classed("axis-text", true)
              .text("Lacks Healthcare (%)");

    // updateToolTip function above csv import
    var circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

    // x axis labels event listener
    labelsGroup.selectAll("text")
    .on("click", function() {
      // get value of selection
      var value = d3.select(this).attr("value");
      if (value !== chosenXAxis) {

        // replaces chosenXAxis with value
        chosenXAxis = value;

        // console.log(chosenXAxis)

        // functions here found above csv import
        // updates x scale for new data
        xLinearScale = xScale(stateData, chosenXAxis);

        // updates x axis with transition
        xAxis = renderAxis(xLinearScale, xAxis);

        // updates circles with new x values
        circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis);

        // updates tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

        // changes classes to change bold text
        if (chosenXAxis === "age") {
          ageLabel
            .classed("active", true)
            .classed("inactive", false);
          povertyLabel
            .classed("active", false)
            .classed("inactive", true);
          incomeLabel
            .classed("active", false)
            .classed("inactive", true)
        }
        else if (chosenXAxis === "poverty") {
          ageLabel
            .classed("active", false)
            .classed("inactive", true);
          povertyLabel
            .classed("active", true)
            .classed("inactive", false);
          incomeLabel
            .classed("active", false)
            .classed("inactive", true)
        } else {
          ageLabel
            .classed("active", false)
            .classed("inactive", true);
          povertyLabel
            .classed("active", false)
            .classed("inactive", true);
          incomeLabel
            .classed("active", true)
            .classed("inactive", false);
        }
      }
    });
}).catch(function(error) {
  console.log(error);                      
});
