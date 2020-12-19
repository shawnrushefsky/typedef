const {
  getTypeString,
  getTypes,
  wrapAsComment,
  isOfType,
  typedef,
  hydrate
} = require("./index");
const fs = require('fs');
const path = require('path');
const { expect } = require('chai');

const pullRequest = require("./fixtures/pull_request.json");
const prTypes = fs.readFileSync(path.join(__dirname, 'fixtures', 'pr-typedefs.js'), 'utf-8').trim();

describe("typedef", () => {
  it("infers a @typedef comment from a parsed JSON payload", () => {
    const URI = { 
      regex: /^https?:\/\//, 
      description: "A fully qualified URL" 
    }
    const User = {
      type: getTypes(pullRequest.user, {URI}),
      description: "A GitHub User Object"
    };
    const DateTime = {
      regex: /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z/,
      description: "A ISO 8601 compliant datetime. YYYY-MM-DDTHH:MM:SSZ",
    };
    const Label = { 
      type: getTypes(pullRequest.labels[0], { URI }), 
      description: "A GitHub Label Object" 
    };
    const Team = {
      type: getTypes(pullRequest.requested_teams[0], { URI }),
      description: "A GitHub Team Object"
    };
    const Milestone = {
      type: getTypes(pullRequest.milestone, { User, URI, DateTime }),
      description: "A GitHub Milestone Object",
    };
    const Repository = {
      type: getTypes(pullRequest.base.repo, { User, URI, DateTime }),
      description: "A GitHub Repository Object",
    };
    const comment = typedef(
      "PullRequest",
      "A GitHub Pull Request Object",
      pullRequest,
      { User, URI, DateTime, Label, Team, Milestone, Repository }
    );

    expect(comment).to.equal(prTypes);
  }).timeout(20000);
});
