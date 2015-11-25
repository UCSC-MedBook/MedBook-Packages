RectangularGeneAssay = function (options) {
  RectangularFile.call(this, options);

  var self = this;

  this.geneMapping = {}; // for use in validateGeneLabel
  function addGeneMapping (attribute, newValue) {
    // TODO: add this back in when we fix the genes collection
    // if (self.geneMapping[attribute]) {
    //   console.log('geneMapping[' + attribute + '] overridden from ' +
    //       self.geneMapping[attribute] + ' to ' + newValue);
    // }

    // prefer mapping gene ==> gene
    if (self.geneMapping[attribute] !== attribute) {
      self.geneMapping[attribute] = newValue;
    }
  }

  console.log('loading valid genes');
  Genes.find({
        gene: {$exists: true},
        status: "Approved"
      })
    .forEach(function (doc) {
      addGeneMapping(doc.gene, doc.gene);

      // same thing twice with doc.previous, doc.synonym
      var index;

      if (doc.previous && doc.previous[0] !== '') { // genes table is weird...
        for (index in doc.previous) {
          addGeneMapping(doc.previous[index], doc.gene);
        }
      }

      if (doc.synonym && doc.synonym[0] !== '') { // genes table is weird...
        for (index in doc.synonym) {
          addGeneMapping(doc.synonym[index], doc.gene);
        }
      }
    });
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

// RectangularGeneAssay.prototype.Expression2Insert =
//     function(gene, sampleLabels, expressionStrings) {
//   // do some checks
//   if (sampleLabels.length !== expressionStrings.length) {
//     throw "Internal error: sampleLabels not the same length as " +
//         " expressionStrings!";
//   }
//
//   var setObject = {};
//   for (var index in sampleLabels) {
//     var value = expressionStrings[index];
//     var normalization = this.wranglerFile.options.normalization;
//     var exceptNormalization = "samples." + sampleLabels[index] + ".";
//     var parsedValue = parseFloat(value);
//     setObject[exceptNormalization + normalization] = parsedValue;
//
//     if (normalization === 'quantile_counts') {
//       var log2Value = Math.log(parsedValue) / Math.LN2;
//       setObject[exceptNormalization + 'rsem_quan_log2'] = log2Value;
//     }
//   }
//   Expression2.upsert({
//     gene: gene,
//     Study_ID: this.submission.options.study_label,
//     Collaborations: [this.submission.options.collaboration_label],
//   }, {
//     $set: setObject
//   });
// };

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
