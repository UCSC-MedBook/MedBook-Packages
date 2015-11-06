// https://docs.google.com/drawings/d/1I8TVxsWXivIIxxwENUbExBQHZ1xE1D9Mdo09eTSMLj4/edit?usp=sharing

if (Meteor.isServer) {
  var npmBinarySearch = Npm.require('binary-search');
  var binarysearch = function (array, item) {
    return npmBinarySearch(array, item, function (a, b) {
      if (a > b) {
        return 1;
      } else if (a < b) {
        return -1;
      }
      return 0;
    });
  };
}

function FileHandler (wrangler_file_id, isSimulation) {
  this.wranglerFile = WranglerFiles.findOne(wrangler_file_id);
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

  this.isSimulation = isSimulation;
  if (this.isSimulation) {
    // remove all of the WranglerDocuments created last time
    WranglerDocuments.remove({
      wrangler_file_id: wrangler_file_id,
    });
  }
}
FileHandler.prototype.parse = function() {
  console.log("No parse method defined, ignoring...");
};
FileHandler.prototype.insertWranglerDocument = function (metadataAndContents) {
  WranglerDocuments.insert(_.extend({
    submission_id: this.blob.metadata.submission_id,
    user_id: this.blob.metadata.user_id,
    wrangler_file_id: this.wranglerFile._id,
  }, metadataAndContents));
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


function MutationVCF (wrangler_file_id, isSimulation) {
  FileHandler.call(this, wrangler_file_id, isSimulation);
}
MutationVCF.prototype = Object.create(FileHandler.prototype);
MutationVCF.prototype.constructor = MutationVCF;
MutationVCF.description = "Mutation VCF";
MutationVCF.prototype.insertDocument = function(collection, contents) {
  if (this.isSimulation) {
    var collection_name = collection._name;
    this.insertWranglerDocument.call(this, {
      submission_type: collection_name,
      collection_name: collection_name,
      document_type: "prospective_document",
      contents: contents,
    });
  } else {
    collection.insert(_.extend({
      study_label: this.submission.options.study_label,
      collaboration_label: this.submission.options.collaboration_label,
      biological_source: this.submission.options.biological_source,
      mutation_impact_assessor: this.submission.options.mutation_impact_assessor,
    }, contents));
  }
};
// TODO: change object model to remove this function
function setHighLevel(highLevelObject, key, newValue) {
  if (highLevelObject[key] === undefined) {
    highLevelObject[key] = newValue;
  } else {
    // only complain if not the same
    if (highLevelObject[key] !== newValue) {
      // specifically for effect_impact: MODIFIER mixes with LOW
      if (key === "effect_impact") {
        if (newValue === "MODIFIER") {
          // don't do anything for right now...
        } else if (highLevelObject[key] === "MODIFIER") {
          highLevelObject[key] = newValue;
        } else {
          if (newValue === "HIGH" ||
              (newValue === "MODERATE" && highLevelObject[key] === "LOW")) {
            highLevelObject[key] = newValue;
          } else {
            // console.log("two different values for effect_impact in same mutationDoc, even with the LOW/MODIFIER code:",
            //     highLevelObject[key], newValue);
          }
        }
      } else {
        // console.log("two different values for " + key + " in same mutationDoc:",
        //     highLevelObject[key], newValue, "(using second)");
        highLevelObject[key] = newValue;
      }
    }
  }
}
MutationVCF.prototype.parse = function () {
  var self = this;
  return Q.Promise(function (resolve, reject) {
    self.blobAsString()
      .then(Meteor.bindEnvironment(function (blobText) {
        var data;
        try {
          data = ParseVCF(blobText);
        } catch (error) {
          reject("Error parsing .vcf file");
        }

        // TODO: pull from the sampleNames in the header
        // var possibleSampleLabel = record.__HEADER__.sampleNames[0];
        // if (possibleSampleLabel !== "ion-sample") {
        //   console.log("possibleSampleLabel:", possibleSampleLabel);
        //   mutationDoc.sample_label = possibleSampleLabel;
        // } else {
        //
        // }

        var sampleLabel = wrangleSampleLabel(self.blob.original.name);
        if (!sampleLabel) {
          throw "Could not parse sample label from file name";
        }

        for (var recordIndex in data.records) {
          var record = data.records[recordIndex];

          var mutationDoc = {
            "sample_label": sampleLabel,
          };

          var directMappings = {
            "REF": "reference_allele",
            "ALT": "variant_allele",
            "CHROM": "chromosome",
            "POS": "start_position",
          };

          for (var key in record) {
            var value = record[key];

            if (directMappings[key] !== undefined) {
              mutationDoc[directMappings[key]] = value;
            } else {
              if (key === "INFO") {
                for (var infoKey in value) {
                  var infoValue = value[infoKey];
                  if (infoKey === "EFF") {
                    var effArray = infoValue.split(",");
                    for (var effectIndex in effArray) {
                      // ex. for efffects[effectIndex]
                      // NON_SYNONYMOUS_CODING(MODERATE|MISSENSE|gaC/gaG|D1529E|1620|ALK|protein_coding|CODING|ENST00000389048|29|1)
                      var split = effArray[effectIndex].split("(");
                      var effectDescription = split[0]; // ex. NON_SYNONYMOUS_CODING
                      var effectArray = split[1]
                          .substring(0, split[1].length - 1) // remove trailing ')'
                          .split("|");
                      // console.log('eff array ', effectArray);
                      var effectAttributes = [
                        "Effect_Impact",
                        "Functional_Class",
                        "Codon_Change",
                        "Amino_Acid_change",
                        "Amino_Acid_length",
                        "Gene_Name",
                        "Transcript_BioType",
                        "Gene_Coding",
                        "Transcript_ID",
                        "Exon",
                        "GenotypeNum",
                        "ERRORS",
                        "WARNINGS",
                      ];
                      var effects = {};
                      // TODO: change to _.mapObject
                      for (var attributeIndex in effectAttributes) {
                        effects[effectAttributes[attributeIndex]] =
                            effectArray[attributeIndex];
                      }
                      setHighLevel(mutationDoc, "gene_label", effects.Gene_Name);
                      setHighLevel(mutationDoc, "protein_change", effects.Amino_Acid_change);
                      setHighLevel(mutationDoc, "effect_impact", effects.Effect_Impact);
                      setHighLevel(mutationDoc, "functional_class", effects.Functional_Class);
                      setHighLevel(mutationDoc, "genotype", effects.GenometypeNum);
                      // console.log("effects:", effects);

                    }
                  } else if (infoKey === "TYPE") {
                    setHighLevel(mutationDoc, "mutation_type", infoValue);
                  } else if (infoKey === "DP") {
                    setHighLevel(mutationDoc, "read_depth", infoValue);
                  } else {
                    // console.log("unknown key in INFO:", infoKey);
                  }
                }
              } else {
                // console.log("unknown attribute:", attribute);
              }
            }
          }

          /*
          ** get things from other places if not set already
          */

          // grab sample_label from file name if needed
          if (mutationDoc.mutation_type === undefined) {
            mutationDoc.mutation_type = "snp";
          }
          if (mutationDoc.start_position !== undefined &&
              mutationDoc.mutation_type === "snp") {
            // TODO: hardcoded
            mutationDoc.end_position = mutationDoc.start_position + 1;
          }

          if (mutationDoc.effect_impact === "LOW" ||
              mutationDoc.gene_label === undefined) {
            // console.log("not adding low impact mutation...");
          } else {
            self.insertDocument.call(self, Mutations, mutationDoc);
          }
        }

        resolve();
      }, reject));
  });
};


function RectangularFile (wrangler_file_id, isSimulation) {
  FileHandler.call(this, wrangler_file_id, isSimulation);
}
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
      }

      // I guess we should parse the line eventually...
      self.parseLine.call(self, brokenTabs, thisLineNumber, line);

      deferred.resolve();
    }, reject));

    bylineStream.on('end', Meteor.bindEnvironment(function () {
      // console.log("allLinePromises.slice(0, 5:)", allLinePromises.slice(0, 5));
      Q.all(allLinePromises)
        .then(Meteor.bindEnvironment(function () {
          self.endOfFile.call(self);
          resolve();
        }, reject))
        .catch(reject);
    }, reject));
  });
};
RectangularFile.prototype.parseLine = function (brokenTabs, lineNumber, line) {
  console.log("parseLine not overridden");
};
RectangularFile.prototype.endOfFile = function () {
  console.log("endOfFile not overridden");
};


