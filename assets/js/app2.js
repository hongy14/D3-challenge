var svgWidth = 800;
var svgHeight = 500;

var margin = {
  top: 20,
  right: 20,
  bottom: 90,
  left: 90
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
var chosenYAxis = "healthcare"

function xScale(stateData, chosenXAxis) {
    var xLinearScale = d3.scaleLinear()
                         .domain([d3.min(stateData, d=>d[chosenXAxis]) * 0.8,
                                  d3.max(stateData, d=>d[chosenXAxis]) * 1.2])
                         .range([0, width]);

    return xLinearScale;
  }

function yScale(stateData, chosenYAxis) {
    var yLinearScale = d3.scaleLinear()
                         .domain([d3.min(stateData, d=>d[chosenYAxis]) * 0.8,
                                  d3.max(stateData, d=>d[chosenYAxis]) * 1.2])
                         .range([height, 0]);
  
    return yLinearScale;
  }

function renderXAxis(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);

    xAxis.transition()
         .duration(1000)
         .call(bottomAxis);
  
    return xAxis;
  }

function renderYAxis(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale);
  
    yAxis.transition()
         .duration(1000)
         .call(leftAxis);
    
    return yAxis;
  }

function renderXCircles(XcirclesGroup, newXScale, chosenXAxis) {
    XcirclesGroup.transition()
                 .duration(1000)
                 .attr("cx", d=> newXScale(d[chosenXAxis]))
              
    return XcirclesGroup;
  }

function renderYCircles(YcirclesGroup, newYScale, chosenYAxis) {
    YcirclesGroup.transition()
                 .duration(1000)
                 .attr("cy", d=> newYScale(d[chosenYAxis]))
                
    return YcirclesGroup;
  }

