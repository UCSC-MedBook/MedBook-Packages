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

function wrangleSampleUUID (text) {
  var mappingDocument;

  WranglerDocuments.find({
    user_id: this.wranglerFile.user_id,
    document_type: "sample_label_map",
  }).forEach(function (wranglerDoc) {
    // check if sample_uuid in text
    var index = text.indexOf(wranglerDoc.contents.sample_uuid);
    if (index >= 0) {
      if (mappingDocument) {
        throw "Two sample label mappings for same UUID: " +
            wranglerDoc.contents.sample_uuid;
      }

      mappingDocument = wranglerDoc;
    }
  });

  if (mappingDocument) {
    if (mappingDocument.submission_id !== this.wranglerFile.submission_id) {
      this.insertWranglerDocument.call(this, {
        document_type: "sample_label_map",
        contents: mappingDocument.contents,
      });
    }

    return mappingDocument.contents.sample_label;
  }
}

function parseSampleUUID(possibleOptions) {
  for (var i in possibleOptions) {
    var label = wrangleSampleUUID.call(this, possibleOptions[i]);
    if (label) {
      return label;
    }
  }
}

BD2KGeneExpression.prototype.parseLine =
    function (brokenTabs, lineNumber, line) {
  if (lineNumber % 1000 === 0) {
    console.log("lineNumber:", lineNumber);
  }

  if (lineNumber === 1) { // header line
    if (brokenTabs.length !== 2) {
      throw "Expected 2 column tab file, got " + brokenTabs.length +
          " column tab file";
    }

    // try to wrangle sample label
    var possibleStrings = [
      brokenTabs[1],
      this.blob.original.name
    ];
    this.sampleLabel = Wrangler.findSampleLabel(possibleStrings);

    // if that doesn't work, maybe it's a UUID
    if (!this.sampleLabel && this.wranglerFile) {
      this.sampleLabel = parseSampleUUID.call(this, possibleStrings,
          this.blob.metadata.submission_id);
    }

    if (!this.sampleLabel) {
      // NOTE: this throw sometimes doesn't work if this console.log isn't here
      console.log("couldn't find a sample label :(");
      throw "Could not parse sample label from header line or file name";
    }

    if (this.sampleLabel.match(/pro/gi)) {
      this.baseline_progression = 'progression';
    } else {
      this.baseline_progression = 'baseline';
    }

    console.log("this.sampleLabel:", this.sampleLabel);

    if (this.wranglerPeek) {
      this.gene_count = 0;

      // check to see if gene_expression already has data like this

      // TODO: search for collaboration, study
      // NOTE: currently any user can figure out if a certain
      //       sample has gene_expression data.
      var query = {
        sample_label: this.sampleLabel,
      };
      var normalization = this.wranglerFile.options.normalization;
      query["values." + normalization] = { $exists: true };

      if (GeneExpression.findOne(query)) {
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

      GeneExpression.upsert({
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
