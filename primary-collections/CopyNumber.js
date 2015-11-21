console.log("Don't use me yet!");

CopyNumber = new Meteor.Collection("copy_number");

// same pattern as GeneExpression
var normalizationSlugsAndNames = [
  { "value": "gistic", "label": "GISTIC" },
];

CopyNumber.attachSchema(new SimpleSchema({
  study_label: { type: String, optional: true },
  collaborations: { type: [String] },

  sample_label: { type: String },
  baseline_progression: {
    type: String,
    allowedValues: [
      "baseline",
      "progression",
    ],
  },

  "normalization": {
    type: String,
    allowedValues: _.pluck(normalizationSlugsAndNames, "value"),
    autoform: {
      options: normalizationSlugsAndNames,
    },
  },

  gene_label: { type: String },
  value: { type: Number, decimal: true },
}));
