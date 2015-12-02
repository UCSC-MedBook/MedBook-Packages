// TODO: change this to accept options instead of wrangler_file_id
function BD2KGeneExpression (wrangler_file_id) {
  RectangularGeneAssay.call(this, {
    wrangler_file_id: wrangler_file_id
  });

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
  this.sampleLabel = Wrangler.findSampleLabel(possibleStrings);

  if (this.sampleLabel.match(/pro/gi)) {
    this.baseline_progression = 'progression';
  } else {
    this.baseline_progression = 'baseline';
  }

  // // try to wrangle sample uuid
  // if (!this.sampleLabel) {
  //   this.sampleLabel =
  //       parseSampleUUID(possibleStrings, this.blob.metadata.submission_id);
  // }

  if (!this.sampleLabel) {
    throw "Error: could not parse sample label from header line or file name";
  }

  console.log("this.sampleLabel:", this.sampleLabel);
};

BD2KGeneExpression.prototype.parseLine =
    function (brokenTabs, lineNumber, line) {
  if (lineNumber % 1000 === 0) {
    console.log("lineNumber:", lineNumber);
  }

  if (lineNumber === 1) { // header line
    if (this.wranglerPeek) {
      this.gene_count = 0;
    }

    this.setSampleLabel.call(this, brokenTabs[1]);

    // check to see if gene_expression already has data like this
    if (this.wranglerPeek) {
      // TODO: search for collaboration, study
      // NOTE: currently any user can figure out if a certain
      //       sample has gene_expression data.
      var query = {
        sample_label: this.sampleLabel,
      };
      var normalization = this.wranglerFile.options.normalization;
      query["values." + normalization] = { $exists: true };

      if (GeneExpression.findOne(query)) {
        console.log("inside if statement");
        this.insertWranglerDocument.call(this, {
          document_type: 'gene_expression_data_exists',
          contents: {
            file_name: this.blob.original.name,
            sample_label: this.sampleLabel,
            normalization: getNormalizationLabel(normalization),
          }
        });
      }
    }
  } else { // rest of file
    // NOTE: this is to update expression2, which will be deprecated soon
    if (!this.wranglerPeek) {
      // insert into expression2 without mapping or anything
      Expression2Insert.call(this, brokenTabs[0], [this.sampleLabel], [brokenTabs[1]]);
    }

    // map and insert into GeneExpression
    var originalGeneLabel = brokenTabs[0];
    var mappedGeneLabel = this.geneMapping[originalGeneLabel];

    // make sure the user knows we're ignoring/mapping the gene if applicable
    if (!mappedGeneLabel) {
      if (this.wranglerPeek) {
        this.insertWranglerDocument.call(this, {
          document_type: 'ignored_genes',
          contents: {
            gene: originalGeneLabel
          }
        });
      }
      return; // ignore the gene
    } else if (mappedGeneLabel !== originalGeneLabel) {
      if (this.wranglerPeek) {
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

    if (this.wranglerPeek) {
      this.gene_count++;
    } else {
      var setObject = {};
      setObject['values.' + this.wranglerFile.options.normalization] =
          parseFloat(expressionString);

      var added = GeneExpression.upsert({
        study_label: this.submission.options.study_label,
        collaborations: [this.submission.options.collaboration_label],
        gene_label: mappedGeneLabel,
        sample_label: this.sampleLabel,
        baseline_progression: this.baseline_progression,
      }, {
        $set: setObject
      });
    }
  }
};

BD2KGeneExpression.prototype.endOfFile = function () {
  if (this.wranglerPeek) {
    var normalization = this.wranglerFile.options.normalization;

    this.insertWranglerDocument.call(this, {
      document_type: 'sample_normalization',
      contents: {
        sample_label: this.sampleLabel,
        normalization_description: getNormalizationLabel(normalization),
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
