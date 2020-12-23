const {
  getSchema,
  serialize,
  hydrate,
} = require("../src/index");
const fs = require("fs");
const path = require("path");
const { expect } = require("chai");

const pullRequest = require("./fixtures/pull_request.json");
const prTypes = fs
  .readFileSync(path.join(__dirname, "fixtures", "pr-typedefs.js"), "utf-8")
  .trim();

describe("typedef", () => {
  it("infers a @typedef comment from a parsed JSON payload", () => {
    const URI = {
      regex: /^https?:\/\//,
      description: "A fully qualified URL",
    };
    const User = {
      type: getSchema(pullRequest.user, { URI }),
      description: "A GitHub User Object",
    };
    const DateTime = {
      regex: /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z/,
      description: "A ISO 8601 compliant datetime. YYYY-MM-DDTHH:MM:SSZ",
    };
    const Label = {
      type: getSchema(pullRequest.labels[0], { URI }),
      description: "A GitHub Label Object",
    };
    const Team = {
      type: getSchema(pullRequest.requested_teams[0], { URI }),
      description: "A GitHub Team Object",
    };
    const Milestone = {
      type: getSchema(pullRequest.milestone, { User, URI, DateTime }),
      description: "A GitHub Milestone Object",
    };
    const Repository = {
      type: getSchema(pullRequest.base.repo, { User, URI, DateTime }),
      description: "A GitHub Repository Object",
    };
    const comment = serialize(
      "PullRequest",
      "A GitHub Pull Request Object",
      pullRequest,
      { User, URI, DateTime, Label, Team, Milestone, Repository }
    );

    expect(comment).to.equal(prTypes);
  });
});

describe("hydrate", () => {
  it("reconstructs a type object using only primitive types", () => {
    const URI = {
      regex: /^https?:\/\//,
      description: "A fully qualified URL",
    };
    const User = {
      type: getSchema(pullRequest.user, { URI }),
      description: "A GitHub User Object",
    };
    const DateTime = {
      regex: /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z/,
      description: "A ISO 8601 compliant datetime. YYYY-MM-DDTHH:MM:SSZ",
    };
    const Label = {
      type: getSchema(pullRequest.labels[0], { URI }),
      description: "A GitHub Label Object",
    };
    const Team = {
      type: getSchema(pullRequest.requested_teams[0], { URI }),
      description: "A GitHub Team Object",
    };
    const Milestone = {
      type: getSchema(pullRequest.milestone, { User, URI, DateTime }),
      description: "A GitHub Milestone Object",
    };
    const Repository = {
      type: getSchema(pullRequest.base.repo, { User, URI, DateTime }),
      description: "A GitHub Repository Object",
    };
    const PullRequest = {
      type: getSchema(pullRequest, {
        URI,
        User,
        DateTime,
        Label,
        Team,
        Milestone,
        Repository,
      }),
      description: "A GitHub Pull Request Object",
    };

    const RawPullRequest = {
      type: getSchema(pullRequest),
      description: "A GitHub Pull Request Object",
    };

    const hydrated = hydrate(PullRequest, {
      URI,
      User,
      DateTime,
      Label,
      Team,
      Milestone,
      Repository,
    });

    expect(hydrated).to.deep.equal(RawPullRequest);
  });
});
