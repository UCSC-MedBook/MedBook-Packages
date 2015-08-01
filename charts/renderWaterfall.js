if (typeof Charts === "undefined") {
  Charts = {};
}

Charts.renderWaterfall = function(svg, theData, context) {
  var LEFT_AXIS_WIDTH = 50;

  // sort the values
  theData.values = theData.values.sort(function (a, b) {
    return b.value - a.value;
  });

  // assume theData is sorted; use values from algorithm if available
  var lowestValue = theData.lowest_value_for_algorithm
          || theData.values[theData.values.length - 1].value;
  var highestValue = theData.highest_value_for_algorithm
          || theData.values[0].value;

  function hundrethRound(number) {
    return Math.ceil(number * 100) / 100;
  }
  lowestValue = hundrethRound(lowestValue);
  highestValue = hundrethRound(highestValue);

  var valuesToPixel = d3.scale.linear()
                        .domain([highestValue, lowestValue])
                        .range([0, context.height]);

  var indexToPixel = d3.scale.linear()
                        .domain([0, theData.values.length])
                        .range([
                          LEFT_AXIS_WIDTH
                          , context.width
                        ]);

  // numbers to be on the left side, also where the tick marks are
  var leftAxisNumbers = valuesToPixel.ticks(5); // mind blown

  //console.log("before");
  var svg = d3.select(context.dom_selector)
              .append("svg")
              .attr("width", context.width)
              .attr("height", context.height)
              .selectAll("d"); // I have to do this to get it to work
  //console.log("after");

  // show left axis title (ex. "Model Score")
  // "Model Score" = default
  svg.data(["Model Score"])
      .enter()
      .append("text")
      .text(function (dataValue) { return dataValue; })
      .attr("class", "anchor-middle")
      .attr("x", -(context.height / 2))
      .attr("y", 20)
      .attr("transform", "rotate(-90)")
      .attr("cursor", "vertical-text"); // changes cursor on mouseover

  // left axis numbers
  svg.data(leftAxisNumbers).enter()
      .append("text")
      .text(function (dataValue) { return dataValue })
      .attr("class", "anchor-middle")
      .attr("dominant-baseline", "central") // centered vertically around (x, y)
      .attr("x", LEFT_AXIS_WIDTH - 15)
      .attr("y", valuesToPixel);

  // left axis tick marks
  svg.data(leftAxisNumbers).enter()
      .append("line")
      .attr("x1", LEFT_AXIS_WIDTH - 5).attr("x2", LEFT_AXIS_WIDTH)
      .attr("y1", valuesToPixel).attr("y2", valuesToPixel);

  // line right of tick marks (left axis)
  svg.data([0]).enter() // is there a better way to do this...
      .append("line")
      .attr("x1", LEFT_AXIS_WIDTH).attr("x2", LEFT_AXIS_WIDTH)
      .attr("y1", valuesToPixel(lowestValue))
      .attr("y2", valuesToPixel(highestValue));

  // bars on the plot
  var barWidth = (indexToPixel(1) - indexToPixel(0)) * .9;
  svg.data(theData.values)
      .enter()
      .append("rect")
      .attr("x", function (object, index) {
        return indexToPixel(index);
      })
      .attr("y", function (object, index) {
        if (object.value < 0) {
          return valuesToPixel(0);
        } else {
          return valuesToPixel(object.value);
        }
      })
      .attr("width", barWidth)
      .attr("height", function (object, index) {
        if (object.value < 0) {
          return valuesToPixel(object.value) - valuesToPixel(0);
        } else {
          return valuesToPixel(0) - valuesToPixel(object.value);
        }
      })
      .attr("fill", function (object, index) {
        var colors = object.colors;
        // console.log("object :: ");
        // console.log(object);
        if (object.sample_label === context.current_sample_label) {
          return colors ? colors.current_sample : "red";//"#B97D4B";
        } else if (object.value >= theData.upper_threshold_value) {
          return colors ? colors.higher_than_threshold : "darkblue";//"#B97D4B";
        } else if (object.value <= theData.lower_threshold_value) {
          return colors ? colors.lower_than_threshold : "darkblue";
        }
        return colors ? colors.between_thresholds : "#AAAAAA"; // lightish gray
      })
      .on("mouseover", function (object, indext) {
        d3.select(this).style({ opacity: '0.7' });
      })
      .on("mouseleave", function (object, indext) {
        d3.select(this).style({ opacity: '1' });
      })
      .on("click", function (object, index) {
        console.log("clicked on the waterfall plot! object ::");
        console.log(object);
        if (object.onClick) {
          // this will cause a 404 with Meteor.call
          // TODO: we should move this to MedBook.go or something
          Meteor.call(object.onClick.method, object.onClick.argument);
        }
      })
      .attr("cursor", "pointer"); // cursor looks like a link

  // threshold lines
  svg.data([
        // rest of code assumes order of largest to smallest
        theData.upper_threshold_value,
        (theData.upper_threshold_value + theData.lower_threshold_value) / 2,
        theData.lower_threshold_value
      ])
      .enter()
      .append("line")
      .attr("x1", LEFT_AXIS_WIDTH)
      .attr("x2", context.width)
      .attr("y1", valuesToPixel)
      .attr("y2", valuesToPixel)
      .attr("stroke-dasharray", function (object, index) {
        if (index === 1) { return "5, 10" }
        return "5, 5";
      });
}
