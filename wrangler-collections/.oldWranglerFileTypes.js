// https://docs.google.com/drawings/d/1I8TVxsWXivIIxxwENUbExBQHZ1xE1D9Mdo09eTSMLj4/edit?usp=sharing

// load npm packages
if (Meteor.isServer) {
  // TODO: I don't know if this is used anymore...
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

// // define some helper functions
//
// // ensure that each sampleLabel is the text returned by wrangleSampleLabel
// function verifySampleLabelsExactly(sampleLabels) {
//   for (var index in sampleLabels) {
//     var label = sampleLabels[index];
//     var found = Wrangler.wrangleSampleLabel(label);
//     if (found !== label) {
//       throw "could not find sample label in " + label;
//     }
//   }
// }
//
// // make sure that each string has some semblance of a sample_label in it
// // (wrangleSampleLabel returns something, not necessarily exactly the same text
// // as the text it was called with)
// function verifySampleLabelsExist(uglySampleLabels) {
//   var niceSampleLabels = new Array(uglySampleLabels.length);
//
//   for (var index in uglySampleLabels) {
//     var label = uglySampleLabels[index];
//     niceSampleLabels[index] = Wrangler.wrangleSampleLabel(label);
//     if (!niceSampleLabels[index]) {
//       throw "could not find sample label in " + label;
//     }
//   }
//
//   return niceSampleLabels;
// }
//

//
// function MutationVCF (wrangler_file_id, isSimulation) {
//   FileHandler.call(this, wrangler_file_id, isSimulation);
// }
// MutationVCF.prototype = Object.create(FileHandler.prototype);
// MutationVCF.prototype.constructor = MutationVCF;
// MutationVCF.description = "Mutation VCF";
// MutationVCF.prototype.insertDocument = function(collection, contents) {
//   if (this.isSimulation) {
//     var collection_name = collection._name;
//     this.insertWranglerDocument.call(this, {
//       submission_type: collection_name,
//       collection_name: collection_name,
//       document_type: "prospective_document",
//       contents: contents,
//     });
//   } else {
//     collection.insert(_.extend({
//       study_label: this.submission.options.study_label,
//       collaboration_label: this.submission.options.collaboration_label,
//       biological_source: this.submission.options.biological_source,
//       mutation_impact_assessor: this.submission.options.mutation_impact_assessor,
//     }, contents));
//   }
// };
// // TODO: change object model to remove this function
// function setHighLevel(highLevelObject, key, newValue) {
//   if (highLevelObject[key] === undefined) {
//     highLevelObject[key] = newValue;
//   } else {
//     // only complain if not the same
//     if (highLevelObject[key] !== newValue) {
//       // specifically for effect_impact: MODIFIER mixes with LOW
//       if (key === "effect_impact") {
//         if (newValue === "MODIFIER") {
//           // don't do anything for right now...
//         } else if (highLevelObject[key] === "MODIFIER") {
//           highLevelObject[key] = newValue;
//         } else {
//           if (newValue === "HIGH" ||
//               (newValue === "MODERATE" && highLevelObject[key] === "LOW")) {
//             highLevelObject[key] = newValue;
//           } else {
//             // console.log("two different values for effect_impact in same mutationDoc, even with the LOW/MODIFIER code:",
//             //     highLevelObject[key], newValue);
//           }
//         }
//       } else {
//         // console.log("two different values for " + key + " in same mutationDoc:",
//         //     highLevelObject[key], newValue, "(using second)");
//         highLevelObject[key] = newValue;
//       }
//     }
//   }
// }
// MutationVCF.prototype.parse = function () {
//   var self = this;
//   return Q.Promise(function (resolve, reject) {
//     self.blobAsString()
//       .then(Meteor.bindEnvironment(function (blobText) {
//         var data;
//         try {
//           data = ParseVCF(blobText);
//         } catch (error) {
//           reject("Error parsing .vcf file");
//         }
//
//         // TODO: pull from the sampleNames in the header
//         // var possibleSampleLabel = record.__HEADER__.sampleNames[0];
//         // if (possibleSampleLabel !== "ion-sample") {
//         //   console.log("possibleSampleLabel:", possibleSampleLabel);
//         //   mutationDoc.sample_label = possibleSampleLabel;
//         // } else {
//         //
//         // }
//
//         var sampleLabel = Wrangler.wrangleSampleLabel(self.blob.original.name);
//         if (!sampleLabel) {
//           throw "Could not parse sample label from file name";
//         }
//
//         for (var recordIndex in data.records) {
//           var record = data.records[recordIndex];
//
//           var mutationDoc = {
//             "sample_label": sampleLabel,
//           };
//
//           var directMappings = {
//             "REF": "reference_allele",
//             "ALT": "variant_allele",
//             "CHROM": "chromosome",
//             "POS": "start_position",
//           };
//
//           for (var key in record) {
//             var value = record[key];
//
//             if (directMappings[key] !== undefined) {
//               mutationDoc[directMappings[key]] = value;
//             } else {
//               if (key === "INFO") {
//                 for (var infoKey in value) {
//                   var infoValue = value[infoKey];
//                   if (infoKey === "EFF") {
//                     var effArray = infoValue.split(",");
//                     for (var effectIndex in effArray) {
//                       // ex. for efffects[effectIndex]
//                       // NON_SYNONYMOUS_CODING(MODERATE|MISSENSE|gaC/gaG|D1529E|1620|ALK|protein_coding|CODING|ENST00000389048|29|1)
//                       var split = effArray[effectIndex].split("(");
//                       var effectDescription = split[0]; // ex. NON_SYNONYMOUS_CODING
//                       var effectArray = split[1]
//                           .substring(0, split[1].length - 1) // remove trailing ')'
//                           .split("|");
//                       // console.log('eff array ', effectArray);
//                       var effectAttributes = [
//                         "Effect_Impact",
//                         "Functional_Class",
//                         "Codon_Change",
//                         "Amino_Acid_change",
//                         "Amino_Acid_length",
//                         "Gene_Name",
//                         "Transcript_BioType",
//                         "Gene_Coding",
//                         "Transcript_ID",
//                         "Exon",
//                         "GenotypeNum",
//                         "ERRORS",
//                         "WARNINGS",
//                       ];
//                       var effects = {};
//                       // TODO: change to _.mapObject
//                       for (var attributeIndex in effectAttributes) {
//                         effects[effectAttributes[attributeIndex]] =
//                             effectArray[attributeIndex];
//                       }
//                       setHighLevel(mutationDoc, "gene_label", effects.Gene_Name);
//                       setHighLevel(mutationDoc, "protein_change", effects.Amino_Acid_change);
//                       setHighLevel(mutationDoc, "effect_impact", effects.Effect_Impact);
//                       setHighLevel(mutationDoc, "functional_class", effects.Functional_Class);
//                       setHighLevel(mutationDoc, "genotype", effects.GenometypeNum);
//                       // console.log("effects:", effects);
//
//                     }
//                   } else if (infoKey === "TYPE") {
//                     setHighLevel(mutationDoc, "mutation_type", infoValue);
//                   } else if (infoKey === "DP") {
//                     setHighLevel(mutationDoc, "read_depth", infoValue);
//                   } else {
//                     // console.log("unknown key in INFO:", infoKey);
//                   }
//                 }
//               } else {
//                 // console.log("unknown attribute:", attribute);
//               }
//             }
//           }
//
//           /*
//           ** get things from other places if not set already
//           */
//
//           // grab sample_label from file name if needed
//           if (mutationDoc.mutation_type === undefined) {
//             mutationDoc.mutation_type = "snp";
//           }
//           if (mutationDoc.start_position !== undefined &&
//               mutationDoc.mutation_type === "snp") {
//             // TODO: hardcoded
//             mutationDoc.end_position = mutationDoc.start_position + 1;
//           }
//
//           if (mutationDoc.effect_impact === "LOW" ||
//               mutationDoc.gene_label === undefined) {
//             // console.log("not adding low impact mutation...");
//           } else {
//             self.insertDocument.call(self, Mutations, mutationDoc);
//           }
//         }
//
//         resolve();
//       }, reject));
//   });
// };
//
//

//
//

//
//

//
//
// function BD2KSampleLabelMap (wrangler_file_id, isSimulation) {
//   RectangularFile.call(this, wrangler_file_id, isSimulation);
// }
// BD2KSampleLabelMap.prototype =
//     Object.create(RectangularFile.prototype);
// BD2KSampleLabelMap.prototype.constructor = BD2KSampleLabelMap;
// BD2KSampleLabelMap.description = "Sample label mapping (BD2K pipeline)";
// BD2KSampleLabelMap.prototype.parseLine =
//     function (brokenTabs, lineNumber, line) {
//   if (this.isSimulation) {
//     if (lineNumber === 1) {
//       this.headerLine = brokenTabs;
//     } else {
//       var original_sample_label =
//           brokenTabs[this.headerLine.indexOf("Sample_Name")];
//       var sample_uuid = brokenTabs[this.headerLine.indexOf("Sample_UUID")];
//
//       // some error checking
//       if (!original_sample_label) {
//         throw "No column with header 'Sample_Name'";
//       }
//       if (!sample_uuid) {
//         throw "No column with header 'Sample_UUID'";
//       }
//
//       this.insertWranglerDocument.call(this, {
//         submission_type: "gene_expression",
//         document_type: "sample_label_map",
//         contents: {
//           original_sample_label: original_sample_label,
//           sample_label: Wrangler.wrangleSampleLabel(original_sample_label),
//           sample_uuid: sample_uuid,
//         },
//       });
//     }
//   }
// };
//
//
// function TCGAGeneExpression (wrangler_file_id, isSimulation) {
//   RectangularGeneExpression.call(this, wrangler_file_id, isSimulation);
// }
// TCGAGeneExpression.prototype =
//     Object.create(RectangularGeneExpression.prototype);
// TCGAGeneExpression.prototype.constructor = TCGAGeneExpression;
// TCGAGeneExpression.description = "TCGA gene expression";
// TCGAGeneExpression.prototype.parseLine =
//     function (brokenTabs, lineNumber, line) {
//   if (lineNumber === 1) { // header line
//     if (this.isSimulation) {
//       this.gene_count = 0;
//     }
//
//     if (brokenTabs[0] !== "Hybridization REF") {
//       throw "expected 'Hybridization REF' to start file";
//     }
//
//     this.sampleLabels = brokenTabs.slice(1);
//     verifySampleLabelsExactly(this.sampleLabels);
//   } else if (lineNumber === 2) { // second header line
//     if (brokenTabs[0] !== "gene_id") {
//       throw "expected 'gene_id' to lead second line";
//     }
//
//     for (var index = 1; index < brokenTabs.length; index++) {
//       var cellText = brokenTabs[index];
//       if (cellText !== "normalized_count") {
//         throw "expected 'normalized_count' for normalization line";
//       }
//     }
//   } else { // rest of file
//     var brokenOnPipe = brokenTabs[0].split("|");
//     if (brokenOnPipe.length !== 2) {
//       throw "expected GENE|ID in gene_id field";
//     }
//
//     var gene_label = brokenOnPipe[0];
//     if (gene_label === "?") {
//       console.log("ignoring gene: " + brokenTabs[0]);
//       return;
//     }
//     var expressionStrings = brokenTabs.slice(1);
//
//     // error checking
//     this.validateGeneLabel.call(this, gene_label);
//     this.validateExpressionStrings.call(this, expressionStrings);
//
//     if (this.isSimulation) {
//       this.gene_count++;
//     } else {
//       this.Expression2Insert.call(this, gene_label,
//           this.sampleLabels, expressionStrings);
//     }
//   }
// };
// TCGAGeneExpression.prototype.endOfFile = function () {
//   if (this.isSimulation) {
//     var normalization = this.getNormalizationLabel.call(this, GeneExpression);
//
//     for (var index in this.sampleLabels) {
//       this.insertWranglerDocument.call(this, {
//         submission_type: "gene_expression",
//         document_type: "sample_normalization",
//         contents: {
//           sample_label: this.sampleLabels[index],
//           normalization: normalization,
//           gene_count: this.gene_count,
//         },
//       });
//     }
//   }
// };
//
//
// function CopyNumberExpression (wrangler_file_id, isSimulation) {
//   RectangularGeneExpression.call(this, wrangler_file_id, isSimulation);
// }
// CopyNumberExpression.prototype =
//     Object.create(RectangularGeneExpression.prototype);
// CopyNumberExpression.prototype.constructor = CopyNumberExpression;
// CopyNumberExpression.description = "Copy number";
// CopyNumberExpression.prototype.parseLine =
//     function (brokenTabs, lineNumber, line) {
//   if (lineNumber === 1) { // header line
//     if (this.isSimulation) {
//       this.gene_count = 0;
//     }
//
//     if (brokenTabs[0] !== 'Gene Symbol' ||
//         brokenTabs[1] !== 'Locus ID' ||
//         brokenTabs[2] !== 'Cytoband') {
//       throw 'expected "Gene Symbol\tLocus ID\tCytoband\t" to start file';
//     }
//
//     this.sampleLabels = verifySampleLabelsExist(brokenTabs.slice(3));
//   } else { // rest of file
//     var brokenOnPipe = brokenTabs[0].split("|");
//     if (brokenOnPipe.length === 2 && brokenOnPipe[1].slice(0, 3) !== 'chr') {
//       throw 'expected "GENE" or "GENE|chrNUM" in "Gene Symbol" field';
//     }
//
//     var gene_label = brokenOnPipe[0];
//     var expressionStrings = brokenTabs.slice(3);
//
//     // error checking
//     this.validateGeneLabel.call(this, gene_label);
//     this.validateExpressionStrings.call(this, expressionStrings);
//
//     if (this.isSimulation) {
//       this.gene_count++;
//     } else {
//       return this.CopyNumberInsert.call(this, gene_label,
//           this.sampleLabels, expressionStrings);
//     }
//   }
// };
// CopyNumberExpression.prototype.endOfFile = function () {
//   if (this.isSimulation) {
//     var normalization = this.getNormalizationLabel.call(this, CopyNumber);
//
//     for (var index in this.sampleLabels) {
//       this.insertWranglerDocument.call(this, {
//         submission_type: "gene_expression",
//         document_type: "sample_normalization",
//         contents: {
//           sample_label: this.sampleLabels[index],
//           normalization: normalization,
//           gene_count: this.gene_count,
//         },
//       });
//     }
//   }
// };
//
//
//
// // > db.Clinical_Info.findOne()
// // {
// // 	"_id" : "oFFkytCFwaikQgemq",
// // 	"Sample_ID" : "DTB-165",      // "Tumor RNA"
// // 	"site" : "OHSU",              // from file options
// // 	"Patient_ID" : "DTB-165",     // OLENA: which row?
// // 	"age" : 79,                   // "Age"
// // 	"On_Study_Date" : ISODate("2015-06-04T00:00:00Z"), // OLENA: where to get?
// // 	"Study_ID" : "prad_wcdt"      // from submission options
// // }
// function BasicClinical (wrangler_file_id, isSimulation) {
//   RectangularGeneExpression.call(this, wrangler_file_id, isSimulation);
// }
// BasicClinical.prototype = Object.create(RectangularFile.prototype);
// BasicClinical.schema = new SimpleSchema({
//   // TODO:
// });
// BasicClinical.description = "Fusion bare minimum clinical";
// BasicClinical.prototype.constructor = BasicClinical;
// BasicClinical.prototype.parseLine =
//     function (brokenTabs, lineNumber, line) {
//   console.log("line:", line);
//   if (lineNumber === 1) { // header line
//     // ensure we have the required headings
//     this.sampleLabelTabIndex = brokenTabs.indexOf("Tumor RNA");
//     if (this.sampleLabelTabIndex < 0) {
//       throw "'Tumor RNA' row required";
//     }
//
//     this.ageTabIndex = brokenTabs.indexOf("Age");
//     if (this.ageTabIndex < 0) {
//       throw "'Age' row required";
//     }
//   } else { // rest of file
//     var Sample_ID = brokenTabs[this.sampleLabelTabIndex];
//     verifySampleLabelsExactly([Sample_ID]);
//
//     var ageString = brokenTabs[this.ageLabelIndex];
//     if (isNaN(ageString)) {
//       throw "age value not a string: " + ageString;
//     }
//     var age = parseInt(ageString);
//
//     var clinicalInfoObject = {
//       Sample_ID: Sample_ID,
//     	site: study_site,
//     	Patient_ID: "CHOC-patient-label", // NOTE: hardcoded
//     	age: age,
//     	On_Study_Date: new Date(),
//     	Study_ID: this.submission.options.study_label,
//     };
//
//     console.log("inserting:", clinicalInfoObject);
//     if (this.isSimulation) {
//       this.insertDocument.call(this, Clinical_Info, clinicalInfoObject);
//     } else {
//       Clinical_Info.insert(clinicalInfoObject);
//     }
//   }
// };
// BasicClinical.prototype.endOfFile = function () {
//   if (this.isSimulation) {
//
//
//
//
//     for (var index in this.sampleLabels) {
//       this.insertWranglerDocument.call(this, {
//         submission_type: "gene_expression",
//         document_type: "sample_normalization",
//         contents: {
//           sample_label: this.sampleLabels[index],
//           normalization: normalization,
//           gene_count: this.gene_count,
//         },
//       });
//     }
//   }
// };
