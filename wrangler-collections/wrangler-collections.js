WranglerSubmissions = new Meteor.Collection("wrangler_submissions");
WranglerSubmissions.attachSchema(new SimpleSchema({
  user_id: { type: Meteor.ObjectID },
  date_created: { type: Date },
  status: {
    type: String,
    allowedValues: [
      "editing",
      "validating",
      "writing",
      "done",
    ],
  },
  errors: { // errors as of last submission
    type: [String],
    optional: true,
  },
  options: {
    type: Object,
    blackbox: true,
    optional: true,
  },
}));

var fileTypeNames = _.map(Wrangler.fileTypes, function (value, file_type) {
  return {
    file_type: file_type,
    description: value.description,
  };
});
WranglerFiles = new Meteor.Collection("wrangler_files");
WranglerFiles.attachSchema(new SimpleSchema({
  submission_id: { type: Meteor.ObjectID },
  user_id: { type: Meteor.ObjectID },

  submission_type: {
    type: String,
    allowedValues: [
      "gene_expression",
    ],
    optional: true,
  },

  blob_id: { type: Meteor.ObjectID },
  blob_name: { type: String },
  blob_text_sample: { type: String, optional: true },
  blob_line_count: { type: Number, optional: true },
  status: {
    type: String,
    allowedValues: [
      "uploading",
      "processing",
      "done",
      "error",
    ],
  },
  options: {
    type: new SimpleSchema([
      // NOTE: the schema is blackboxed, but it still contains file_type
      // so that autoform can be used in Wrangler
      {
        file_type: {
          type: String,
          allowedValues: _.pluck(fileTypeNames, "file_type"),
          autoform: {
            options: _.map(fileTypeNames, function (value) {
              return { label: value.description, value: value.file_type };
            }),
          },
          optional: true,
        },
      },
    ]),
    defaultValue: {},
    blackbox: true,
  },
  // has it gone through the options parsing part of ParseWranglerFile
  parsed_options_once_already: { type: Boolean, defaultValue: false },

  written_to_database: { type: Boolean, defaultValue: false },
  error_description: { type: String, optional: true },

  // // idea:
  // parsing_comments: { type: [String], defaultValue: [] },

  // // refers to Blobs
  // uncompressed_from_id: { type: Meteor.ObjectID, optional: true },
}));

WranglerDocuments = new Meteor.Collection("wrangler_documents");
WranglerDocuments.attachSchema(new SimpleSchema({
  submission_id: { type: Meteor.ObjectID },
  user_id: { type: Meteor.ObjectID },
  wrangler_file_id: { type: Meteor.ObjectID, optional: true },
  document_type: {
    type: String,
    allowedValues: [
      "mapped_genes",
      "ignored_genes",
      "sample_normalization",
      "gene_expression_data_exists"
    ],
  },
  contents: {
    type: Object,
    blackbox: true,
  },
}));



ensureSubmissionEditable = function (userId, submission_id) {
  var submission = WranglerSubmissions.findOne(submission_id);
  if (submission.user_id !== userId) {
    throw new Meteor.Error("submission-not-available",
        "The submission _id provided does not exist or is not available" +
        " to you");
  }
  return submission;
};

WranglerSubmissions.allow({
  insert: function (userId, doc) {
    return doc.user_id === userId;
  },
  update: function (userId, doc, fields, modifier) {
    var submission = WranglerSubmissions.findOne(doc._id);

    return submission.user_id === userId &&
        submission.status === "editing";
  },
});

function makePermissions (collection) {
  return {
    insert: function (userId, doc) {
      var submission = WranglerSubmissions.findOne(doc.submission_id);

      return doc.user_id === userId &&
          submission.user_id === userId;
    },
    update: function (userId, doc, fields, modifier) {
      var wholeDoc = collection.findOne(doc._id);
      var submission = WranglerSubmissions.findOne(wholeDoc.submission_id);

      return submission.user_id === userId &&
          submission.status === "editing";
    },
  };
}

WranglerDocuments.allow(makePermissions(WranglerDocuments));
WranglerFiles.allow(makePermissions(WranglerFiles));

getCollectionByName = function(collectionName) {
  switch (collectionName) {
    case "superpathway_elements":
      return SuperpathwayElements;
    case "superpathway_interactions":
      return SuperpathwayInteractions;
    case "mutations":
      return Mutations;
    case "gene_expression":
      return GeneExpression;
    case "superpathways":
      return Superpathways;
    case "gene_expression":
      return GeneExpression;
    default:
      console.log("couldn't find appropriate schema");
      return null;
  }
};
