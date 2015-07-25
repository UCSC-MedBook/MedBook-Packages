if (!MedBook) {
  MedBook = {};
}

MedBook.charts = {};

var chartValidator = function (first, second) {
  // TODO: this is where we'll move the current schema for data
  // console.log("dataValidator called");
  // console.log(this);
  // console.log(this.siblingField('type'));
}

var chartSchema = new SimpleSchema({
  "type": { type: String }, // ex. waterfall
  "data": {
    type: new SimpleSchema({
      "upper_threshold_value": { type: Number, decimal: true },
      "lower_threshold_value": { type: Number, decimal: true },

      "values": { // contains data to make waterfall plot
        type: [
          new SimpleSchema({
            // TODO: define schema for this
            "onClick": {
              type: new SimpleSchema({
                "method": { type: String },
                "arguments": { type: Object }, // wait before being too specific
              }),
              optional: true
            },
            "value": { type: Number, decimal: true },
          })
        ]
      },

      "vertical_axis_text": { type: String, optional: true }, // to the left of vertical axis
      "colors": {
        type: new SimpleSchema({
          "lower_than_threshold": { type: String },
          "higher_than_threshold": { type: String },
          "between_thresholds": { type: String },
          "highlighted_samples": { type: String },
          "current_sample": { type: String },
        }),
        optional: true
      },

      // for if the charts within an algorithm should share scales
      "lowest_value_for_algorithm": { type: Number, decimal: true, optional: true },
      "highest_value_for_algorithm": { type: Number, decimal: true, optional: true },
    }),
    custom: chartValidator
  },
  "version": { type: String, optional: true },
});

Charts = new Meteor.Collection("charts");
Charts.attachSchema(chartSchema);
