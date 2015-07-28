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
  "type": { type: String }, // ex. waterfall ; can't start with a number
  "data": {
    type: new SimpleSchema({
      "upper_threshold_value": { type: Number, decimal: true },
      "lower_threshold_value": { type: Number, decimal: true },

      "values": { // contains data to make waterfall plot
        type: [
          new SimpleSchema({
            "onClick": {
              type: new SimpleSchema({
                "method": { type: String },
                "argument": {
                  type: new SimpleSchema({
                    "patient_id": { type: Meteor.ObjectID },
                    "sample_label": { type: String },
                  })
                },
              }),
              optional: true
            },
            "sample_label": { type: String },
            "value": { type: Number, decimal: true },
          })
        ]
      },

      // optional stuff
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
