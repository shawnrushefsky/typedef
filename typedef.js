#! /usr/bin/env node

const { serialize, getSchema } = require("./src/index");
const { docopt } = require("docopt");
const fs = require("fs");
const path = require("path");

const help = `
typedef - a utility for generating jsdoc @typedef comments from json objects

Usage:
  typedef --name=<name> [options] [--extra <typedef>]...

Options:
  -h --help                         Show this screen
  -n --name <name>                  The name of the Type
  -f --file <file>                  Read from a file instead of STDIN
  -o --output <output>              Output to a file instead of STDOUT
  -d --description <description>    A description of the the type
  --json                            Output a JSON representation of the types
  -x --extra <typedef>              Accept a SubType Definition

Example:

  cat pull_request.json | typedef -n PullRequest >> types.js
`;

function run() {
  const options = docopt(help);
  const description =
    options["--description"] ||
    "Generated by shawnrushefsky/typedef\nhttps://github.com/shawnrushefsky/typedef";

  let filepath = options["--file"] || 0;
  let payload;
  try {
    payload = JSON.parse(fs.readFileSync(filepath, "utf8"));
  } catch (e) {
    throw new Error('Payload is not valid JSON');
  }

  const schemas = {};
  options["--extra"].forEach((element) => {
    let parsed;
    try {
      parsed = JSON.parse(element);
    } catch (e) {
      throw new Error(`Input for --extra is not valid JSON: ${element}`);
    }
    const stringTypes = Object.keys(parsed).filter((k) => parsed[k].match);
    stringTypes.forEach(typeName => {
      try {
        parsed[typeName].match = RegExp(parsed[typeName].match);
      } catch (e) {
        throw new Error(`Value for ${typeName}.match could not be processed as a regular expression.`)
      }
    });

    Object.assign(schemas, parsed);
  });

  let comment;
  if (!options["--json"]) {
    comment = serialize(options["--name"], description, payload, { schemas });
  } else {
    comment = JSON.stringify({
      [options["--name"]]: {
        schema: getSchema(payload, { schemas }),
        description: description,
      },
    });
  }

  if (!options["--output"]) {
    console.log(comment);
  } else {
    fs.writeFileSync(path.resolve(options["--output"]), comment);
  }
}

run();
