_.mapObject = function (obj, func) {
  var newObject = {};
  for (var index in obj) {
    newObject[index] = func(obj[index], index, obj);
  }
  return newObject;
};

Expression2Insert = function(gene, sampleLabels, expressionStrings) {
  // do some checks
  if (sampleLabels.length !== expressionStrings.length) {
    throw "Internal error: sampleLabels not the same length as " +
        " expressionStrings!";
  }

  var setObject = {};
  for (var index in sampleLabels) {
    var value = expressionStrings[index];
    var normalization = this.wranglerFile.options.normalization;
    var exceptNormalization = "samples." + sampleLabels[index] + ".";
    var parsedValue = parseFloat(value);
    setObject[exceptNormalization + normalization] = parsedValue;

    if (normalization === 'quantile_counts') {
      var log2Value = Math.log(parsedValue) / Math.LN2;
      setObject[exceptNormalization + 'rsem_quan_log2'] = log2Value;
    }
  }
  Expression2.upsert({
    gene: gene,
    Study_ID: this.submission.options.study_label,
    Collaborations: [this.submission.options.collaboration_label],
  }, {
    $set: setObject
  });
};
