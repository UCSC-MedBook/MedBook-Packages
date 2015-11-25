_.mapObject = function (obj, func) {
  var newObject = {};
  for (var index in obj) {
    newObject[index] = func(obj[index], index, obj);
  }
  return newObject;
};
