function getTypes(payload) {
  const type = typeof payload;
  if (type !== 'object') {
    return type;
  } else if (payload === null) {
    return '( string | null )';
  }
  if (!Array.isArray(payload)) {
    const types = {};
    for (const key in payload) {
      const value = payload[key]
      types[key] = typeof value;
      if (typeof value === 'object') {
        if (Array.isArray(value)) {
          types[key] = value.map(getTypes);
        } else if (value === null) {
          types[key] = '( string | null )';
        } else {
          types[key] = getTypes(value);
        }
      }
    }

    return types;
  } else {
    return payload.map(getTypes);
  }
}

function getTypeString(payload, currentIndent = '') {
  if (typeof payload === 'string') {
    return payload;
  } else if (!Array.isArray(payload)) {
    let comment = '{';
    for (let key in payload) {
      comment += `\n${currentIndent + '  '}${key}: ${getTypeString(payload[key], currentIndent + '  ')}`;
    }
    return `${comment}\n${currentIndent}}`
  } else {
    return `Array<${getTypeString[payload[0]]}>`;
  }
}

module.exports = { 
  getTypes,
  getTypeString
};