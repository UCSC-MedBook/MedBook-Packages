Genes = new Meteor.Collection("genes");

Genes.attachSchema(new SimpleSchema({
  gene_label: { type: String }, // ex. "A1BG-AS1"
  gene_name: { type: String }, // ex. "A1BG antisense RNA 1"

  previous_names: { type: [String], optional: true },
  previous_labels: { type: [String], optional: true },

  label_synonyms: { type: [String], optional: true },
  name_synonymes: { type: [String], optional: true },

  // TODO: ask Robert whether pseudogenes have this defined
  chromosome: { type: String, optional: true }, // ex. 15q11.2
  hgnc_id: { type: String, optional: true, label: "HGNC ID" },
}));
