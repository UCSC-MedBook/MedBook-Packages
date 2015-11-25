Jobs = new Meteor.Collection("jobs");

Jobs.attachSchema(new SimpleSchema({
  // fields needed to insert a Job
  name: {
    type: String,
    // TODO: depend on Jobs package
    allowedValues: [
      "ParseWranglerFile",
      "SubmitWranglerFile",
      "SubmitWranglerSubmission",
      "FinishWranglerSubmission",
      "RunLimma",
      "ExportFile",
      "ReloadGenesCollection",
    ],
  },
  user_id: { type: Meteor.ObjectID },
  args: { // input
    type: Object,
    blackbox: true,
  },

  // optional fields
  "prerequisite_job_ids": {
    type: [Meteor.ObjectID],
    defaultValue: [],
  },

  output: {
    type: Object,
    blackbox: true,
    optional: true,
  },

  // automatically generated fields
  "date_created": {
    type: Date,
    // https://github.com/aldeed/meteor-collection2#autovalue
    autoValue: function() {
      if (this.isInsert) {
        return new Date();
      } else if (this.isUpsert) {
        return { $setOnInsert: new Date() };
      } else {
        this.unset();  // Prevent user from supplying their own value
      }
    },
  },
  "date_modified": {
    type: Date,
    autoValue: function () {
      if (this.isSet) {
        return;
      }
      return new Date();
    },
  },
  "status": {
    type: String,
    allowedValues: [
      "creating",
      "waiting",
      "running",
      "done",
      "error",
    ],
    defaultValue: "waiting",
  },
  "retry_count": { type: Number, defaultValue: 0 },
  // can be set even if status is not "error"
  "error_description": { type: String, optional: true },
  stack_trace: { type: String, optional: true },
}));

function onlyAdminCollaboration (user_id, doc) {
  var user = Meteor.users.findOne(user_id);

  return user.profile &&
      user.profile.collaborations instanceof Array &&
      user.profile.collaborations.indexOf("admin") >= 0 &&
      doc.status === "creating" || doc.status === "waiting";
}

Jobs.allow({
  insert: onlyAdminCollaboration,
  update: onlyAdminCollaboration,
  remove: onlyAdminCollaboration,
  fetch: ["status"],
});
