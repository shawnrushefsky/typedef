# typedef

This is a utility for generating jsdoc `@typedef` comments based on an input JSON payload.

## Usage

```
typedef - a utility for generating jsdoc @typedef comments from json objects

Usage:
  typedef --name=<name> [options]

Options:
  -h --help                         Show this screen
  -n --name <name>                  The name of the Type
  -f --file <file>                  Read from a file instead of STDIN
  -o --output <output>              Output to a file instead of STDOUT
  -d --description <description>    A description of the the type

Example:

  cat pull_request.json | typedef -n PullRequest >> types.js
```