if (typeof Charts === "undefined") {
  Charts = {};
}

Charts.helpers = {};

Charts.helpers.setMargins = function (svg, context, margins) {
  if (context.margin === undefined) {
    context.margin = {};
  }

  _.defaults(context.margin, margins);
  _.defaults(context.margin, {top: 0, right: 0, left: 0, bottom: 0});

  // pretend it's only so big
  context.width += -context.margin.left - context.margin.right;
  context.height += -context.margin.top - context.margin.bottom;

  svg.attr("transform", "translate(" + context.margin.left
      + "," + context.margin.top + ")");
}

Charts.helpers.getSignificanceClass = function(firstValue, secondValue, context) {

  if (context.lower_threshold_value === undefined
      || context.upper_threshold_value === undefined) {
    // no-thresholds
    return "outside-threshold";
  }

  var value = (firstValue + secondValue) / 2;

  if (value < context.lower_threshold_value
      || value > context.upper_threshold_value) {
    return "outside-threshold";
  }
  return "inside-threshold";
}
