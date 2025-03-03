function deepClone(obj) {
  if (obj instanceof Array) {
    return obj.map((value) => (value instanceof Object ? deepClone(value) : value));
  } else {
    const newObj = {};

    Object.entries(obj).forEach(([prop, value]) => {
      newObj[prop] = obj[prop] instanceof Object ? deepClone(value) : value;
    });

    return newObj;
  }
}

module.exports = deepClone;
