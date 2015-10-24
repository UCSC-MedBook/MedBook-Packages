var SlugsAndNames = {};

WranglerSubmissions = new Meteor.Collection("wrangler_submissions");
WranglerSubmissions.attachSchema(new SimpleSchema({
  user_id: { type: Meteor.ObjectID },
  date_created: { type: Date },
  status: {
    type: String,
    allowedValues: [
      "creating",
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

// does a pick and then adds { optional: true} to it
SlugsAndNames.file_type = [
  { slug: "MutationVCF", name: "Mutation VCF" },
  // { slug: "SuperpathwayInteractions", name: "Superpathway interactions" },
  // { slug: "SuperpathwayElements", name: "Superpathway element definitions" },
  { slug: "BD2KGeneExpression", name: "Single patient expression (BD2K pipeline)" },
  { slug: "BD2KSampleLabelMap", name: "Sample label mapping (BD2K pipeline)" },
  { slug: "TCGAGeneExpression", name: "TCGA gene expression" },
  { slug: "BasicClinical", name: "Fusion bare minimum clinical" },
  // { slug: "CompressedTarGz", name: "Compressed (.tar.gz)" },
];
function makePickOptional(collection, schemaAttribute) {
  var schemaObject = {};
  schemaObject[schemaAttribute] = _.extend(collection
          .simpleSchema()
          .pick(schemaAttribute) // so it doesn't set on the original
          .schema()[schemaAttribute],
      {
        // custom: function () {
        //   if (!this.value && // if it's set it's not required again (duh)
        //       (this.field("file_type").value === "gene_expression" ||
        //         this.field("file_type").value ===
        //             "rectangular_gene_expression")) {
        //     return "required";
        //   }
        // },
        optional: true,
      });
  return new SimpleSchema(schemaObject);
}
WranglerFiles = new Meteor.Collection("wrangler_files");
WranglerFiles.attachSchema(new SimpleSchema({
  submission_id: { type: Meteor.ObjectID },
  user_id: { type: Meteor.ObjectID },
  blob_id: { type: Meteor.ObjectID },
  blob_name: { type: String },
  blob_text_sample: { type: String, optional: true },
  status: {
    type: String,
    allowedValues: [
      "creating",
      "uploading",
      "waiting", // done uploading, waiting for processing
      "saving", // on the server already (same as uploading kind of)
      "processing",
      "done",
      "error",
    ],
  },
  options: {
    type: new SimpleSchema([
      {
        file_type: {
          type: String,
          allowedValues: _.pluck(SlugsAndNames.file_type, "slug"),
          autoform: {
            options: _.map(SlugsAndNames.file_type, function (value) {
              return { label: value.name, value: value.slug };
            }),
          },
          optional: true,
        },
        // sample_label: {
        //   type: String,
        //   // TODO: custom function?
        //   optional: true,
        // },
      },
      makePickOptional(GeneExpression, "normalization"),
    ]),
    defaultValue: {},
  },
  written_to_database: { type: Boolean, defaultValue: false },
  error_description: { type: String, optional: true },

  // refers to Blobs
  uncompressed_from_id: { type: Meteor.ObjectID, optional: true },
}));

WranglerDocuments = new Meteor.Collection("wrangler_documents");
WranglerDocuments.attachSchema(new SimpleSchema({
  submission_id: { type: Meteor.ObjectID },
  user_id: { type: Meteor.ObjectID },
  submission_type: {
    type: String,
    allowedValues: [
      "mutations",
      "gene_expression",
      // "rectangular_gene_expression",
      // "superpathway",
    ],
  },
  document_type: {
    type: String,
    allowedValues: [
      "prospective_document",
      "sample_normalization",
      "sample_label_map",
      "gene_label_map",
      // "sample_label",
      // "gene_label",
    ],
  },
  collection_name: {
    type: String,
    allowedValues: [
      "mutations",
    ],
    // custom: function () {
    //   // TODO: don't allow if document_type is not "prospective_document"
    //   if (!this.value && // if it's set it's not required again (duh)
    //       (this.field("document_type").value === "prospective_document")) {
    //     return "required";
    //   }
    // },
    optional: true,
  },
  contents: {
    type: Object,
    blackbox: true,
  },
  wrangler_file_id: { type: Meteor.ObjectID, optional: true },
  inserted_into_database: { type: Boolean, optional: true },
}));

BlobStore = new FS.Store.GridFS("blobs", {
  beforeWrite: function (fileObject) {
    if (fileObject.metadata === undefined) {
      fileObject.metadata = {};
    }
    fileObject.metadata.uploaded_date = new Date();
  }
});

Blobs = new FS.Collection("blobs", {
  stores: [BlobStore],
});

// users can only modify their own documents
Blobs.allow({
  insert: function (userId, doc) {
    return userId === doc.metadata.user_id;
  },
  update: function(userId, doc, fields, modifier) {
    return userId === doc.metadata.user_id;
  },
  remove: function (userId, doc) {
    return userId === doc.metadata.user_id;
  },
  download: function (userId, doc) {
    return userId === doc.metadata.user_id;
  }
});

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
