# Github Actions Stats JS

Javascript packager to get insight on your github action's performance through the GHA-Stats platform.

## Getting Sarted
First, install the package in your project by running

```shell
npm install -S gh-action-stats
```

Then add it to the start of your custom GitHub action as follows:

```javascript
const collectStats = require('gh-action-stats');

collectStats();
```
Now every time your action is used in a workflow you will be able to see the stats.

To collect execution time and errors you will have to wrap your main function in the collectStats function as such:
```javascript
const collectStats = require('gh-action-stats');

/**
 * main function, it must not have any parameters
 * The main function can also be an async function
 */
function main() 
  console.log('This is the best GitHub action!');
}

collectStats(main);
```

Errors thrown in the passed function are still thrown out.

## Local
Stats will only be collected and saved if the `CI` environment variable is set to `true` (as is the case in CI environments including Github actions).
As such local runs where the `CI` environment variable is not set will not collect any data.

## Stats Collected
The following information is collected:
| Variable            | Description                                                                                                                                                                            |
|---------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `GITHUB_RUN_ID`     | A unique number for each run within a repository. This number does not change if your re-run the workflow                                                                              |
| `GITHUB_ACTION`     | The unique identifier (id) of the action (your custom action).                                                                                                                         |
| `GITHUB_ACTOR`      | The name of the person or app that initiated the workflow. For example, `octocat`.                                                                                                     |
| `GITHUB_REPOSITORY` | The owner of the repository name, For example, `octocat/Hello-World`.                                                                                                                  |
| `GITHUB_EVEN_NAME`  | The name of the webhook event tha triggered the workflow.                                                                                                                              |
| `GITHUB_REF`        | The branch or tag ref that triggered the workflow. For example, `refs/heads/feature-branch-1`.If neither a branch or tag is available for the event type, the variable will not exist. |
| `GITHUB_HEAD_REF`   | Only set for pull request events. The name of the head branch.                                                                                                                         |
| `GITHUB_BASE_REF`   | Only set for pull request events. The name of the base branch.                                                                                                                         |
| `RUNNER_NAME`       | The name of the runner executing the job.                                                                                                                                              |
| `RUNNER_OS`         | The operation system of the runner executing the job. Possible values are `Linux`, `Windows`, or `macOS`.                                                                              | 

## Usage Policy
Please make sure you state that you are using this package in your README as to make the users aware of the information collected.

## Notes
This packages is made to work with node 12 or above.

## Todo
- [x] Runtime stats for debugging possible problems in runs.
- [ ] Test on self hosted runners