function renderText(textGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {
  textGroup.transition()
           .duration(1000)
           .attr("x", d => newXScale(d[chosenXAxis]))
           .attr("y", d => newYScale(d[chosenYAxis]));
    return textGroup;
}

d3.csv("assets/data/data.csv").then(function(stateData, err) {
    //console.log(data);
    if (err) throw err;

    stateData.forEach(function(data) {
        data.poverty = +data.poverty;
        data.age = +data.age;
        data.income = +data.income;
        data.healthcare = +data.healthcare;
        data.obesity = +data.obesity;
        data.smokes = +data.smokes;
    });

    var xLinearScale = xScale(stateData, chosenXAxis)

    var yLinearScale = yScale(stateData, chosenYAxis)

    var bottomAxis  = d3.axisBottom(xLinearScale);
    
    var leftAxis = d3.axisLeft(yLinearScale);

    var xAxis = chartGroup.append("g")
                          .classed("x-axis", true)
                          .attr("transform", `translate(0, ${height})`)
                          .call(bottomAxis);

    var yAxis = chartGroup.append("g")
                          .call(leftAxis);
    // append circles
    var XcirclesGroup = chartGroup.selectAll("circle")
                                  .data(stateData)
                                  .enter()
                                  .append("circle")
                                  .attr("cx", d => xLinearScale(d[chosenXAxis]))
                                  .attr("cy", d => yLinearScale(d[chosenYAxis]))
                                  .attr("r", "10")
                                  .attr("fill", "#8FBC8F")
                                  .attr("opacity", ".8")
    
    var YcirclesGroup = chartGroup.selectAll("circle")
                                  .data(stateData)
                                  .attr("cx", d => xLinearScale(d[chosenXAxis]))
                                  .attr("cy", d => yLinearScale(d[chosenYAxis]))
                                  .attr("r", "10")
                                  .attr("fill", "#8FBC8F")
                                  .attr("opacity", ".8");
    
    var textGroup = chartGroup.selectAll("stateText")
                                      .data(stateData)
                                      .enter()
                                      .append("text")
                                      .attr("x", d => xLinearScale(d[chosenXAxis]))
                                      .attr("y", d => yLinearScale(d[chosenYAxis]))
                                      .attr("fill", "black")
                                      .attr("stroke-width", "1px")
                                      .attr("font-size", "8.5px")
                                      .attr("text-anchor", "middle")
                                      .text(d=> `${d.abbr}`);  
                          
    var xlabelsGroup = chartGroup.append("g")
                                 .attr("transform", `translate(${width / 2}, ${height + 20})`);
    
    var ylabelsGroup = chartGroup.append("g")
                                 .attr("transform", `translate(0, ${height / 2})`);

    var povertyLabel = xlabelsGroup.append("text")
                                   .attr("x", 0)
                                   .attr("y", 20)
                                   .attr("value", "poverty") // value to grab for event listener
                                   .classed("active", true)
                                   .text("In Poverty (%)");

    var ageLabel = xlabelsGroup.append("text")
                               .attr("x", 0)
                               .attr("y", 40)
                               .attr("value", "age") // value to grab for event listener
                               .classed("inactive", true)
                               .text("Age (Median)");
                              
    var incomeLabel = xlabelsGroup.append("text")
                                  .attr("x", 0)
                                  .attr("y", 60)
                                  .attr("value", "income") // value to grab for event listener
                                  .classed("inactive", true)
                                  .text("Household Income (Median)");
    
    var healthcareLabel = ylabelsGroup.append("text")
                                      .attr("transform", "rotate(-90)")
                                      .attr("x", 0)
                                      .attr("y", -30)
                                      .attr("value", "healthcare") // value to grab for event listener
                                      .classed("active", true)
                                      .text("Lacks Healthcare (%)");
    
    var obesityLabel = ylabelsGroup.append("text")
                                   .attr("transform", "rotate(-90)")
                                   .attr("x", 0)
                                   .attr("y", -50)
                                   .attr("value", "obesity") // value to grab for event listener
                                   .classed("inactive", true)
                                   .text("Obesity (%)");
    
    var smokesLabel = ylabelsGroup.append("text")
                                  .attr("transform", "rotate(-90)")
                                  .attr("x", 0)
                                  .attr("y", -70)
                                  .attr("value", "smokes") // value to grab for event listener
                                  .classed("inactive", true)
                                  .text("Smokes (%)");

    xlabelsGroup.selectAll("text")
    .on("click", function() {
      // get value of selection
      var xvalue = d3.select(this).attr("value");
      if (xvalue !== chosenXAxis) {

        // replaces chosenXAxis with value
        chosenXAxis = xvalue;

        // functions here found above csv import
        // updates x scale for new data
        xLinearScale = xScale(stateData, chosenXAxis);

        // updates x axis with transition
        xAxis = renderXAxis(xLinearScale, xAxis);

        // updates circles with new x values
        XcirclesGroup = renderXCircles(XcirclesGroup, xLinearScale, chosenXAxis);
        
        textGroup = renderText(textGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
        // updates tooltips with new info
        //XcirclesGroup = updateToolTip(chosenXAxis, XcirclesGroup);

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

    ylabelsGroup.selectAll("text")
    .on("click", function() {

      var yvalue = d3.select(this).attr("value");
      if (yvalue !== chosenYAxis) {

        chosenYAxis = yvalue;

        yLinearScale = yScale(stateData, chosenYAxis);

        yAxis = renderYAxis(yLinearScale, yAxis);

        YcirclesGroup = renderYCircles(YcirclesGroup, yLinearScale, chosenYAxis);
        
        textGroup = renderText(textGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
        //YcirclesGroup = updateToolTip(chosenYAxis, YcirclesGroup);

        if (chosenYAxis === "healthcare") {
          healthcareLabel
            .classed("active", true)
            .classed("inactive", false);
          obesityLabel
            .classed("active", false)
            .classed("inactive", true);
          smokesLabel
            .classed("active", false)
            .classed("inactive", true)
        }
        else if (chosenYAxis === "obesity") {
          healthcareLabel
            .classed("active", false)
            .classed("inactive", true);
          obesityLabel
            .classed("active", true)
            .classed("inactive", false);
          smokesLabel
            .classed("active", false)
            .classed("inactive", true)
        } else {
          healthcareLabel
            .classed("active", false)
            .classed("inactive", true);
          obesityLabel
            .classed("active", false)
            .classed("inactive", true);
          smokesLabel
            .classed("active", true)
            .classed("inactive", false);
        }
      }
    });
}).catch(function(error) {
  console.log(error);                      
});