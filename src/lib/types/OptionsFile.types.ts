/**
 * Data definition for the Options file
 */
export default interface BumperOptionsFile {
    scheme: VersionScheme,
    schemeDefinition?: string,
    versionFile: VersionFile,
    files: (VersionFile | string)[],
    rules: BumpRule[]
}

/**
 * Data necessary to find locate the version file and extract the current version
 */
export interface VersionFile {
    /**
     * Relative path to the version file
     * path is relative to project root
     * must be complete path with filename and extension
     */
    path: string,

    /**
     * Accessor that the program looks for to find the current version number
     * If omitted regex based on the scheme will be used to find the version
     */
    line?: number
}

/*export interface VersionFileOptions {
    /!**
     * File path to the file that hold the version info that needs to be bumped
     * Path is relative to project root.
     * Must be complete path with filename and extension
     *!/
    filepath: string,

    /!**
     * Accessor(s) used to identify where to find where the version number is located in the file.
     * If Omitted, defaults to using the user's regex to locate the accessor
     *!/
    accessor?: string[]

    /!**
     * User defined regex used to find the accessor(s) in the file that show where to find the current location of the variable
     * If Omitted defaults to the algorithms predefined finding process:
     *  1. blindly searches for the current version in the project and replaces them. if none found defaults to 2
     *  2. blindly searches for the $[bump-version] accessor and replaces it with the current version number. If none found, skips the file
     *!/
    regex?: string
}*/

/**
 * Predefine a rule for bumping version numbers based on:
 * - trigger :
 *      - commit: new commit on branch,
 *      - pull request: new pull request on branch,
 *      - comment: predefined comment on Pull request
 * - branch : branch regex which should trigger the rule
 */
export interface BumpRule {
    /**
     * Action that triggers the bump to occur
     */
    trigger: RuleTrigger,

    /**
     * Comment that triggers the rule
     * Only used when the trigger is pr-comment
     */
    comment?: string,

    /**
     * Allows the bumper to create a commit tag for the bump
     */
    tag?: boolean,

    /**
     * Optional branch on which the rule should take effect
     * This is a regexp and can be matched with a wildcard
     */
    branch?: string,

    /**
     * What items in the version number need to be bumped
     */
    bump?: string | string[],

    /**
     * Bump the version status
     * E.g. bump the version to be a release candidate when there is a pull request into master
     */
    bumpStatus?: VersionReleaseStatus

    /**
     * Reset elements in the version number
     * E.g
     * With version desc = major.minor[.build] -> current: 1.2.3
     * set reset: ['build']
     * => 1.2.0
     */
    reset?: string | string[]
}

export type VersionScheme = 'custom' | any;
export type RuleTrigger = 'commit' | 'pull-request' | 'pr-comment' | 'manual';
export type VersionReleaseStatus = 'alpha' | 'beta' | 'release-candidate' | 'release';
export type Seperators = '.' | ',' | ';' | ':' | '-' | '_' | '>' | '<';
export const seperators: Seperators[] = ['.' , ',' , ';' , ':' , '-' , '_' , '>' , '<'];

/**
 * String status names:
 *  - a : alpha
 *  - b : beta
 *  - rc: release candidate
 *  - r : release
 */
export type StrStatus = 'a' | 'b' | 'rc' | 'r';
