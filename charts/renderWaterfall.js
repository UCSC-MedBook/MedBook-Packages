if (typeof Charts === "undefined") {
  Charts = {};
}

Charts.renderWaterfall = function(svg, theData, context) {

  Charts.helpers.setMargins(svg, context, {
    top: 5, bottom: 5,
  });

  var axisSize = 0;
  if (context.show_axis === true) {
    axisSize += 5;
  }
  if (context.show_axis_labels === true) {
    axisSize += 15;
  }

  var valuesScale = d3.scale.linear()
      .domain([context.maximum_value, context.minimum_value])
      .range([0, context.height]);

  // show left axis title (ex. "Model Score")
  // "Model Score" = default
  // svg.data(["Model Score"])
  //     .enter()
  //     .append("text")
  //     .text(function (dataValue) { return dataValue; })
  //     .attr("class", "anchor-middle")
  //     .attr("x", -(context.height / 2))
  //     .attr("y", 20)
  //     .attr("transform", "rotate(-90)")
  //     .attr("cursor", "vertical-text"); // changes cursor on mouseover

  // setup axis
  var ticksCount = context.height / 20;
  var yAxis = d3.svg.axis()
      .scale(valuesScale)
      .orient("left") // the data is below
      .innerTickSize(4)
      .outerTickSize(4)
      .ticks(ticksCount < 3 ? 3 : ticksCount); // how many ticks there are (every 35px)

  svg.append("g")
      .attr("class", "y axis")
      .attr("transform", "translate(" + axisSize + ", 0)")
      .call(yAxis)
    .selectAll("text")
      .attr("x", -6)
      .attr("dy", "-.05em")
      .attr("dominant-baseline", "central");

  // setup data
  var dataGroup = svg.append('g');

  Charts.helpers.setMargins(dataGroup, context, {
    left: axisSize + 6, right: 6
  });

  // line at 0
  function positionLine(selection) {
    return selection
        .attr("x1", 0)
        .attr("x2", context.width)
        .attr("y1", valuesScale)
        .attr("y2", valuesScale);
  }

  dataGroup.append("g")
      .attr("class", "threshold-lines")
      .selectAll("bleh")
      .data([0])
      .enter()
      .append("line")
      .call(positionLine);

  var indexToPixel = d3.scale.linear()
      .domain([0, theData.length])
      .range([
        0,
        context.width,
      ]);

  // bars on the plot
  var barWidth = (indexToPixel(1) - indexToPixel(0)) * .9;
  var bars = dataGroup.selectAll("bleh")
      .data(theData)
      .enter()
      .append("g")
      .attr("transform", function (object, index) {
        var dx = indexToPixel(index);
        var dy;
        if (object.value < 0) {
          dy = valuesScale(0);
        } else {
          dy = valuesScale(object.value);
        }
        return "translate(" + dx + ", " + dy + ")";
      })
      .attr("class", function (object, index) {
        // TODO: move this
        if (context.highlighted_sample_labels.indexOf(object.sample_label) > -1) {
          return "highlighted-sample";
        }
        return Charts.helpers.getSignificanceClass(object.value
            , object.value, context);
      });

  bars.append("rect")
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", barWidth)
      .attr("height", function (object, index) {
        if (object.value < 0) {
          return valuesScale(object.value) - valuesScale(0);
        } else {
          return valuesScale(0) - valuesScale(object.value);
        }
      })
      .on("mouseover", function (object, indext) {
        d3.select(this).style({ opacity: '0.7' });
      })
      .on("mouseleave", function (object, indext) {
        d3.select(this).style({ opacity: '1' });
      })
      .on("click", function (object, index) {
        if (object.patient_label) {
          Router.go('patientReport'
              , { "patient_label": object.patient_label }
              , { hash: object.sample_label }
            );
        }
      })
      .attr("cursor", "pointer"); // cursor looks like a link

  // add BL and Pro labels
  bars.filter(function (object, index) {
        return context.highlighted_sample_labels.indexOf(object.sample_label) > -1;
      })
      .append("text")
      .text(Charts.helpers.minifySampleLabel)
      .attr("x", barWidth / 2)
      .attr("y", function (object, index) {
        var toMove = 6;
        if (object.value < 0) {
          return -toMove;
        } else {
          return valuesScale(0) - valuesScale(object.value) + toMove;
        }
      });



  // threshold lines
  if (context.upper_threshold_value !== undefined
      && context.lower_threshold_value !== undefined) {
    dataGroup.append("g")
        .attr("class", "threshold-lines")
        .selectAll("bleh")
        .data([
          context.upper_threshold_value,
          //(context.upper_threshold_value + context.lower_threshold_value) / 2,
          context.lower_threshold_value
        ])
        .enter()
        .append("line")
        .call(positionLine)
        .attr("stroke-dasharray", function (object, index) {
          // if (index === 1) {
          //   return "5, 10"
          // }
          return "5, 5";
        });
  }

}
