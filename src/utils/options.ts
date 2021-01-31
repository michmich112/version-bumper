import BumperOptionsFile, { BumpRule, RuleTrigger, VersionFile } from "../lib/types/OptionsFile.types";
import * as definedSchemes from "../schemes.json";
import BumperState from "../lib/types/BumperState.type";
import { bumpVersion, getCurVersion, getSchemeRegex, getTag } from "./utils";

import * as core from '@actions/core';
import * as github from '@actions/github';
import * as fs from "fs";


/**
 * Normalizes options by associating the scheme if user has selected a preset scheme
 * @param options
 */
export function normalizeOptions(options: BumperOptionsFile) {
  try {
    options.schemeDefinition = getSchemeDefinition(options);
  } catch (e) {
    console.error(e.message);
    throw e; // rethrow to stop process
  }
}

/**
 * Gets the scheme definitions from the Bumper Options
 * @param options
 */
export function getSchemeDefinition(options: BumperOptionsFile): string {
  let definedSchemesNames = Object.keys(definedSchemes);
  // verify that its not custom and preset
  if (options.scheme !== "custom" && definedSchemesNames.indexOf(options.scheme) !== -1)
    return definedSchemes[options.scheme];
  // Throw error if scheme is not defined
  else if (options.scheme !== "custom" && definedSchemesNames.indexOf(options.scheme) === -1) {
    throw new Error(`Scheme ${options.scheme} is not defined.`);
  } else if (options.scheme === "custom" && (!options.schemeDefinition || options.schemeDefinition.trim() === "")) {
    throw new Error(`Custom scheme has no definition. Scheme Definition must be specified in options`);
  } else if (!options.schemeDefinition || options.schemeDefinition.trim() === "") {
    throw new Error(`Custom scheme has no definition. Scheme Definition must be specified in options`);
  } else {
    return options.schemeDefinition;
  }
}

/**
 * Get Branch name from reference
 * @param ref
 */
export function getBranchFromRef(ref: string): string {
  const refPath = ref.split('/');
  return refPath[refPath.length - 1]; // last string in the ref is the branch name
}

/**
 * Get all bumper options
 */
export async function getBumperOptions(): Promise<BumperOptionsFile> {
  const optionsFile = core.getInput('options-file'),
    scheme = core.getInput('scheme'),
    customScheme = core.getInput('custom-scheme'),
    versionFile = core.getInput('version-file'),
    files = core.getInput('files'),
    rules = core.getInput('rules');
  let error = ""; // error message
  let bumperOptions: any = {};
  let err = (message: string) => {
    console.error(message);
    error += message + '\n';
  };

  if (optionsFile && !fs.existsSync(optionsFile)) {
    console.warn(`Options file with path ${optionsFile} does not exist`);
    // error += `Options file with path ${optionsFile} does not exist\n`;
  } else if (optionsFile && fs.existsSync(optionsFile)) {
    try {
      bumperOptions = JSON.parse(await fs.readFileSync(optionsFile, { encoding: 'utf8', flag: 'r' }));
    } catch (e) {
      console.warn(`Error reading or parsing bumper options file with path ${optionsFile}\n${e}`);
    }
  }

  if (scheme) bumperOptions.scheme = scheme;
  else if (!scheme && (!bumperOptions.hasOwnProperty('scheme')
    || !bumperOptions.scheme
    || (bumperOptions.scheme as string).trim() === "")) {
    err("Scheme is not defined in option file or workflow input.");
  }

  if (customScheme && customScheme.trim() !== "") {
    bumperOptions.scheme = "custom";
    bumperOptions.schemeDefinition = customScheme;
  }
  try {
    bumperOptions.schemeDefinition = getSchemeDefinition(bumperOptions);
  } catch (e) {
    err(e);
  }

  if (versionFile && versionFile.trim() !== '') {
    try {
      bumperOptions.versionFile = JSON.parse(versionFile);
    } catch (e) {
      // console.log(e.message);
      bumperOptions.versionFile = { path: versionFile };
    }
  } else if (!bumperOptions.hasOwnProperty('versionFile')
    || !bumperOptions.versionFile
    || (bumperOptions.versionFile as string).trim() === "") {
    err("Version file is not defined in option file or workflow input.");
  } else {
    bumperOptions.versionFile = normalizeFiles([bumperOptions.versionFile])[0];
  }

  if (files && files.trim() !== '') {
    try {
      const filesArray = JSON.parse(files);
      if (!Array.isArray(filesArray)) {
        err("Files should be in array stringified JSON format");
      } else bumperOptions.files = normalizeFiles([bumperOptions.versionFile, ...filesArray]);
    } catch (e) {
      err("Files not in JSON format");
    }
  } else if (!bumperOptions.hasOwnProperty('files')
    || !bumperOptions.files
    || !Array.isArray(bumperOptions.files)) {
    err("Files are not defined in option file or workflow input.");
  } else bumperOptions.files = normalizeFiles([bumperOptions.versionFile, ...bumperOptions.files]);

  if (rules && rules.trim() !== '') {
    try {
      const rulesArray = JSON.parse(rules);
      if (!Array.isArray(rulesArray)) {
        err("Rules should be in array stringified JSON format");
      } else bumperOptions.rules = rulesArray as BumpRule[];
    } catch (e) {
      err("Rules not in JSON format");
    }
  } else if (!bumperOptions.hasOwnProperty('rules')
    || !bumperOptions.rules
    || !Array.isArray(bumperOptions.rules)) {
    err("Rules are not defined in option file or workflow input.");
  }

  if (error !== "") throw new Error(error);
  else {
    console.log(JSON.stringify(bumperOptions));
    return bumperOptions as BumperOptionsFile;
  }
}

