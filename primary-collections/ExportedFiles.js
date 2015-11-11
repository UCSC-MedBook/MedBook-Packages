ExportedFiles = new Meteor.Collection("exported_files");

ExportedFiles.attachSchema(new SimpleSchema({
  user_id: { type: Meteor.ObjectID },
  date_created: { type: Date },

  status: {
    type: String,
    allowedValues: [
      "running",
      "done",
      "error",
    ],
    defaultValue: "running",
  },
  error_description: { type: String, optional: true },

  collaborations: { type: [String] },

  blob_id: { type: Meteor.ObjectID, optional: true },
  blob_name: { type: String, optional: true },
  blob_text_sample: { type: String, optional: true },
  blob_line_count: { type: Number, optional: true },
}));