var normalizationSlugsAndNames = [
  { "value": "raw_counts", "label": "Raw counts" },
  { "value": "counts", "label": "Quantile normalized counts" },
  { "value": "fpkm", "label": "FPKM" },
  { "value": "tpm", "label": "TPM" },
  { "value": "rsem_quan_log2", "label": "RSEM log(2)" },
];
var geneExpressionSchema = new SimpleSchema({
  "normalization": {
    type: String,
    allowedValues: _.pluck(normalizationSlugsAndNames, "value"),
    autoform: {
      options: normalizationSlugsAndNames,
    },
  },
});


function RectangularGeneExpression (wrangler_file_id, isSimulation) {
  RectangularFile.call(this, wrangler_file_id, isSimulation);

  // for use in validateGeneLabel
  this.validGenes = Expression2.aggregate([
      {$match: {gene: {$exists: true}}},
      {$project: {gene: 1}},
      {
        $group: {
          _id: null,
          validGenes: {$addToSet: "$gene"}
        }
      },
    ])[0].validGenes;

  this.validGenes.sort();
}
RectangularGeneExpression.prototype = Object.create(RectangularFile.prototype);
RectangularGeneExpression.prototype.constructor = RectangularGeneExpression;
RectangularGeneExpression.prototype.validateGeneLabel = function (gene_label) {
  // NOTE: couldn't think of the opposite of this statement
  if (binarysearch(this.validGenes, gene_label) >= 0) {
    return true;
  } else {
    throw "Invalid gene: " + gene_label;
  }
};
RectangularGeneExpression.prototype.validateExpressionStrings =
    function (expressionStrings) {
  for (var index in expressionStrings) {
    var valueString = expressionStrings[index];
    if (isNaN(valueString)) {
      throw "Error: Non-numerical expression value: " + valueString;
    }
  }
};
RectangularGeneExpression.prototype.Expression2Insert =
    function(gene, sampleLabels, expressionStrings) {
  // do some checks
  if (sampleLabels.length !== expressionStrings.length) {
    throw "Internal error: sampleLabels not the same length as " +
        " expressionStrings!";
  }

  var setObject = {};
  for (var index in sampleLabels) {
    var value = expressionStrings[index];
    var normalization = this.wranglerFile.options.normalization;
    var setAttribute = "samples." + sampleLabels[index] + "." + normalization;
    setObject[setAttribute] = parseFloat(value);
  }
  Expression2.upsert({
    gene: gene,
    Study_ID: this.submission.options.study_label,
    Collaborations: [this.submission.options.collaboration_label],
  }, {
    $set: setObject
  });
};


