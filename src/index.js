const assert = require("assert").strict;

/**
 * @typedef {{
 * description: string,
 * regex: ( RegExp | undefined),
 * type: ( Schema | undefined)
 * }} TypeSummary
 */

/**
 * @typedef {Object} Schema
 */

/**
 * Returns a schema object from a JSON serializable object
 * @param {Object} payload Any JSON-serializable object
 * @param {{[TypeName: string]: TypeSummary}} extraTypeMappings
 *
 * @returns {Schema}
 */
function getTypes(payload, extraTypeMappings = {}) {
  const type = typeof payload;
  const stringTypes = Object.keys(extraTypeMappings).filter(
    (t) => extraTypeMappings[t].regex
  );
  const objTypes = Object.keys(extraTypeMappings).filter(
    (t) => extraTypeMappings[t].type
  );

  /**
   * Cache the fully hydrated schema for each type.
   * This provides a substantial performance improvement.
   */
  objTypes
    .filter((typeName) => !extraTypeMappings[typeName].hydrated)
    .forEach(
      (typeName) =>
        (extraTypeMappings[typeName].hydrated = hydrate(
          extraTypeMappings[typeName].type,
          extraTypeMappings
        ))
    );

  /**
   * Identify special string types
   */
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
    // TODO: Use multiple sample documents to infer this more accurately
    return "( string | null )";
  } else if (Array.isArray(payload)) {
    return [getTypes(payload[0], extraTypeMappings)];
  }

  /**
   * Identify special object types
   */
  for (const typeName of objTypes) {
    const otherTypes = Object.assign({}, extraTypeMappings);
    delete otherTypes[typeName];
    if (isOfType(payload, extraTypeMappings[typeName].hydrated)) {
      return typeName;
    }
  }

  /**
   * Recursively get types for all fields in the payload
   */
  const types = {};
  for (const key in payload) {
    const value = payload[key];
    types[key] = getTypes(value, extraTypeMappings);
  }

  return types;
}

/**
 * Returns an un-commented jsdoc typedef string
 * @param {Schema} payload
 * @param {string} currentIndent
 *
 * @return {string}
 */
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

/**
 * Wraps a JSDoc typedef string as a comment
 * @param {string} name
 * @param {string} description
 * @param {string} typeString
 *
 * @returns {string}
 */
function wrapAsComment(name, description, typeString) {
  const descriptionLines = description.split("\n");
  let comment = "/**";
  descriptionLines.forEach((line) => {
    comment += `\n * ${line}`;
  });
  comment += "\n * @typedef {";

  const lines = typeString.split("\n");
  comment += lines[0];
  lines.slice(1).forEach((line) => {
    comment += `\n * ${line}`;
  });

  comment += `} ${name}\n */`;
  return comment;
}

/**
 * Generates typedef comments for a payload, and all of the
 * subtypes included in extraTypeMappings
 * @param {string} name
 * @param {string} description
 * @param {Object} payload
 * @param {{[TypeName: string]: TypeSummary}} extraTypeMappings
 *
 * @returns {string}
 */
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

  stringTypes.forEach((typeName) => {
    const subTypeComment = wrapAsComment(
      typeName,
      extraTypeMappings[typeName].description,
      "string"
    );
    comment += `\n\n${subTypeComment}`;
  });

  objTypes.forEach((typeName) => {
    const subTypeComment = wrapAsComment(
      typeName,
      extraTypeMappings[typeName].description,
      getTypeString(extraTypeMappings[typeName].type)
    );
    comment += `\n\n${subTypeComment}`;
  });

  return comment;
}

/**
 * Determines if a given object comforms to a type definition
 * @param {Object} obj
 * @param {Schema} type A fully hydrated schema
 */
function isOfType(obj, type) {
  const objType = getTypes(obj);
  try {
    assert.deepStrictEqual(objType, type);
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Takes a schema that includes subtypes and returns a schema
 * that includes only primitive values.
 * @param {Schema} payload
 * @param {{[TypeName: string]: TypeSummary}} extraMappings
 *
 * @returns {Schema}
 */
function hydrate(payload, extraMappings = {}) {
  const objTypes = Object.keys(extraMappings).filter(
    (t) => extraMappings[t].type
  );
  const stringTypes = Object.keys(extraMappings).filter(
    (t) => extraMappings[t].regex
  );

  const type = typeof payload;
  if (type === "string" && objTypes.includes(payload)) {
    const otherTypes = Object.assign({}, extraMappings);
    delete otherTypes[payload];
    return hydrate(extraMappings[payload].type, otherTypes);
  } else if (type === "string" && stringTypes.includes(payload)) {
    return "string";
  }

  if (type !== "object") {
    return payload;
  } else if (Array.isArray(payload)) {
    return payload.map((elem) => hydrate(elem, extraMappings));
  }

  const types = {};
  for (const key in payload) {
    const value = payload[key];
    types[key] = hydrate(value, extraMappings);
  }

  return types;
}

module.exports = {
  getTypes,
  getTypeString,
  wrapAsComment,
  typedef,
  isOfType,
  hydrate,
};