/**
 * Get the version files in a consistent format
 * @param options {VersionFile[]}
 */
export function getFiles(options: BumperOptionsFile): VersionFile[] {
  return normalizeFiles(options.files);
}

/**
 * Normalize the file format
 * @param files
 */
export function normalizeFiles(files: (VersionFile | string)[]): VersionFile[] {
  let filez = {};
  for (let file of files) {
    if (typeof file === 'object')  // VersionFile
      filez[(file as VersionFile).path] = (file as VersionFile).line;
    else
      filez[file] = undefined;
  }
  return Object.keys(filez).reduce((pre: VersionFile[], cur: string) => [...pre,
    filez[cur] ? { path: cur, line: filez[cur] } : { path: cur }], []);
}

/**
 * Gets the trigger event.
 * Valid trigger events:
 *  - push: [created]
 *  - pull_request: any
 *  - pull_request_review_comment: any
 *  - workflow_dispatch: any
 */
export function getTrigger(): RuleTrigger {
  let { eventName } = github.context;
  console.info(`Trigger -> ${eventName}`);
  switch (eventName) {
    case 'push':
      return 'commit';
    case 'pull_request':
      return 'pull-request';
    case 'pull_request_review_comment':
      return 'pr-comment';
    case 'workflow_dispatch':
      return 'manual';
    default:
      console.warn("Event trigger not of type: commit, pull request or pr-comment.");
      throw new Error("Invalid trigger event");
  }
}

/**
 * Get state variables
 * @param options
 */
export async function getBumperState(options: BumperOptionsFile): Promise<BumperState> {
  const branch = getBranchFromRef(process.env.GITHUB_REF || ''),
    schemeRegExp = getSchemeRegex(options),
    schemeDefinition = getSchemeDefinition(options),
    curVersion = await getCurVersion(options),
    trigger: RuleTrigger = getTrigger(),
    tag: boolean = getTag(options, trigger, branch),
    newVersion = await bumpVersion(options, trigger, branch),
    files = getFiles(options);
  const state = {
    curVersion,
    newVersion,
    schemeRegExp,
    schemeDefinition,
    tag,
    trigger,
    branch,
    files
  };
  console.log(`State -> ${JSON.stringify(state)}`);
  return state;
}