function BD2KGeneExpression (wrangler_file_id, isSimulation) {
  RectangularGeneExpression.call(this, wrangler_file_id, isSimulation);
}
BD2KGeneExpression.prototype =
    Object.create(RectangularGeneExpression.prototype);
BD2KGeneExpression.prototype.constructor = BD2KGeneExpression;
BD2KGeneExpression.schema = geneExpressionSchema;
BD2KGeneExpression.description = "Single patient gene expression (BD2K pipeline)";
function parseSampleLabel(possibleOptions) {
  for (var i in possibleOptions) {
    var label = wrangleSampleLabel(possibleOptions[i]);
    if (label) {
      return label;
    }
  }
  return null;
}
function parseSampleUUID(possibleOptions, submission_id) {
  for (var i in possibleOptions) {
    var label = wrangleSampleUUID(possibleOptions[i], submission_id);
    if (label) {
      return label;
    }
  }
  return null;
}
function getSampleLabel (brokenTabs, fileObject) {
  var sample_label;

  var possibleStrings = [
    brokenTabs[1],
    fileObject.original.name
  ];

  // try to wrangle sample label
  sample_label = parseSampleLabel(possibleStrings);

  // try to wrangle sample uuid
  if (!sample_label) {
    sample_label = parseSampleUUID(possibleStrings, fileObject.metadata.submission_id);
  }

  return sample_label;
}
BD2KGeneExpression.prototype.parseLine =
    function (brokenTabs, lineNumber, line) {
  if (lineNumber === 1) { // header line
    if (this.isSimulation) {
      this.gene_count = 0;
    }

    this.sample_label = getSampleLabel(brokenTabs, this.blob);
    console.log("this.sample_label:", this.sample_label);
    if (!this.sample_label) {
      throw "Error: could not parse sample label from header line or file name";
    }
  } else { // rest of file
    var gene_label = brokenTabs[0];
    var expressionStrings = brokenTabs.slice(1);

    // error checking
    this.validateGeneLabel.call(this, gene_label);
    this.validateExpressionStrings.call(this, expressionStrings);

    if (this.isSimulation) {
      this.gene_count++;
    } else {
      var sampleLabels = [this.sample_label];
      this.Expression2Insert.call(this, gene_label,
          sampleLabels, expressionStrings);
    }
  }
};
BD2KGeneExpression.prototype.endOfFile = function () {
  if (this.isSimulation) {
    this.insertWranglerDocument.call(this, {
      submission_type: "gene_expression",
      document_type: "sample_normalization",
      contents: {
        sample_label: this.sample_label,
        normalization: this.wranglerFile.options.normalization,
        gene_count: this.gene_count,
      },
    });
  }
};


