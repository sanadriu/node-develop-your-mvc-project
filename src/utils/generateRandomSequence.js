function generateRandomSequence(length, chars = "AaBbCcDdEeFf0123456789") {
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

module.exports = generateRandomSequence;
