CopyNumber = new Meteor.Collection("copy_number");

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

  normalization: {
    type: String,
    allowedValues: [
      "gistic"
    ],
  },

  gene_label: { type: String },
  value: { type: Number, decimal: true },
}));
