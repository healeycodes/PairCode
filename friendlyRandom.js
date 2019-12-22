const friendlyWords = require("friendly-words");

// e.g. 'thread-pasta-resolution'
const get = () => {
  const pick = arr => arr[Math.floor(Math.random() * arr.length)];
  return `${pick(friendlyWords.predicates)}-${pick(
    friendlyWords.objects
  )}-${pick(friendlyWords.objects)}`;
};

module.exports = {
  get
};