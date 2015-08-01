if (typeof Charts === "undefined") {
  Charts = {};
}

Charts.definitions = {
  "boxAndWhisker": Charts.renderBoxAndWhisker,
  "waterfall": Charts.renderWaterfall,
}

Charts.render = function (theData, context) {

  //
  // check to make sure context has requirements
  //

  if (typeof context === "undefined"
      || typeof theData === "undefined") {
    console.log("Cannot render a chart without data and context");
    return;
  }

  if (context.height === undefined || context.width === undefined) {
    console.log("Cannot render a chart without height and width in context");
    return;
  }

  if (context.chart_type === undefined) {
    console.log("Unknown chart type: ", context.chart_type);
    return;
  }

  // make sure the data are sorted (for pulling min/max values)
  theData = theData.sort(function (a, b) {
    return a.value - b.value;
  });

  // pull min/max from context if possible
  if (context.minimum_value === undefined) {
    context.minimum_value = theData[theData.length - 1].value
  }
  if (context.maximum_value === undefined) {
    context.maximum_value = theData[0];
    console.log('asdf');
  }

  var svg = d3.select("#" + context.dom_selector)
      .append("svg")
      .attr("width", context.width)
      .attr("height", context.height)
    .append("g")
      .attr("class", context.chart_type);

  Charts.definitions[context.chart_type](svg, theData, context);
}
