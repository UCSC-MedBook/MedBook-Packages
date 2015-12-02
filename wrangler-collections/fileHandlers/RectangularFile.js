RectangularFile = function (options) {
  FileHandler.call(this, options);
};

RectangularFile.prototype = Object.create(FileHandler.prototype);
RectangularFile.prototype.constructor = RectangularFile;

RectangularFile.prototype.parse = function () {
  var self = this;
  return new Q.Promise(function (resolve, reject) {
    // lineBufferMax chosen based on crude yet effective testing:
    // https://docs.google.com/spreadsheets/d/1wA4KPXEhE4eroZaiKUL92dP0Gi1uFG8qCGSDjCaMcwo/edit?usp=sharing
    // "Show me the data!" - Ted

    // The parser parses line-by-line for the first headerLineCount lines
    // and then runs lineBufferMax lines simultaneously to speed it up.
    // This is so that any variables in the header are set for future
    // lines if needed.
    // ex. this.sample_label requires a mongodb lookup for UUID mapping
    var lineBufferMax = 50;
    var headerLineCount = 10;

    var lineBufferPromises = [];
    var allLinePromises = [];
    var lineNumber = 0; // starts at one (no really, I promise!)
    var tabCount;

    // store stream in a variable so it can be paused
    var bylineStream = byLine(self.blob.createReadStream("blobs"));
    bylineStream.on('data', Meteor.bindEnvironment(function (lineObject) {
      var deferred = Q.defer();
      lineBufferPromises.push(deferred.promise);
      allLinePromises.push(deferred.promise);

      var line = lineObject.toString();
      var brokenTabs = line.split("\t");

      lineNumber++;
      var thisLineNumber = lineNumber; // so that it has function scope

      // This reads up to lineBufferMax lines and then waits for those lines
      // to finish completely before moving on.
      // NOTE: the rest of the function will still run even after the
      //       stream has been paused
      if (lineBufferPromises.length >= lineBufferMax ||
          thisLineNumber < headerLineCount) {
        bylineStream.pause();
        Q.allSettled(lineBufferPromises)
          .then(Meteor.bindEnvironment(function (values) {
            lineBufferPromises = [];
            bylineStream.resume();
          }, reject));
      }

      // make sure file is rectangular
      if (tabCount === undefined) {
        tabCount = brokenTabs.length;
      } else if (tabCount !== brokenTabs.length) {
        var message = "File not rectangular. " +
            "Line " + thisLineNumber + " has " + brokenTabs.length +
            " columns, not " + tabCount;
        deferred.reject(message);
        return; // don't parse that line
      }

      // I guess we should parse the line eventually...
      Q.resolve(self.parseLine.call(self, brokenTabs, thisLineNumber, line))
        .then(deferred.resolve)
        .catch(deferred.reject);
    }, reject));

    bylineStream.on('end', Meteor.bindEnvironment(function () {
      // console.log("allLinePromises.slice(0, 5:)", allLinePromises.slice(0, 5));
      Q.all(allLinePromises)
        .then(Meteor.bindEnvironment(function () {
          Q.resolve(self.endOfFile.call(self))
            .then(resolve);
        }, reject))
        .catch(reject);
    }, reject));
  });
};

RectangularFile.prototype.parseLine = function (brokenTabs, lineNumber, line) {
  throw "parseLine function not overridden";
};

RectangularFile.prototype.endOfFile = function () {
  console.log("endOfFile not overridden");
};