function BD2KSampleLabelMap (wrangler_file_id, isSimulation) {
  RectangularFile.call(this, wrangler_file_id, isSimulation);
}
BD2KSampleLabelMap.prototype =
    Object.create(RectangularFile.prototype);
BD2KSampleLabelMap.prototype.constructor = BD2KSampleLabelMap;
BD2KSampleLabelMap.description = "Sample label mapping (BD2K pipeline)";
BD2KSampleLabelMap.prototype.parseLine =
    function (brokenTabs, lineNumber, line) {
  if (this.isSimulation) {
    if (lineNumber === 1) {
      this.headerLine = brokenTabs;
    } else {
      var sample_label = brokenTabs[this.headerLine.indexOf("Sample_Name")];
      var sample_uuid = brokenTabs[this.headerLine.indexOf("Sample_UUID")];

      // some error checking
      if (!sample_label) {
        throw "No column with header 'Sample_Name'";
      }
      if (!sample_uuid) {
        throw "No column with header 'Sample_UUID'";
      }

      this.insertWranglerDocument.call(this, {
        submission_type: "gene_expression",
        document_type: "sample_label_map",
        contents: {
          sample_label: sample_label,
          sample_uuid: sample_uuid,
        },
      });
    }
  }
};


function TCGAGeneExpression (wrangler_file_id, isSimulation) {
  RectangularGeneExpression.call(this, wrangler_file_id, isSimulation);
}
TCGAGeneExpression.prototype =
    Object.create(RectangularGeneExpression.prototype);
TCGAGeneExpression.prototype.constructor = TCGAGeneExpression;
TCGAGeneExpression.description = "TCGA gene expression";
// // only accepts quantile normalized counts
// TCGAGeneExpression.schema = geneExpressionSchema;
function verifySampleLabels(sampleLabels) {
  for (var index in sampleLabels) {
    var label = sampleLabels[index];
    var found = wrangleSampleLabel(label);
    if (found !== label) {
      throw "could not find sample label in " + label;
    }
  }
}
TCGAGeneExpression.prototype.parseLine =
    function (brokenTabs, lineNumber, line) {
  if (lineNumber === 1) { // header line
    if (this.isSimulation) {
      this.gene_count = 0;
    }

    if (brokenTabs[0] !== "Hybridization REF") {
      throw "expected 'Hybridization REF' to start file";
    }

    this.sampleLabels = brokenTabs.slice(1);
    verifySampleLabels(this.sampleLabels);
  } else if (lineNumber === 2) { // second header line
    if (brokenTabs[0] !== "gene_id") {
      throw "expected 'gene_id' to lead second line";
    }

    for (var index = 1; index < brokenTabs.length; index++) {
      var cellText = brokenTabs[index];
      if (cellText !== "normalized_count") {
        throw "expected 'normalized_count' for normalization line";
      }
    }
  } else { // rest of file
    var brokenOnPipe = brokenTabs[0].split("|");
    if (brokenOnPipe.length !== 2) {
      throw "expected GENE|ID in gene_id field";
    }

    var gene_label = brokenOnPipe[0];
    if (gene_label === "?") {
      console.log("ignoring gene: " + brokenTabs[0]);
      return;
    }
    var expressionStrings = brokenTabs.slice(1);

    // error checking
    this.validateGeneLabel.call(this, gene_label);
    this.validateExpressionStrings.call(this, expressionStrings);

    if (this.isSimulation) {
      this.gene_count++;
    } else {
      this.Expression2Insert.call(this, gene_label,
          this.sampleLabels, expressionStrings);
    }
  }
};
TCGAGeneExpression.prototype.endOfFile = function () {
  if (this.isSimulation) {
    for (var index in this.sampleLabels) {
      this.insertWranglerDocument.call(this, {
        submission_type: "gene_expression",
        document_type: "sample_normalization",
        contents: {
          sample_label: this.sampleLabels[index],
          normalization: this.wranglerFile.options.normalization,
          gene_count: this.gene_count,
        },
      });
    }
  }
};


