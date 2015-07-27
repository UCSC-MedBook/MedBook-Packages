Template.renderChart.rendered = function () {

  var chart_id = this.data.chart_id;
  var outerThis = this;

  Deps.autorun(function (first) {
    var chart = Charts.findOne({ "_id": chart_id }); // get the chart

    if (chart) { // is it loaded yet?
      switch (chart.type) {
        case "waterfall":
          //console.log(outerThis.data['dom_element_id'] + " found a waterfall");
          renderWaterfall(chart.data,
              "#" + outerThis.data['dom_element_id'],
              outerThis.data["current_sample_label"]);
          break;
        default:
          console.log("unknown chart type");
      }
      // stop the autorun so it doesn't render multiple times
      first.stop();
    }
  });
};
