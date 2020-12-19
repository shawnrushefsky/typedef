const assert = require("assert").strict;

function getTypes(payload, extraTypeMappings = {}) {
  const type = typeof payload;
  const stringTypes = Object.keys(extraTypeMappings).filter(
    (t) => extraTypeMappings[t].regex
  );
  const objTypes = Object.keys(extraTypeMappings).filter(
    (t) => extraTypeMappings[t].type
  );
  if (type === "string") {
    for (const typeName of stringTypes) {
      if (extraTypeMappings[typeName].regex.test(payload)) {
        return typeName;
      }
    }
  }
  if (type !== "object") {
    return type;
  } else if (payload === null) {
    return "( string | null )";
  } else if (Array.isArray(payload)) {
    return payload.map(elem => getTypes(elem, extraTypeMappings));
  }

  for (const typeName of objTypes) {
    const otherTypes = Object.assign({}, extraTypeMappings);
    delete otherTypes[typeName];
    if (isOfType(payload, extraTypeMappings[typeName].type, otherTypes)) {
      return typeName;
    }
  }

  const types = {};
  for (const key in payload) {
    const value = payload[key];
    types[key] = getTypes(value, extraTypeMappings);
  }

  return types;
}

function getTypeString(payload, currentIndent = "") {
  if (typeof payload === "string") {
    return payload;
  } else if (!Array.isArray(payload)) {
    let comment = "{";
    for (const key in payload) {
      comment += `\n${currentIndent + "  "}${key}: ${getTypeString(
        payload[key],
        currentIndent + "  "
      )}`;
    }
    return `${comment}\n${currentIndent}}`;
  } else {
    return `Array<${getTypeString(payload[0], currentIndent)}>`;
  }
}

function wrapAsComment(name, description, typeString) {
  const descriptionLines = description.split('\n');
  let comment = '/**';
  descriptionLines.forEach(line => {
    comment += `\n * ${line}`;
  });
  comment += '\n * @typedef {';
  
  const lines = typeString.split("\n");
  comment += lines[0];
  lines.slice(1).forEach(line => {
    comment += `\n * ${line}`;
  });

  comment += `} ${name}\n */`;
  return comment;
}

function typedef(name, description, payload, extraTypeMappings = {}) {
  let comment = wrapAsComment(
    name,
    description,
    getTypeString(getTypes(payload, extraTypeMappings))
  );

  const stringTypes = Object.keys(extraTypeMappings).filter(
    (t) => extraTypeMappings[t].regex
  );
  const objTypes = Object.keys(extraTypeMappings).filter(
    (t) => extraTypeMappings[t].type
  );

  for (const typeName of stringTypes) {
    const subTypeComment = wrapAsComment(
      typeName,
      extraTypeMappings[typeName].description,
      'string'
    );
    comment += `\n\n${subTypeComment}`
  }

  for (const typeName of objTypes) {
    const subTypeComment = wrapAsComment(
      typeName,
      extraTypeMappings[typeName].description,
      getTypeString(extraTypeMappings[typeName].type)
    );
    comment += `\n\n${subTypeComment}`;
  }

  return comment;
}

function isOfType(obj, type, extraMappings) {
  const objType = getTypes(obj, extraMappings);
  try {
    assert.deepStrictEqual(objType, type);
    return true;
  } catch (e) {
    return false;
  }
}

function hydrate(payload, extraMappings) {
  const objTypes = Object.keys(extraMappings).filter(
    (t) => extraMappings[t].type
  );
  const stringTypes = Object.keys(extraTypeMappings).filter(
    (t) => extraTypeMappings[t].regex
  );

  const type = typeof payload;
  if (type === 'string' && objTypes.includes(type)) {
    return extraMappings[type].type;
  } else if (type === 'string' && stringTypes.includes(type)) {
    return 'string';
  }

  if (type !== "object") {
    return payload;
  } else if (Array.isArray(payload)) {
    return payload.map(elem => hydrate(elem, extraMappings));
  }

  const types = {};
  for (const key in payload) {
    const value = payload[key];
    types[key] = hydrate(value, extraTypeMappings);
  }

  return types;
}

module.exports = {
  getTypes,
  getTypeString,
  wrapAsComment,
  typedef,
  isOfType,
  hydrate
};
