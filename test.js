const { getTypeString, getTypes, wrapAsComment, isOfType, typedef } = require("./index");

const pullRequest = require("./fixtures/pull_request.json");

describe("typedef", () => {
  it("infers a @typedef comment from a parsed JSON payload", () => {
    // const comment = typedef('PullRequest', 'A GitHub Pull Request Object', pullRequest);
    // console.log(comment);
    // console.log(
    //   wrapAsComment(
    //     "PullRequest",
    //     "A GitHub Pull Request Object",
    //     getTypeString(getTypes(pullRequest))
    //   )
    // );

    const user = getTypes(pullRequest.user);
    const extraMappings = {
      User: { type: user, description: 'A GitHub User Object'},
    };
    const label = getTypes(pullRequest.labels[0]);
    const team = getTypes(pullRequest.requested_teams[0]);
    const milestone = getTypes(pullRequest.milestone, extraMappings);
    const repo = getTypes(pullRequest.base.repo, extraMappings);
    extraMappings.Label= { type: label, description: 'A GitHub Label Object'};
    extraMappings.Team = { type: team, description: 'A GitHub Team Object'};
    extraMappings.Milestone = { type: milestone, description: 'A GitHub Milestone Object'}
    extraMappings.Repository = { type: repo, description: 'A GitHub Repository Object'};
    const comment = typedef('PullRequest', 'A GitHub Pull Request Object', pullRequest, extraMappings);

    console.log(comment);
  }).timeout(10000);
});
