GeneExpression = new Meteor.Collection("gene_expression");
Expression2 = new Meteor.Collection("expression2");

var normalValue = {
  type: Number,
  decimal: true,
  optional: true,
};

GeneExpression.attachSchema(new SimpleSchema({
  study_label: { type: String, optional: true },
  collaborations: { type: [String] },
  gene_label: { type: String },

  sample_label: { type: String },
  baseline_progression: {
    type: String,
    allowedValues: [
      "baseline",
      "progression",
    ],
  },
  values: {
    type: new SimpleSchema({
      quantile_counts: _.extend({
        label: "Quantile normalized counts",
      }, normalValue),
      quantile_counts_log: _.extend({
        label: "Quantile normalized counts log2",
        min: 0,
        max: 100,
        autoValue: function () {
          var quantileCounts = this.siblingField('quantile_counts');
          if (quantileCounts.isSet) {
            return Math.log(quantileCounts.value + 1) / Math.LN2;
          } else {
            this.unset();
          }
        }
      }, normalValue),
      raw_counts: _.extend({
        label: "Raw counts",
      }, normalValue),
      tpm: _.extend({
        label: "TPM (Transcripts Per Million)",
      }, normalValue),
      fpkm: _.extend({
        label: "RPKM (Reads Per Kilobase of transcript per Million mapped reads)",
      }, normalValue),
    }),
    optional: true, // simply because collection2 can't do upserts
  }
}));
