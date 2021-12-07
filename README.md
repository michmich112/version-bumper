# Version Bumper
Github action that automatically bumps versions in selected files based on versioning scheme and rules.

Please create an issue if you have found a bug or wish for additional functionality.

## Example Usage
With options file
```yaml
name: Manage versions

on: [push]

jobs:
  bump:
    runs-on: ubuntu-latest
   
    steps:
      # Checkout action is required
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v1
        with:
          node-version: '12'
      - name: Bump Versions
        uses: michmich112/version-bumper@master
        with:
          options-file: './examples/example-options-full.json'
          github-token: ${{ secrets.GITHUB_TOKEN }}
```

Without options file

```yaml
name: Manage versions

on: [push]

jobs:
  bump:
    runs-on: ubuntu-latest
   
    steps:
      # Checkout action is required
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v1
        with:
          node-version: '12'
      - name: Bump Versions
        uses: michmich112/version-bumper@master
        with:
          scheme: semantic
          version-file: "./package.json"
          files: >
            [
              "./package-lock.json"
            ] 
          rules: >
            [{
              "trigger":"commit",
              "branch": "staging",
              "suffix": "-beta",
              "bump":"build"
            },{
              "trigger": "commit",
              "branch": "main",
              "suffix": "-rc",
              "bump": "minor",
              "tag": true
            }, {
              "trigger":"commit",
              "branch":"release",
              "bump":"major",
              "tag": true,
              "reset":["minor","build"]
            }]'
          github-token: ${{ secrets.GITHUB_TOKEN }}
```

## Configuration
### Inputs/Parameters
| Parameter       | Required  |
|-----------------|-----------|
| `options-file`  | false     |
| `github-token`  | true      |
| `scheme`        | true      |
| `custom-scheme` | false     |
| `skip`          | false     |
| `version-file`  | true      |
| `files`         | true      |
| `rules`         | true      |


### `options-file` (Optional)
File path to the options file containing run options. The options file must be JSON.

Example usage:
```yaml
options-file: './.github/version-bumper-options.json'
```

### `github-token` (Required)
Required github token used for committing version updates.

Example usage:
```yaml
# Action workflow provides a secret with a pre-authenticated token
github-token: ${{ secrets.GITHUB_TOKEN }}
```

***
> Note: The following inputs are only required if they are not present in the options file or if you have not specified 
> an options file. Workflow inputs will be used over options in the options file.

### `scheme` (Required)
Versioning scheme to use. Predefined schemes are:

| Scheme       | Definition          |
|--------------|---------------------|
| semantic     | major.minor[.build] |
| org_semantic | major.minor.build   |

Submit an issue to request additional predefined schemes.

You can define a custom scheme by using the `custom` scheme. 

### `custom-scheme` (Optional)
Custom scheme to use. Required if scheme is `custom`.

Schemes are defined with tags (e.g. major) separated by 
one or more separators: `.,;:-_><`.\
Example: `main.secondary->patch`\
You can make elements optional by wrapping them in brackets.\
Example: `main.secondary[->patch]`.\
If we have `main:1`, `secondary:0` ,`patch:0` the resulting version printout will be `1.0`.\
If `patch:1` the resulting version printout will be `1.0->1`.


### `skip` (Optional)
Adds [SKIP] prefix to the commit message to prevent CI/CD build.

### `version-file` (Required)
File path where the current version can be found.

Example usages:
``` yaml
# First match will be used as the version. Both versions are equivalent
version-file: "./package.json"
version-file: "{'path':'./package.json'}"

# Will use the match found on line 3
# Fallback to initial match if no match is found on specified line
# must be in stringified JSON form
version-file: "{'path':'./package.json', 'line':3}"
```

### `files` (Required)
Files where version should be updated. Must be a JSON stringified array. Searches for a match of the current version at 
at the specified line (if applicable).
No need to add the version-file.\
Example usages:
``` yaml
# First match will be used as the version except if line number is passed.
files: >
  [
    "./file1.json", 
    {"path":"./file2.txt"}, 
    {"path":"./file3.yaml", "line":5}
  ]

# No additional files
files: '[]'
```

