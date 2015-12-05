Wrangler = {};

Wrangler.wrangleSampleLabel = function (text) {
  if (!text) {
    throw new Error("called wrangleSampleLabel with undefined");
  }

  // TODO: what if it's ProR3 or something?
  var proIfPro = "";
  if (text.match(/pro/gi)) {
    proIfPro = "Pro";
  }

  var matches;
  var firstMatch;
  var replicateNumber = "";

  // try to match something like "DTB-000"
  matches = text.match(/DTB-[0-9][0-9][0-9]/g);
  if (matches) {
    if (text.match(/duplicate/gi)) {
      if (proIfPro === "") {
        replicateNumber = "Dup";
      } else {
        replicateNumber = "2";
      }
    }

    var baselineProWithNum = text.match(/(baseline|progression)[0-9]/gi);
    if (baselineProWithNum) {
      replicateNumber = baselineProWithNum[0].match(/[0-9]/)[0];
      if (proIfPro === "") {
        if (replicateNumber === "2") {
          replicateNumber = "Dup";
        } else {
          throw "Unclear what to do with third BL duplicate for " + text;
        }
      }
    }

    return matches[0] + proIfPro + replicateNumber;
  }

  // match weird .vcf file names (e.g. "DTB-OH-014-Pro-AC.anno.fix.vcf")
  // http://regexr.com/3c0kn
  matches = text.match(/DTB-[A-Z]{1,4}-[0-9]{3}/g);
  if (matches) {
    return matches[0] + proIfPro;
  }

  // match TCGA sample labels (e.g. "TCGA-02-0055-01A-01R-1849-01")
  // https://wiki.nci.nih.gov/display/TCGA/TCGA+barcode
  // http://regexr.com/3c1b7
  var tcgaRegex =
  /TCGA-[A-Z0-9]{2}-[A-Z0-9]{1,4}-[0-9]{2}[A-Z]-[0-9]{2}[DGHRTWX]-[A-Z0-9]{4}-[0-9]{2}/g;
  matches = text.match(tcgaRegex);
  if (matches) {
    return matches[0];
  }

  // match samples like "DTB_097_Pro_T" (copy number data)
  // http://regexr.com/3c5p8
  // DTB_097_BL_T ==> DTB-097
  // DTB_097_BL2_T ==> DTB-097Dup
  // DTB_097_BL3_T ==> error thrown!
  // DTB_097_Pro_T ==> DTB-097Pro
  // DTB_097_Pro5_T ==> DTB-097Pro5
  matches = text.match(/DTB_[0-9]{3}_(BL|Pro)([0-9]|)_T/g);
  if (matches) {
    firstMatch = matches[0];
    var numbers = firstMatch.match(/[0-9]{3}/g)[0];

    replicateNumber = "";
    // NOTE: no | after [0-9]
    var replicateMatches = firstMatch.match(/(BL|Pro)([0-9])/g);
    if (replicateMatches) {
      var replicatePart = replicateMatches[0];
      if (proIfPro === "") {
        if (replicatePart === "BL2") {
          replicateNumber = "Dup";
        } else {
          throw "Unclear what to do with third BL duplicate for " + text;
        }
      } else {
        replicateNumber = replicatePart.match(/[0-9]/g)[0];
      }
    }

    return "DTB-" + numbers + proIfPro + replicateNumber;
  }
};

Wrangler.findSampleLabel = function (possibleOptions) {
  for (var i in possibleOptions) {
    var label = Wrangler.wrangleSampleLabel(possibleOptions[i]);
    if (label) {
      return label;
    }
  }
};

// for BD2KGeneExpression schema
var geneExpressionValues = GeneExpression.simpleSchema().schema();
var normalizationKeys = _.filter(Object.keys(geneExpressionValues),
    function (value) {
  // check if it has 'values.' at the beginning
  return value.slice(0, 7) === 'values.';
});
var allowedValues = _.map(normalizationKeys, function (value) {
  // 'values.raw_counts' ==> 'raw_counts'
  return value.slice(7);
});
var options = _.map(allowedValues, function (normalization) {
  return {
    value: normalization,
    label: geneExpressionValues['values.' + normalization].label,
  };
});

Wrangler.fileTypes = {
  BD2KGeneExpression: {
    description: "Single patient gene expression (BD2K pipeline)",
    schema: new SimpleSchema({
      normalization: {
        type: String,
        allowedValues: allowedValues,
        autoform: {
          options: options,
        },
      }
    }),
  },
  BD2KSampleLabelMap: {
    description: "Sample label mapping (BD2K pipeline)",
  },
};
