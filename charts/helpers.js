if (typeof Charts === "undefined") {
  Charts = {};
}

Charts.helpers = {};

// TODO: have this function return a new context
Charts.helpers.setMargins = function (svg, context, margins) {
  if (context.margin === undefined) {
    context.margin = {};
  }

  context.margin = {};

  _.extend(context.margin, margins);
  _.defaults(context.margin, {top: 0, right: 0, left: 0, bottom: 0});

  // pretend it's only so big
  context.width += -context.margin.left - context.margin.right;
  context.height += -context.margin.top - context.margin.bottom;

  svg.attr("transform", "translate(" + context.margin.left
      + "," + context.margin.top + ")");
};

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
};

Charts.helpers.minifySampleLabel = function (object, index) {
  var label = object.sample_label
  
  if (label.length === "DTB-001".length) {
    return "BL";
  }
  if (label.length > "DTB-001".length) {
    return label.slice("DTB-001".length);
  }
  return object.sample_label;
};
