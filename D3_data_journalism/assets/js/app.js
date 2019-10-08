// @TODO: YOUR CODE HERE!
var svgWidth = 960;
var svgHeight = 500;

var margin = {
  top: 20,
  right: 80,
  bottom: 100,
  left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Append an SVG group
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);



// Initial Params
var chosenXAxis = "poverty";
var chosenYAxis = "obesity";

// function used for updating x-scale var upon click on axis label
function xScale(censusData, chosenXAxis) {
  // create scales
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(censusData, d => d[chosenXAxis]) * 0.8,
      d3.max(censusData, d => d[chosenXAxis]) * 1.2
    ])
    .range([0, width]);
  return xLinearScale;
}
// function used for updating xAxis var upon click on axis label
function renderAxeX(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);
  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);
  return xAxis;
}

function yScale(censusData, chosenYAxis) {
    // create scales
    var yLinearScale = d3.scaleLinear()
      .domain([0, d3.max(censusData, d => d[chosenYAxis]) * 1.2])
      .range([height,0]);
    return yLinearScale;
  }
function renderAxeY(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale);
    yAxis.transition()
      .duration(1000)
      .call(leftAxis);
    return yAxis;
  }
// function used for updating circles group with a transition to
// new circles
function renderCircles(circlesGroup, newXScale, chosenXaxis, newYScale, chosenYaxis, xLinearScale, yLinearScale) {

  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]))
    .attr("cy", d => newYScale(d[chosenYAxis]));

  circlesGroupText.transition()
    .duration(1000)
    .attr("dx", d => newXScale(d[chosenXAxis]))
    .attr("dy", d => newYScale(d[chosenYAxis]));

  return circlesGroup, circlesGroupText;
}


// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup, xLinearScale, yLinearScale) {

    if (chosenXAxis === "poverty") {
      var xlabel = "In Poverty (%):";
    }
    else if (chosenXAxis === "age") {
      var xlabel = "Age (Median):";
    }
    else if (chosenXAxis === "income") {
      var xlabel = "Household income (Median):";
    }

    if (chosenYAxis === "obesity") {
      var ylabel = "Obesity (%):";
    }
    else if (chosenYAxis === "smokes") {
      var ylabel = "Smokes (%):";
    }
    else if (chosenYAxis === "healthcare") {
      var ylabel = "Lacks Healthcare (%):";
    }

    var toolTip = d3.tip()
      .attr("class", "tooltip")
      .offset([80, -60])
      .html(function(d) {
        return (`${d.state} (${d.abbr}) <br>${xlabel} ${d[chosenXAxis]} <br>${ylabel} ${d[chosenYAxis]}`);
      });
  
    circlesGroup.call(toolTip);
  
    circlesGroup.on("mouseover", function(data) {
      toolTip.show(data);
    })
      // onmouseout event
      .on("mouseout", function(data, index) {
        toolTip.hide(data);
      });
  
    return circlesGroup;
  }


