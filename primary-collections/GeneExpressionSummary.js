GeneExpressionSummary = new Meteor.Collection("gene_expression_summary");

GeneExpressionSummary.attachSchema(new SimpleSchema({
  collaboration: { type: String },
  study_label: { type: String },
  gene_label: { type: String },

  quantile_counts: {
    mean: { type: Number, decimal: true },
    variance: { type: Number, decimal: true },
    sample_labels: { type: [String] },
    optional: true,
  },
  // quantile_counts_log: _.extend({
  //   label: "Quantile normalized counts log2",
  //   max: 100,
  //   autoValue: function () {
  //     var quantileCounts = this.siblingField('quantile_counts');
  //     if (quantileCounts.isSet) {
  //       return Math.log(quantileCounts.value + 1) / Math.LN2;
  //     } else {
  //       this.unset();
  //     }
  //   }
  // }, normalValue),
  // raw_counts: _.extend({
  //   label: "Raw counts",
  // }, normalValue),
  // tpm: _.extend({
  //   label: "TPM (Transcripts Per Million)",
  // }, normalValue),
  // fpkm: _.extend({
  //   label: "RPKM (Reads Per Kilobase of transcript per Million mapped reads)",
  // }, normalValue),



}));