// > db.Clinical_Info.findOne()
// {
// 	"_id" : "oFFkytCFwaikQgemq",
// 	"Sample_ID" : "DTB-165",      // "Tumor RNA"
// 	"site" : "OHSU",              // from file options
// 	"Patient_ID" : "DTB-165",     // OLENA: which row?
// 	"age" : 79,                   // "Age"
// 	"On_Study_Date" : ISODate("2015-06-04T00:00:00Z"), // OLENA: where to get?
// 	"Study_ID" : "prad_wcdt"      // from submission options
// }
function BasicClinical (wrangler_file_id, isSimulation) {
  RectangularGeneExpression.call(this, wrangler_file_id, isSimulation);
}
BasicClinical.prototype = Object.create(RectangularFile.prototype);
BasicClinical.schema = new SimpleSchema({
  // TODO:
});
BasicClinical.description = "Fusion bare minimum clinical";
BasicClinical.prototype.constructor = BasicClinical;
BasicClinical.prototype.parseLine =
    function (brokenTabs, lineNumber, line) {
  console.log("line:", line);
  if (lineNumber === 1) { // header line
    // ensure we have the required headings
    this.sampleLabelTabIndex = brokenTabs.indexOf("Tumor RNA");
    if (this.sampleLabelTabIndex < 0) {
      throw "'Tumor RNA' row required";
    }

    this.ageTabIndex = brokenTabs.indexOf("Age");
    if (this.ageTabIndex < 0) {
      throw "'Age' row required";
    }
  } else { // rest of file
    var Sample_ID = brokenTabs[this.sampleLabelTabIndex];
    verifySampleLabels([Sample_ID]);

    var ageString = brokenTabs[this.ageLabelIndex];
    if (isNaN(ageString)) {
      throw "age value not a string: " + ageString;
    }
    var age = parseInt(ageString);

    var clinicalInfoObject = {
      Sample_ID: Sample_ID,
    	site: study_site,
    	Patient_ID: "CHOC-patient-label", // NOTE: hardcoded
    	age: age,
    	On_Study_Date: ISODate("2015-06-04T00:00:00Z"), // NOTE: hardcoded
    	Study_ID: this.submission.options.study_label,
    };

    console.log("inserting:", clinicalInfoObject);
    if (this.isSimulation) {
      this.insertDocument.call(this, Clinical_Info, clinicalInfoObject);
    } else {
      Clinical_Info.insert(clinicalInfoObject);
    }
  }
};
BasicClinical.prototype.endOfFile = function () {
  if (this.isSimulation) {
    for (var index in this.sampleLabels) {
      this.insertWranglerDocument.call(this, {
        submission_type: "gene_expression",
        document_type: "sample_normalization",
        contents: {
          sample_label: this.sampleLabels[index],
          normalization: this.wranglerFile.options.normalization,
          gene_count: this.gene_count,
        },
      });
    }
  }
};


WranglerFileTypes = {
  MutationVCF: MutationVCF,
  BD2KGeneExpression: BD2KGeneExpression,
  BD2KSampleLabelMap: BD2KSampleLabelMap,
  TCGAGeneExpression: TCGAGeneExpression,
  BasicClinical: BasicClinical,
};

WranglerFileTypeSchemas = {};

for (var index in WranglerFileTypes) {
  WranglerFileTypeSchemas[index] = WranglerFileTypes[index].schema;
}
