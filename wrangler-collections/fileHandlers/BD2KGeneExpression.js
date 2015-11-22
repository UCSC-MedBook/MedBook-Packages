function BD2KGeneExpression (wrangler_file_id, isSimulation) {
  RectangularGeneAssay.call(this, wrangler_file_id, isSimulation);

  this.setSubmissionType.call(this, 'gene_expression');
}

BD2KGeneExpression.prototype =
    Object.create(RectangularGeneAssay.prototype);
BD2KGeneExpression.prototype.constructor = BD2KGeneExpression;

// function parseSampleUUID(possibleOptions, submission_id) {
//   for (var i in possibleOptions) {
//     var label = Wrangler.wrangleSampleUUID(possibleOptions[i], submission_id);
//     if (label) {
//       return label;
//     }
//   }
//   return null;
// }

// function wrangleSampleUUID (text, submission_id) {
//   var sample_label;
//
//   WranglerDocuments.find({
//     submission_id: submission_id,
//     document_type: "sample_label_map",
//   }).forEach(function (wranglerDoc) {
//     // check if sample_uuid in text
//     var index = text.indexOf(wranglerDoc.contents.sample_uuid);
//     if (index >= 0) {
//       sample_label = wranglerDoc.contents.sample_label;
//     }
//   });
//
//   return sample_label;
// };

// valuesHeading = heading of second columnn in file
BD2KGeneExpression.prototype.setSampleLabel = function (valuesHeading) {
  var possibleStrings = [
    valuesHeading,
    this.blob.original.name
  ];

  // try to wrangle sample label
  this.sample_label = Wrangler.findSampleLabel(possibleStrings);

  if (this.sample_label.match(/pro/gi)) {
    this.baseline_progression = 'progression';
  } else {
    this.baseline_progression = 'baseline';
  }

  // // try to wrangle sample uuid
  // if (!this.sample_label) {
  //   this.sample_label =
  //       parseSampleUUID(possibleStrings, this.blob.metadata.submission_id);
  // }

  if (!this.sample_label) {
    throw "Error: could not parse sample label from header line or file name";
  }

  console.log("this.sample_label:", this.sample_label);
};

BD2KGeneExpression.prototype.parseLine =
    function (brokenTabs, lineNumber, line) {
  if (lineNumber % 1000 === 0) {
    console.log("lineNumber:", lineNumber);
  }

  if (lineNumber === 1) { // header line
    if (this.isSimulation) {
      this.gene_count = 0;
    }

    this.setSampleLabel.call(this, brokenTabs[1]);
  } else { // rest of file
    var originalGeneLabel = brokenTabs[0];
    var mappedGeneLabel = this.geneMapping[originalGeneLabel];

    // make sure the user knows we're ignoring/mapping the gene if applicable
    if (!mappedGeneLabel) {
      if (this.isSimulation) {
        this.insertWranglerDocument.call(this, {
          document_type: 'ignored_genes',
          contents: {
            gene: originalGeneLabel
          }
        });
      }
      return; // ignore the gene
    } else if (mappedGeneLabel !== originalGeneLabel) {
      if (this.isSimulation) {
        this.insertWranglerDocument.call(this, {
          document_type: 'mapped_genes',
          contents: {
            gene_in_file: originalGeneLabel,
            mapped_gene: mappedGeneLabel
          }
        });
      }
    }

    var expressionString = brokenTabs[1];
    this.validateNumberStrings.call(this, [expressionString]);

    if (this.isSimulation) {
      this.gene_count++;
    } else {
      var setObject = {};
      setObject['values.' + this.wranglerFile.options.normalization] =
          parseFloat(expressionString);

      var added = GeneExpression.upsert({
        study_label: this.submission.options.study_label,
        collaborations: [this.submission.options.collaboration_label],
        gene_label: mappedGeneLabel,
        sample_label: this.sample_label,
        baseline_progression: this.baseline_progression,
      }, {
        $set: setObject
      });
    }
  }
};

BD2KGeneExpression.prototype.endOfFile = function () {
  if (this.isSimulation) {
    var normalization_description = GeneExpression.simpleSchema()
        .schema()['values.' + this.wranglerFile.options.normalization].label;

    this.insertWranglerDocument.call(this, {
      document_type: 'sample_normalization',
      contents: {
        sample_label: this.sample_label,
        normalization_description: normalization_description,
        gene_count: this.gene_count,
      }
    });
  }
};

WranglerFileTypes.BD2KGeneExpression = BD2KGeneExpression;

GeneExpression.rawCollection().ensureIndex({
study_label: 1,
collaborations: 1,
gene_label: 1,
sample_label: 1,
baseline_progression: 1,
}, function (error, result) {
  console.log("ensuredIndex:", result);
});
