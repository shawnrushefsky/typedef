/**
 * A GitHub Pull Request Object
 * @typedef {{
 *   url: URI
 *   id: number
 *   node_id: string
 *   html_url: URI
 *   diff_url: URI
 *   patch_url: URI
 *   issue_url: URI
 *   commits_url: URI
 *   review_comments_url: URI
 *   review_comment_url: URI
 *   comments_url: URI
 *   statuses_url: URI
 *   number: number
 *   state: string
 *   locked: boolean
 *   title: string
 *   user: User
 *   body: string
 *   labels: Array<Label>
 *   milestone: Milestone
 *   active_lock_reason: string
 *   created_at: DateTime
 *   updated_at: DateTime
 *   closed_at: DateTime
 *   merged_at: DateTime
 *   merge_commit_sha: string
 *   assignee: User
 *   assignees: Array<User>
 *   requested_reviewers: Array<User>
 *   requested_teams: Array<Team>
 *   head: {
 *     label: string
 *     ref: string
 *     sha: string
 *     user: User
 *     repo: Repository
 *   }
 *   base: {
 *     label: string
 *     ref: string
 *     sha: string
 *     user: User
 *     repo: Repository
 *   }
 *   _links: {
 *     self: {
 *       href: URI
 *     }
 *     html: {
 *       href: URI
 *     }
 *     issue: {
 *       href: URI
 *     }
 *     comments: {
 *       href: URI
 *     }
 *     review_comments: {
 *       href: URI
 *     }
 *     review_comment: {
 *       href: URI
 *     }
 *     commits: {
 *       href: URI
 *     }
 *     statuses: {
 *       href: URI
 *     }
 *   }
 *   author_association: string
 *   draft: boolean
 *   merged: boolean
 *   mergeable: boolean
 *   rebaseable: boolean
 *   mergeable_state: string
 *   merged_by: User
 *   comments: number
 *   review_comments: number
 *   maintainer_can_modify: boolean
 *   commits: number
 *   additions: number
 *   deletions: number
 *   changed_files: number
 * }} PullRequest
 */

/**
 * A fully qualified URL
 * @typedef {string} URI
 */

/**
 * A ISO 8601 compliant datetime. YYYY-MM-DDTHH:MM:SSZ
 * @typedef {string} DateTime
 */

/**
 * A GitHub User Object
 * @typedef {{
 *   login: string
 *   id: number
 *   node_id: string
 *   avatar_url: URI
 *   gravatar_id: string
 *   url: URI
 *   html_url: URI
 *   followers_url: URI
 *   following_url: URI
 *   gists_url: URI
 *   starred_url: URI
 *   subscriptions_url: URI
 *   organizations_url: URI
 *   repos_url: URI
 *   events_url: URI
 *   received_events_url: URI
 *   type: string
 *   site_admin: boolean
 * }} User
 */

/**
 * A GitHub Label Object
 * @typedef {{
 *   id: number
 *   node_id: string
 *   url: URI
 *   name: string
 *   description: string
 *   color: string
 *   default: boolean
 * }} Label
 */

/**
 * A GitHub Team Object
 * @typedef {{
 *   id: number
 *   node_id: string
 *   url: URI
 *   html_url: URI
 *   name: string
 *   slug: string
 *   description: string
 *   privacy: string
 *   permission: string
 *   members_url: URI
 *   repositories_url: URI
 * }} Team
 */

/**
 * A GitHub Milestone Object
 * @typedef {{
 *   url: URI
 *   html_url: URI
 *   labels_url: URI
 *   id: number
 *   node_id: string
 *   number: number
 *   state: string
 *   title: string
 *   description: string
 *   creator: User
 *   open_issues: number
 *   closed_issues: number
 *   created_at: DateTime
 *   updated_at: DateTime
 *   closed_at: DateTime
 *   due_on: DateTime
 * }} Milestone
 */

/**
 * A GitHub Repository Object
 * @typedef {{
 *   id: number
 *   node_id: string
 *   name: string
 *   full_name: string
 *   owner: User
 *   private: boolean
 *   html_url: URI
 *   description: string
 *   fork: boolean
 *   url: URI
 *   archive_url: URI
 *   assignees_url: URI
 *   blobs_url: URI
 *   branches_url: URI
 *   collaborators_url: URI
 *   comments_url: URI
 *   commits_url: URI
 *   compare_url: URI
 *   contents_url: URI
 *   contributors_url: URI
 *   deployments_url: URI
 *   downloads_url: URI
 *   events_url: URI
 *   forks_url: URI
 *   git_commits_url: URI
 *   git_refs_url: URI
 *   git_tags_url: URI
 *   git_url: string
 *   issue_comment_url: URI
 *   issue_events_url: URI
 *   issues_url: URI
 *   keys_url: URI
 *   labels_url: URI
 *   languages_url: URI
 *   merges_url: URI
 *   milestones_url: URI
 *   notifications_url: URI
 *   pulls_url: URI
 *   releases_url: URI
 *   ssh_url: string
 *   stargazers_url: URI
 *   statuses_url: URI
 *   subscribers_url: URI
 *   subscription_url: URI
 *   tags_url: URI
 *   teams_url: URI
 *   trees_url: URI
 *   clone_url: URI
 *   mirror_url: string
 *   hooks_url: URI
 *   svn_url: URI
 *   homepage: URI
 *   language: ( string | null )
 *   forks_count: number
 *   stargazers_count: number
 *   watchers_count: number
 *   size: number
 *   default_branch: string
 *   open_issues_count: number
 *   topics: Array<string>
 *   has_issues: boolean
 *   has_projects: boolean
 *   has_wiki: boolean
 *   has_pages: boolean
 *   has_downloads: boolean
 *   archived: boolean
 *   disabled: boolean
 *   pushed_at: DateTime
 *   created_at: DateTime
 *   updated_at: DateTime
 *   permissions: {
 *     admin: boolean
 *     push: boolean
 *     pull: boolean
 *   }
 *   allow_rebase_merge: boolean
 *   temp_clone_token: string
 *   allow_squash_merge: boolean
 *   allow_merge_commit: boolean
 *   forks: number
 *   open_issues: number
 *   license: {
 *     key: string
 *     name: string
 *     url: URI
 *     spdx_id: string
 *     node_id: string
 *   }
 *   watchers: number
 * }} Repository
 */