### `rules` (Required)
Version update rules: a JSON stringified array of bumping rules objects.\
Rule type definition:
```typescript
/**
 * Predefine a rule for bumping version numbers based on:
 * - trigger :
 *      - commit: new commit on branch,
 *      - pull request: new pull request on branch,
 * - branch : branch regex which should trigger the rule
 */
interface BumpRule {
    /**
     * Optional branch on which the rule should take effect
     * if no branch is passed the rule will take effect on every branch which triggers the workflow
     */
    branch?: string,

    /**
     * What items in the version number need to be bumped
     * precisely matches the tag items
     */
    bump?: string | string[],

    /**
     * Prefix to apply on the new version
     */
    prefix?: string,

    /**
     * Reset elements in the version number
     * E.g
     * With version desc = major.minor[.build] -> current: 1.2.3
     * set reset: ['build']
     * => 1.2.0
     */
    reset?: string | string[]
    
    /**
     * Indicate that this bump should add a tag to the commit with the new version number
     * If multiple rules match the current run, only one of them needs to allow the tag for it to take effect
     */
    tag?: boolean,

    /**
     * Action that triggers the bump to occur
     *    - commit: new commit on branch (includes the creation of a new branch),
     *    - pull request: new pull request on branch,
     *    - manual: trigger the workflow manually using workflow_dispatch
     * Note: your workflow must accept the 'push' event for the commit trigger and 'pull_request' event for pull-request trigger
     * Note: your workflow must accept the 'workflow_dispatch' event to use the manual trigger
     */
    trigger: 'commit' | 'pull-request' | 'manual',

    /**
     * Suffix to apply on the new version
     */
    suffix?: string,
}
``` 
Example usage:
```yaml
# for semantic versioning i.e. scheme = major.minor[.build]
# {"trigger":"commit","bump":"build"} -> bump the build tag on every commit on any branch
# {"trigger": "commit", "branch": "master", "bump":"minor", "reset":"build"} -> bump minor and reset build on every commit to master
# {"trigger":"commit","branch":"release","bump":"major", "reset":["minor","build"]} -> bump major on any commit to branch "release" and reset minor and build
rules: >
  [{
    "trigger":"commit",
    "bump":"build"
  }, {
    "trigger": "commit", 
    "branch": "master",
    "bump":"minor", 
    "reset":"build"
  }, {
    "trigger":"commit",
    "branch":"release",
    "bump":"major",
    "reset":["minor","build"]
  }]
```


## Options
You can find an example options file [here](https://github.com/michmich112/version-bumper/tree/master/examples/example-options-full.json)
The options file has the following available options:
```typescript
interface BumperOptionsFile {
    
    // the scheme chosen, 
    // use 'custom' to use a custom scheme
    scheme: string,  
    
    // use for custom scheme definitions
    schemeDefinition?: string,

    // Add the [SKIP] prefix to skip build
    skip?: boolean,
    
    // path file containing the current version
    // may include line if other possible matches
    versionFile: string | {path: string, line:number},

    // Array of paths to files containing the version to update
    // may include line if other possible matches
    files: ( string | {path: string, line:number} )[],

    // Array of rule objects
    rules: BumpRule[]
}

interface BumpRule {

    /**
     * Optional branch on which the rule should take effect
     */
    branch?: string,

    /**
     * What items in the version number need to be bumped
     */
    bump?: string | string[],
  
    /**
     * Prefix to apply on the new version
     */
    prefix?: string,

    /**
     * Reset elements in the version number
     * E.g
     * With version desc = major.minor[.build] -> current: 1.2.3
     * set reset: ['build']
     * => 1.2.0
     */
    reset?: string | string[],
  
    /**
     * Suffix to apply on the new version
     */
    suffix?: string,

    /**
     * Indicate that this bump should add a tag to the commit with the new version number
     * If multiple rules match the current run, only one of them needs to allow the tag for it to take effect
     */
    tag?: boolean,

    /**
     * Action that triggers the bump to occur
     */
    trigger: 'commit' | 'pull-request' | 'manual',

}
```

# Contributors
Thank you to 
- [jamieleecho](https://github.com/jamieleecho)
- [migueltarga](https://github.com/migueltarga)
- [MarkIannucci](https://github.com/MarkIannucci)

for their help and contributions to the project!

# Notes
This action uses the `gh-action-stats` package to track usage. See the data collected at [gh-action-stats-js](https://github.com/michmich112/gh-action-stats-js).
