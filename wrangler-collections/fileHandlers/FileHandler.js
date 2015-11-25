WranglerFileTypes = {};

FileHandler = function (options) {
  console.log("options:", options);
  if (options.wrangler_file_id) {
    this.wranglerFile = WranglerFiles.findOne(options.wrangler_file_id);
    if (!this.wranglerFile) {
      throw "Invalid wrangler_file_id";
    }

    this.blob = Blobs.findOne(this.wranglerFile.blob_id);
    if (!this.blob) {
      throw "Invalid blob_id";
    }

    this.submission = WranglerSubmissions
        .findOne(this.wranglerFile.submission_id);
    if (!this.submission) {
      throw "Invalid submission_id";
    }

    this.wranglerPeek = this.submission.status === "editing";
    if (this.wranglerPeek) {
      // remove all of the WranglerDocuments created last time
      WranglerDocuments.remove({
        wrangler_file_id: options.wrangler_file_id,
      });
    }
  } else if (options.blob_id) {
    this.blob = Blobs.findOne(options.blob_id);
    if (!this.blob) {
      throw "Invalid blob_id";
    }

    // NOTE: this.wranglerPeek will be undefined, which should work
    // with the code to insert without being associated with Wrangler
  } else {
    throw "No options provided to FileHandler constructor";
  }
};

FileHandler.prototype.parse = function() {
  console.log("No parse method defined, ignoring...");
};

/*
** Fills in repetitive information shared for all WranglerDocuments added
** by this FileHandler and then inserts into WranglerDocuments.
*/
FileHandler.prototype.insertWranglerDocument = function (typeAndContents) {
  WranglerDocuments.insert(_.extend({
    submission_id: this.blob.metadata.submission_id,
    user_id: this.blob.metadata.user_id,
    wrangler_file_id: this.wranglerFile._id,
  }, typeAndContents));
};

FileHandler.prototype.blobAsString = function() {
  var self = this;
  return new Q.Promise(function (resolve, reject) {
    var blobText = "";
    var stream = self.blob.createReadStream("blobs")
      .on('data', function (chunk) {
        blobText += chunk;
      })
      .on('end', function () {
        resolve(blobText);
      });
  });
};

FileHandler.prototype.setSubmissionType = function (submission_type) {
  WranglerFiles.update(this.wranglerFile._id, {
    $set: {
      submission_type: submission_type
    }
  });
};
