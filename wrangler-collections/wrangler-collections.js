// it was too confusing to have it embedded
var fileSchema = new SimpleSchema({
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
  // TODO: only allow if status = "error"
  "error_description": { type: String, optional: true },
});

WranglerSubmissions = new Meteor.Collection("wrangler_submissions");
WranglerSubmissions.attachSchema(new SimpleSchema({
  "user_id": { type: Meteor.ObjectID },
  "date_created": { type: Date },
  "files": {
    type: [fileSchema],
    optional: true
  },
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
  "description": { // why are they uploading this data? where did it come from?
    type: String,
    optional: true,
  },
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
  "file_id": { type: Meteor.ObjectID, optional: true },
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

WranglerDocuments.allow({
  insert: function (userId, doc) {
    return true;
  },
  update: function(userId, doc, fields, modifier) {
    return true;
  },
  remove: function (userId, doc) {
    return true;
  },
});
