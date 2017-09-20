/*
  Convert input to an array.

  If input is null or undefined, return empty array.
  If input is array, return it unmodified.
  Else wrap input into an array.
*/
module.exports.toArray = function(input) {
  if (input === undefined || input === null) {
    return [];
  }

  if (Array.isArray(input)) {
    return input;
  }

  return [ input ]
}
