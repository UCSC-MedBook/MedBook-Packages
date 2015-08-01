if (typeof Charts === "undefined") {
  Charts = {};
}

Charts.renderBoxAndWhisker = function(svg, theData, context) {

  Charts.helpers.setMargins(svg, context, {
    right: 8, left: 8
  });

  var valuesScale = d3.scale.linear() // converts data values to pixel values
      .domain([context.minimum_value, context.maximum_value])
      .range([0, context.width]);

  function attachAxis(axisHeight) {
    var xAxis = d3.svg.axis()
        .scale(valuesScale)
        .orient("top") // the data is below
        .ticks(context.width / 35); // how many ticks there are (every 35px)

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + axisHeight + ")")
        .call(xAxis)
      .selectAll("text")
        .attr("y", -12.5) // where the text is in relation to the tick
        .attr("x", 0);
  }

  function valueAtPercent(array, percent) {
    // percent = [0, 1]
    // valueAtPercent([1, 2, 3, 4, 5], .25) ==> 2
    // valueAtPercent([1, 2, 3, 4, 5], .20) ==> 1.8
    var index = (array.length - 1) * percent;
    if (index === Math.floor(index)) { // return immidiately if int
      return array[index].value;
    }

    var lowerIndex = Math.floor(index);
    var higherIndex = Math.ceil(index);
    var distanceToLower = index - lowerIndex;
    var distanceToHigher = higherIndex - index;

    return array[lowerIndex].value * distanceToHigher
        + array[higherIndex].value * distanceToLower;
  }

  function getSurroundingIndexes(array, needleValue) {
    // https://github.com/Olical/binary-search/blob/master/src/binarySearch.js
    var min = 0;
    var max = array.length - 1;
    var guess;

    while (min <= max) {
      guess = Math.floor((min + max) / 2);

      if (array[guess].value === needleValue) {
        return [guess, guess];
      } else {
        if (array[guess].value < needleValue) {
          min = guess + 1;
        } else {
          max = guess - 1;
        }
      }
    }

    if (min === 0) {
      return [min, min];
    }
    if (max === array.length - 1) {
      return [max, max];
    }

    // there are outliers
    if (array[min].value < needleValue) {
      return [min, min + 1];
    } else {
      return [min - 1, min];
    }
  }

  // what it looks like
  var axisHeight = 20;
  var boxHeight = 10;
  var boxMiddle = 10; // line drawn here

  //
  // start drawing things
  //

  attachAxis(axisHeight);

  var boxplot = svg.append("g")
      .attr("class", "boxplot")
      .attr("transform", "translate(0," + axisHeight + ")")
      .selectAll("bleh") // doesn't work without this (no selection)

  var firstQuartile = valueAtPercent(theData, .25);
  var secondQuartile = valueAtPercent(theData, .5);
  var thirdQuartile = valueAtPercent(theData, .75);
  var interquartileRange = thirdQuartile - firstQuartile;

  var leftWhiskerValue = theData[
        getSurroundingIndexes(theData, firstQuartile
            - 1.5 * interquartileRange)[1]
      ].value;
  var rightWhiskerValue = theData[
        getSurroundingIndexes(theData, thirdQuartile
            + 1.5 * interquartileRange)[0]
      ].value;

  function positionVerticalLine(selection) {
    selection
        .attr("y1", boxMiddle - boxHeight / 2)
        .attr("y2", boxMiddle + boxHeight / 2);
  }

  // vertical whisker lines
  boxplot.data([leftWhiskerValue, rightWhiskerValue])
      .enter()
      .append("line")
      .attr("x1", valuesScale)
      .attr("x2", valuesScale)
      .call(positionVerticalLine)
      .attr("class", function (value, index) {
        return Charts.helpers.getSignificanceClass(value, value, context);
      });

  // horizontal lines
  function drawLine(firstValue, secondValue) {
    if (firstValue < secondValue) {
      console.log('drawLine in if');
      boxplot.data([0]).enter()
          .append("line")
          .attr("x1", valuesScale(firstValue))
          .attr("x2", valuesScale(secondValue))
          .attr("y1", boxMiddle)
          .attr("y2", boxMiddle)
          .attr("class", Charts.helpers.getSignificanceClass(firstValue
              , secondValue, context));
    }
  }
  if (context.lower_threshold_value === undefined
      || context.upper_threshold_value === undefined) {
    drawLine(leftWhiskerValue, rightWhiskerValue);
  } else {
    drawLine(leftWhiskerValue, context.lower_threshold_value); // left
    drawLine(Math.max(context.lower_threshold_value, leftWhiskerValue)
        , Math.min(context.upper_threshold_value, rightWhiskerValue)); // middle
    drawLine(context.upper_threshold_value, rightWhiskerValue); // right
  }

  // boxes
  function drawBox(firstValue, secondValue) {
    if (firstValue < secondValue) {
      boxplot.data([0]).enter()
          .append("rect")
          .attr("x", valuesScale(firstValue))
          .attr("y", boxMiddle - boxHeight / 2)
          .attr("height", boxHeight)
          .attr("width", valuesScale(secondValue) - valuesScale(firstValue))
          .attr("class", Charts.helpers.getSignificanceClass(firstValue
              , secondValue, context));
    }
  }
  if (context.lower_threshold_value === undefined
      || context.upper_threshold_value === undefined) {
    drawBox(firstQuartile, thirdQuartile);
  } else {
    drawBox(firstQuartile, context.lower_threshold_value); // left blue
    drawBox(Math.max(context.lower_threshold_value, firstQuartile)
        , Math.min(context.upper_threshold_value, thirdQuartile)); // grey
    drawBox(context.upper_threshold_value, thirdQuartile); // right blue
  }

  // outliers
  boxplot.data(_.filter(theData, function (current) {
        return current.value < leftWhiskerValue
            || current.value > rightWhiskerValue;
      }))
      .enter()
      .append("circle")
      .attr("cx", function (object, index) {
        return valuesScale(object.value);
      })
      .attr("cy", boxMiddle)
      .attr("r", 1)
      .attr("class", function (object, index) {
        return Charts.helpers.getSignificanceClass(object.value
            , object.value, context);
      });

  // label samples
  var highlightedSamples = boxplot.data(_.filter(theData, function (current) {
        return context.highlighted_sample_labels.indexOf(current.sample_label) > -1;
      }))
      .enter()
      .append("g")
      .attr("transform", function (object, index) {
        return "translate(" + valuesScale(object.value) + ", 0)";
      })
      .attr("class", "highlighted-sample");

  highlightedSamples.append("line")
      .attr("x1", 0)
      .attr("x2", 0)
      .call(positionVerticalLine);

  highlightedSamples.append("text")
      .text(Charts.helpers.minifySampleLabel)
      .attr("y", boxHeight + 15);
}
