#! /usr/bin/bash

URI='{"URI":{"match":"^https?:\/\/", "description":"A fully qualified URL"}}'
DATETIME='{"DateTime":{"match":"^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}Z$","description":"A ISO 8601 compliant datetime. YYYY-MM-DDTHH:MM:SSZ"}}'
USER=$(cat test/fixtures/pull_request.json | jq .user | typedef --name User --description "A GitHub User Object" --json -x "${URI}")
LABEL=$(cat test/fixtures/pull_request.json | jq .labels[0] | typedef --name Label --description "A GitHub Label Object" --json -x "${URI}")
TEAM=$(cat test/fixtures/pull_request.json | jq .requested_teams[0] | typedef --name Team --description "A GitHub Team Object" --json -x "${URI}")
MILESTONE=$(cat test/fixtures/pull_request.json | jq .milestone | typedef --name Milestone --description "A GitHub Milestone Object" --json -x "${URI}" -x "${USER}" -x "${DATETIME}")
REPOSITORY=$(cat test/fixtures/pull_request.json | jq .base.repo | typedef --name Repository --description "A GitHub Repository Object" --json -x "${URI}" -x "${USER}" -x "${DATETIME}")

cat test/fixtures/pull_request.json | typedef \
--name PullRequest \
--description "A GitHub Pull Request Object" \
-x "${URI}" \
-x "${DATETIME}" \
-x "${USER}" \
-x "${LABEL}" \
-x "${TEAM}" \
-x "${MILESTONE}" \
-x "${REPOSITORY}" \
> types.js