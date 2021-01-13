const logError = err => {
  console.warn(err.message);
  console.warn(err.stack);
};

module.exports = logError;
