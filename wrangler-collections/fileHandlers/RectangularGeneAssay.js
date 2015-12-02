RectangularGeneAssay = function (options) {
  RectangularFile.call(this, options);

  var self = this;

  this.geneMapping = {}; // for use in validateGeneLabel
  function addGeneMapping (attribute, newValue) {
    if (self.geneMapping[attribute]) {
      console.log('geneMapping[' + attribute + '] overridden from ' +
          self.geneMapping[attribute] + ' to ' + newValue);
    }

    // prefer mapping gene ==> gene
    if (self.geneMapping[attribute] !== attribute) {
      self.geneMapping[attribute] = newValue;
    }
  }

  console.log('loading valid genes');

  // this.geneMapping["asdf"] = "asdf"
  Genes.find({}).forEach(function (doc) {
    addGeneMapping(doc.gene_label, doc.gene_label);
  });

  function addMappingsInArray(arrayAttribute, doc) {
    for (var index in doc[arrayAttribute]) {
      var value = doc[arrayAttribute][index];
      if (!self.geneMapping[value]) {
        addGeneMapping(value, doc.gene_label);
      }
    }
  }

  // map synonym_labels to respective gene_labels, then previous_labels
  Genes.find({}).forEach(_.partial(addMappingsInArray, "synonym_labels"));
  Genes.find({}).forEach(_.partial(addMappingsInArray, "previous_labels"));

  console.log("done loading valid genes");
};

RectangularGeneAssay.prototype = Object.create(RectangularFile.prototype);
RectangularGeneAssay.prototype.constructor = RectangularGeneAssay;

RectangularGeneAssay.prototype.validateNumberStrings = function (strings) {
  for (var index in strings) {
    var valueString = strings[index];
    if (isNaN(valueString)) {
      throw "Error: Non-numerical expression value: " + valueString;
    }
  }
};

// RectangularGeneAssay.prototype.CopyNumberInsert =
//     function(gene_label, sampleLabels, expressionStrings) {
//   // do some checks
//   if (sampleLabels.length !== expressionStrings.length) {
//     throw "Internal error: sampleLabels not the same length as " +
//         " expressionStrings!";
//   }
//
//   var bulk = CopyNumber.rawCollection().initializeUnorderedBulkOp();
//
//   for (var index in sampleLabels) {
//     var baseline_progression = "baseline";
//     if (sampleLabels[index].match(/pro/gi)) {
//       baseline_progression = "progression";
//     }
//
//     bulk.insert({
//       study_label: this.submission.options.study_label,
//       collaborations: [this.submission.options.collaboration_label],
//       sample_label: sampleLabels[index],
//       baseline_progression: baseline_progression,
//       normalization: "gistic",
//       gene_label: gene_label,
//       value: parseFloat(expressionStrings[index]),
//     });
//   }
//
//   var deferred = Q.defer();
//   bulk.execute(function (error, result) {
//     if (error) {
//       deferred.reject(error);
//     } else {
//       deferred.resolve();
//     }
//   });
//   return deferred.promise;
// };