// Retrieve data from the CSV file and execute everything below
d3.csv("assets/data/data.csv").then(function(censusData, err) {
    if (err) throw err;
  
    // parse data
    censusData.forEach(function(data) {
      data.poverty = +data.poverty;
      data.age = +data.age;
      data.income = +data.income;
      data.obesity = +data.obesity;
      data.smokes = +data.smokes;
      data.healthcare = +data.healthcare;
    //   data.state = +data.state;
    //   data.abbr = +data.abbr;
    //  data.id = +data.id;
    
    });
    console.log(censusData)
    // xLinearScale function above csv import
    var xLinearScale = xScale(censusData, chosenXAxis);
  
    // // Create y scale function
    var yLinearScale = yScale(censusData, chosenYAxis);
  
    // Create initial axis functions
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);
  
    // append x axis
    var xAxis = chartGroup.append("g")
      .classed("x-axis", true)
      .attr("transform", `translate(0, ${height})`)
      .call(bottomAxis);
  
    // append y axis
    var yAxis = chartGroup.append("g")
      .classed("y-axis", true)
      .call(leftAxis);
  
    // append initial circles
    var circlesGroup = chartGroup.selectAll("circle")
      .data(censusData)
      .enter()
      .append("circle")
      .attr("cx", d => xLinearScale(d[chosenXAxis]))
      .attr("cy", d => yLinearScale(d[chosenYAxis]))
      .attr("r", 15)
      .attr("fill", "blue")
      .attr("opacity", ".75")
    
    var circlesGroupText = chartGroup.selectAll("text.text-circle")
      .data(censusData)
      .enter()
      .append("text")
      .text(d => d.abbr)
      .attr("dx", d => xLinearScale(d[chosenXAxis])-7)
      .attr("dy", d => yLinearScale(d[chosenYAxis])+3)
    //   .attr("dy",3)
    //   .attr("dx",-7)
      .attr("font-size","10px")
      .attr("fill", "white");
    
 
    // Create group for  3 x- axis labels and 3 y- axis labels
    var xlabelsGroup = chartGroup.append("g")
      .attr("transform", `translate(${width / 2}, ${height + 20})`);
 

    var povertyLabel = xlabelsGroup.append("text")
      .attr("x", 0)
      .attr("y", 20)
      .attr("value", "poverty") // value to grab for event listener
      .classed("active", true)
      .attr("dx", "1em")
      .text("In Poverty (%)");
  
    var ageLabel = xlabelsGroup.append("text")
      .attr("x", 0)
      .attr("y", 40)
      .attr("value", "age") // value to grab for event listener
      .classed("inactive", true)
      .attr("dx", "1em")
      .text("Age(Median)");

    var incomeLabel = xlabelsGroup.append("text")
      .attr("x", 0)
      .attr("y", 60)
      .attr("value", "income") // value to grab for event listener
      .classed("inactive", true)
      .attr("dx", "1em")
      .text("Household Income(Median)");
  
    // // append y axis
    // chartGroup.append("text")
    //   .attr("transform", "rotate(-90)")
    //   .attr("y", 40 - margin.left)
    //   .attr("x", 0 - (height / 2))
    //   .attr("dy", "1em")
    //   .attr("dx", "1em")
    //   .classed("axis-text", true)
    //   .text("Obesity (%)");

    var ylabelsGroup = chartGroup.append("g")
      .attr("transform", "rotate(0)", `translate(${height / 2}, ${0- width}`);

      
    var obesityLabel = ylabelsGroup.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", 0 - (height / 2))
      .attr("y", 0 - margin.left)
      .attr("value", "obesity") // value to grab for event listener
      .classed("active", true)
      .attr("dy", "1em")
      .text("Obesity (%)");


    var smokesLabel = ylabelsGroup.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", 0 - (height / 2))
      .attr("y", 20 - margin.left)
      .attr("value", "smokes") // value to grab for event listener
      .classed("inactive", true)
      .attr("dy", "1em")
      .text("Smokes (%)");
  
    var healthcareLabel = ylabelsGroup.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", 0 - (height / 2))
      .attr("y", 40 - margin.left)
      .attr("value", "healthcare") // value to grab for event listener
      .classed("inactive", true)
      .attr("dy", "1em")
      .text("Lacks Healthcare (%)");


    // updateToolTip function above csv import
    var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup, xLinearScale, yLinearScale);
  
    // x axis labels event listener
    // chosenYAxis = chosenYAxis;
    // chosenXAxis = chosenXAxis;

    xlabelsGroup.selectAll("text")
      .on("click", function() {
        // get value of selection
        var value = d3.select(this).attr("value");
        
        if (value !== chosenXAxis) {
  
          // replaces chosenXAxis with value
          chosenXAxis = value;
  
        //   console.log(chosenXAxis)
  
          // functions here found above csv import
          // updates x scale for new data
          xLinearScale = xScale(censusData, chosenXAxis);
  
          // updates x axis with transition
          xAxis = renderAxeX(xLinearScale, xAxis);
  
          // updates circles with new x values
          circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis,yLinearScale, chosenYAxis);
            
          circlesGroupText = renderCircles(circlesGroupText, xLinearScale, chosenXAxis,yLinearScale, chosenYAxis);
          // updates tooltips with new info

          circlesGroup = updateToolTip(circlesGroupText, xLinearScale, chosenXAxis,yLinearScale, chosenYAxis);
  
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
              .classed("inactive", true);
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
              .classed("inactive", true);
          }
          else if (chosenXAxis === "income") {
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
      .on("click", function()   {
        var value = d3.select(this).attr("value");
        
        if (value !== chosenYAxis) {
  
            // replaces chosenXAxis with value
            chosenYAxis = value;
    
            // console.log(chosenYAxis)
    
            // functions here found above csv import
            // updates x scale for new data
            yLinearScale = yScale(censusData, chosenYAxis);
    
            // updates x axis with transition
            yAxis = renderAxeY(yLinearScale, yAxis);
    
            // updates circles with new y values
            circlesGroup = renderCircles(circlesGroup, chosenYAxis), yLinearScale;
            
            circlesGroupText = renderCircles(circlesGroupText, xLinearScale, chosenXAxis,yLinearScale, chosenYAxis);

            // updates tooltips with new info
            circlesGroup = updateToolTip(circlesGroupText, xLinearScale, chosenXAxis,yLinearScale, chosenYAxis);
     
            // changes classes to change bold text
            if (chosenYAxis === "obesity") {
              obesityLabel
                .classed("active", true)
                .classed("inactive", false);
              smokesLabel
                .classed("active", false)
                .classed("inactive", true);
              healthcareLabel
                .classed("active", false)
                .classed("inactive", true);
            }
            else if (chosenYAxis === "smokes") {
              obesityLabel
                .classed("active", false)
                .classed("inactive", true);
              smokesLabel
                .classed("active", true)
                .classed("inactive", false);
              healthcareLabel
                .classed("active", false)
                .classed("inactive", true);
            }
            else if (chosenYAxis === "healthcare") {
              obesityLabel
                .classed("active", false)
                .classed("inactive", true);
              smokesLabel
                .classed("active", false)
                .classed("inactive", true);
              healthcareLabel
                .classed("active", true)
                .classed("inactive", false);
            }
        }
        
    
    });
}).catch(function(error) {
 console.log(error);
});