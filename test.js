const { getTypeString, getTypes,wrapAsComment } = require('./index');

const pullRequest = require('./fixtures/pull_request.json');

describe('typedef', () => {
  it('infers a @typedef comment from a parsed JSON payload', () => {
    // const comment = typedef('PullRequest', 'A GitHub Pull Request Object', pullRequest);
    // console.log(comment);
    console.log(wrapAsComment('PullRequest', 'A GitHub Pull Request Object', getTypeString(getTypes(pullRequest))));
  })
})

