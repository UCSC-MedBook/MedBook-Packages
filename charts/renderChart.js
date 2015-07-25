Template.renderChart.rendered = function () {

  var chart_id = this.data.chart_id;

  Deps.autorun(function () {
    var chart = Charts.findOne({ "_id": chart_id }); // get the chart

    if (chart) { // is it loaded yet?
      switch (chart.type) {
        case "waterfall":
          renderWaterfall(chart.data, chart_id);
          break;
        default:
          console.log("unknown chart type");
      }
    }
  });
};
