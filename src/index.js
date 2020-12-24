const assert = require("assert").strict;

/**
 * @typedef {{
 * description: string,
 * match: ( RegExp | undefined),
 * schema: ( Schema | undefined)
 * }} TypeSummary
 */

/**
 * @typedef {Object} Schema
 */

const schemaDefaults = {
  schemas: {},
};

/**
 * Returns a schema object from a JSON serializable object
 * @param {Object} payload Any JSON-serializable object
 * @param {Object} options
 * @param {{[TypeName: string]: TypeSummary}} options.schemas
 *
 * @returns {Schema}
 */
function getSchema(payload, options = {}) {
  options = { ...schemaDefaults, ...options };
  const { schemas } = options;
  const type = typeof payload;
  const stringTypes = Object.keys(schemas).filter((t) => schemas[t].match);
  const objTypes = Object.keys(schemas).filter((t) => schemas[t].schema);

  /**
   * Cache the fully hydrated schema for each type.
   * This provides a substantial performance improvement.
   */
  objTypes
    .filter((typeName) => !schemas[typeName].hydrated)
    .forEach(
      (typeName) =>
        (schemas[typeName].hydrated = hydrate(schemas[typeName].schema, {
          schemas,
        }))
    );

  /**
   * Identify special string types
   */
  if (type === "string") {
    for (const typeName of stringTypes) {
      if (schemas[typeName].match.test(payload)) {
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
    return [getSchema(payload[0], { schemas })];
  }

  /**
   * Identify special object types
   */
  for (const typeName of objTypes) {
    if (isOfType(payload, schemas[typeName].hydrated)) {
      return typeName;
    }
  }

  /**
   * Recursively get types for all fields in the payload
   */
  const types = {};
  Object.keys(payload).forEach((key) => {
    types[key] = getSchema(payload[key], { schemas });
  });

  return types;
}

/**
 * Returns an un-commented jsdoc typedef string
 * @param {Schema} payload
 * @param {string} currentIndent
 *
 * @return {string}
 */
function serializeSchema(payload, currentIndent = "") {
  if (typeof payload === "string") {
    return payload;
  } else if (!Array.isArray(payload)) {
    let comment = "{";
    for (const key in payload) {
      comment += `\n${currentIndent + "  "}${key}: ${serializeSchema(
        payload[key],
        currentIndent + "  "
      )}`;
    }
    return `${comment}\n${currentIndent}}`;
  } else {
    return `Array<${serializeSchema(payload[0], currentIndent)}>`;
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
function wrapAsTypedefComment(name, description, typeString) {
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

const serializeDefaults = {
  schemas: {},
};

/**
 * Generates typedef comments for a payload, and all of the
 * subtypes included in extraTypeMappings
 * @param {string} name
 * @param {string} description
 * @param {Object} payload
 * @param {Object} options
 * @param {{[TypeName: string]: TypeSummary}} options.schemas
 *
 * @returns {string}
 */
function serialize(name, description, payload, options = {}) {
  options = { ...serializeDefaults, ...options };
  const { schemas } = options;
  let comment = wrapAsTypedefComment(
    name,
    description,
    serializeSchema(getSchema(payload, { schemas }))
  );

  const stringTypes = Object.keys(schemas).filter((t) => schemas[t].match);
  const objTypes = Object.keys(schemas).filter((t) => schemas[t].schema);

  stringTypes.forEach((typeName) => {
    const subTypeComment = wrapAsTypedefComment(
      typeName,
      schemas[typeName].description,
      "string"
    );
    comment += `\n\n${subTypeComment}`;
  });

  objTypes.forEach((typeName) => {
    const subTypeComment = wrapAsTypedefComment(
      typeName,
      schemas[typeName].description,
      serializeSchema(schemas[typeName].schema)
    );
    comment += `\n\n${subTypeComment}`;
  });

  return comment;
}

/**
 * Determines if a given object comforms to a type definition
 * @param {Object} obj
 * @param {Schema} schema A fully hydrated schema
 */
function isOfType(obj, schema) {
  const objSchema = getSchema(obj);
  try {
    assert.deepStrictEqual(objSchema, schema);
    return true;
  } catch (e) {
    return false;
  }
}

const hydrateDefaults = {
  schemas: {},
};

/**
 * Takes a schema that includes subtypes and returns a schema
 * that includes only primitive values.
 * @param {Schema} payload
 * @param {Object} options
 * @param {{[TypeName: string]: TypeSummary}} options.schemas
 *
 * @returns {Schema}
 */
function hydrate(payload, options = {}) {
  options = { ...hydrateDefaults, ...options };
  const { schemas } = options;
  const objTypes = Object.keys(schemas).filter((t) => schemas[t].schema);
  const stringTypes = Object.keys(schemas).filter((t) => schemas[t].match);

  const type = typeof payload;
  if (type === "string" && objTypes.includes(payload)) {
    const otherTypes = Object.assign({}, schemas);
    delete otherTypes[payload];
    return hydrate(schemas[payload].schema, { schemas: otherTypes });
  } else if (type === "string" && stringTypes.includes(payload)) {
    return "string";
  }

  if (type !== "object") {
    return payload;
  } else if (Array.isArray(payload)) {
    return payload.map((elem) => hydrate(elem, { schemas }));
  }

  const types = {};
  for (const key in payload) {
    const value = payload[key];
    types[key] = hydrate(value, { schemas });
  }

  return types;
}

function deserialize(comment) {
  const schemas = {};
  const commentRegex = /\/\*\*\s+\*\s+(?<description>.*?)\s+\*\s+@typedef\s+{(?<type>.*?)}\s+(?<typeName>\w+)\s+\*\//gms;

  let matches;
  while ((matches = commentRegex.exec(comment))) {
    const { description, type, typeName } = matches.groups;
    schemas[typeName] = { description, schema: getSchemaFromType(type) };
  }

  return schemas;
}

function getSchemaFromType(rawTypeString) {
  if (rawTypeString.toLowerCase() === "string") {
    return "string";
  } else {
    return parseObjectString(getObjectString(rawTypeString));
  }
}

function getObjectString(rawTypeString) {
  return rawTypeString
    .replace(/{\s+/g, "{")
    .replace(/\s*\*?\s*}/g, "}")
    .replace(/\n/g, ",")
    .replace(/[\s\*]/g, "");
}


function parseObjectString(objString) {
  const arrayType = /array<(?<type>\w+)>/i;
  const result = {};
  let buffer = "";
  let key;
  let stack = [];
  let currentNode;
  for (let i = 1; i < objString.length; i++) {
    const char = objString[i];
    currentNode = getNode(result, stack);
    switch (char) {
      case ":":
        key = buffer;
        buffer = "";
        break;
      case ",":
        const match = arrayType.exec(buffer);
        if (match) {
          const { type } = match.groups;
          currentNode[key] = [type];
        } else if (buffer) {
          currentNode[key] = buffer;
        }
        buffer = "";
        break;
      case "{":
        stack.push(key);
        currentNode[key] = {};
        buffer = "";
        break;
      case "}":
        if (buffer) {
          currentNode[key] = buffer;
        }
        stack.pop();
        buffer = "";
        break;
      default:
        buffer += char;
        break;
    }
  }

  return result;
}

function getNode(obj, stack) {
  let currentNode = obj;
  stack.forEach((key) => {
    currentNode = currentNode[key];
  });

  return currentNode;
}

module.exports = {
  getSchema,
  serializeSchema,
  wrapAsTypedefComment,
  serialize,
  deserialize,
  isOfType,
  hydrate,
};
