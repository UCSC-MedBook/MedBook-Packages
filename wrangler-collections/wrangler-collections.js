WranglerSubmissions = new Meteor.Collection("wrangler_submissions");
WranglerSubmissions.attachSchema(new SimpleSchema({
  "user_id": { type: Meteor.ObjectID },
  "date_created": { type: Date },
  "status": {
    type: String,
    allowedValues: [
      "creating",
      "editing",
      "validating",
      "writing",
      "done",
    ],
  },
  "errors": { // errors as of last submission
    type: [String],
    optional: true,
  },
  "options": {
    type: Object,
    blackbox: true,
    optional: true,
  },
  "editing_file": {
    type: Meteor.ObjectID, // refers to WranglerFiles
    optional: true
  },
  "editing_document": { // no functionality yet
    type: Meteor.ObjectID, // refers to WranglerDocuments
    optional: true
  },
}));

WranglerFiles = new Meteor.Collection("wrangler_files");
WranglerFiles.attachSchema(new SimpleSchema({
  "submission_id": { type: Meteor.ObjectID },
  "file_id": { type: Meteor.ObjectID },
  "file_name": { type: String },
  "status": {
    type: String,
    allowedValues: [
      "creating",
      "uploading", "saving", // same step
      "processing",
      "done",
      "error",
    ],
  },
  "manual_file_type": {
    type: String,
    allowedValues: [
      "mutation",
      "superpathway_interactions",
      "superpathway_elements",
    ],
    optional: true
  },
  // TODO: only allow if status = "error"
  "error_description": { type: String, optional: true },
}));

WranglerDocuments = new Meteor.Collection("wrangler_documents");
WranglerDocuments.attachSchema(new SimpleSchema({
  "submission_id": { type: Meteor.ObjectID },
  "collection_name": {
    type: String,
    allowedValues: [
      "superpathway_elements",
      "superpathway_interactions",
      "mutations",
      "gene_expression",
      "superpathways",
    ],
  },
  "prospective_document": {
    type: Object,
    blackbox: true,
  },
  "wrangler_file_id": { type: Meteor.ObjectID, optional: true },
}));

Jobs = new Meteor.Collection("jobs");
Jobs.attachSchema(new SimpleSchema({
  "name": { type: String },
  "date_created": { type: Date },
  "args": {
    type: Object,
    blackbox: true,
  },
  "status": {
    type: String,
    allowedValues: [
      "waiting",
      "running",
      "done",
    ],
    defaultValue: "waiting",
  },
  // errors
  //"result": { type:  }
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

ensureSubmissionAvailable = function (userId, submissionId) {
  var submission = WranglerSubmissions.findOne(submissionId);
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

    return submission.user_id === userId;
  },
});

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
    default:
      console.log("couldn't find appropriate schema");
      return null;
  }
};
