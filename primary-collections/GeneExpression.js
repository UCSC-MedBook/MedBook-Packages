Expression2 = new Meteor.Collection("expression2");

GeneExpression = new Meteor.Collection("gene_expression");

// same pattern as CopyNumber
var normalizationSlugsAndNames = [
  { "value": "raw_counts", "label": "Raw counts" },
  { "value": "quantile_counts", "label": "Quantile normalized counts" },
  { "value": "fpkm", "label": "FPKM" },
  { "value": "tpm", "label": "TPM" },
  { "value": "rsem_quan_log2", "label": "Quantile normalized counts log2" },
];

GeneExpression.attachSchema(new SimpleSchema({
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

// make it so that no one can edit them
function returnFalse () { return false; }
var allowNone = {
  insert: returnFalse,
  update: returnFalse,
  remove: returnFalse,
};
Expression2.allow(allowNone);
GeneExpression.allow(allowNone);
