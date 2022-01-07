import BumperOptionsFile, { BumpRule, RuleTrigger } from "../lib/types/OptionsFile.types";
import * as fs from "fs";
import * as readline from "readline";
import { generateSchemeRegexp } from "./regExpParser";
import { getTrigger, normalizeOptions } from "./options";
import isRuleApplicable from '../rules/isRuleApplicable';


/**
 * Verifies that the trigger event is acceptable
 */
export function verifyTrigger(): boolean {
  try {
    getTrigger();
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Gets the content inside brackets (1st level)
 * returns top content inside square brackets.
 * @param content
 */
export function getIntrabracketContent(content: string): string[] | null {
  const bracketContent = content.split('')
    .reduce((pre: { open: number, index: number, content: string[] }, cur: string) => {
      if (cur === '[') pre = {
        ...pre,
        open: pre.open + 1,
        content: pre.open === 0 ? [...pre.content, ""] : [...pre.content]
      };
      else if (cur === ']') pre = {
        open: pre.open - 1,
        index: pre.open === 1 ? pre.index + 1 : pre.index,
        content: pre.content.filter((val: string) => val !== "")
      };
      if (pre.open > 0 && !(cur === '[' && pre.open === 1)) pre.content[pre.index] += cur;
      return pre;
    }, { open: 0, index: 0, content: [] }).content;
  return bracketContent.length > 0 ? bracketContent : null;
}

/**
 * Extract the proper regex from specified scheme (semantic or custom)
 * @param options
 */
export function getSchemeRegex(options: BumperOptionsFile) {
  normalizeOptions(options);
  return generateSchemeRegexp(options.schemeDefinition!);
}

/**
 * Adds prefix and suffix recognition to version scheme regex
 * only one prefix and one suffix will be detected maximally
 * result of the form: (prefix1|prefix2)?<scheme regExp>(suffix1|suffix2)?
 * @param {RegExp} schemeRegExp
 * @param {BumperOptionsFile} options
 * @returns {RegExp}
 */
function addPrefixAndSuffixRecognition(schemeRegExp: RegExp, options: BumperOptionsFile): RegExp {
  const prefixes = "(" + getPrefixes(options).map(p => escapeRegExp(p)).join('|') + ")?"; // (<prefixes>)?
  const suffixes = "(" + getSuffixes(options).map(s => escapeRegExp(s)).join('|') + ")?"; // (<suffixes>)?
  return new RegExp(prefixes + schemeRegExp.source + suffixes);
}

/**
 * escapes the chars in a string that are regexp wildcards
 * @param string
 */
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

/**
 * Extracts the current version form the specified version file using the following strategy:
 *  - if user has specified a line number -> got to that line while identifying the initial match
 *  - if the version is found on the specified line return it.
 *  - if no version is found on the specified line, return the initial match if not continue through the file until a match is found.
 *  TL;DR: returns the version found on the specified line or the first match found.
 * @param options
 */
export async function getCurVersion(options: BumperOptionsFile) {
  let { path, line } = options.versionFile;

  const schemeRegExp = getSchemeRegex(options);
  console.info("scheme regExp: ", schemeRegExp);
  const regExp = addPrefixAndSuffixRecognition(schemeRegExp, options);
  console.info("final regExp: ", regExp);

  // verify the path actually corresponds to a file
  if (!fs.existsSync(path)) throw new Error(`Version file with path ${path} does not exist.`);

  const rl = readline.createInterface({ input: fs.createReadStream(path), crlfDelay: Infinity });
  let counter = 1,
    initialMatch: string | undefined;

  for await (const ln of rl) {
    const match = ln.match(regExp);
    if (!initialMatch && match !== null) initialMatch = match[0]; // set the initial match
    if (!line && initialMatch) { // return straight away if line is not specified
      console.log(`Match found line ${counter} -> ${initialMatch}`);
      return initialMatch;
    }
    // if the user has specified a line number we go all the way to it
    if (line && counter === line) {
      if (match !== null) {
        console.log(`Found scheme match line ${counter} -> ${match[0]}`);
        return match[0];
      } else {
        console.log(`No match found for specified scheme on specified line ${line}.`);
        if (initialMatch) {
          console.log(`Using previous found match: ${initialMatch}`);
          return initialMatch;
        } else console.log(`No match found previously. Continuing file search.`);
      }
    } else if (line && counter > line && initialMatch) {
      console.log(`Match found line ${counter} -> ${initialMatch}`);
      return initialMatch;
    }
    counter++; // increment line counter
  }
  throw new Error(`No match found in file. Unable to identify current version number.`);
}

/**
 * Get a list of all the rules that are applicable for the current trigger and branch
 * @param {BumperOptionsFile} options
 * @param {RuleTrigger} trigger
 * @param {string} branch
 * @param {string} destBranch destination branch (different if the trigger is a pull request)
 * @returns {BumpRule[]}
 */
export function getRules(options: BumperOptionsFile, trigger: RuleTrigger, branch: string, destBranch?: string): BumpRule[] {
  return options.rules.filter((rule: BumpRule) => isRuleApplicable(rule, trigger, branch, destBranch));
}

/**
 * Extracts the items to bump based on the trigger and the branch
 * The branch is set as the destination branch for pr requests
 * @param rules {BumpRule[]} applicable rules for the current execution context
 */
export function getBumpItems(rules: BumpRule[]): string[] {
  return [...new Set(
    rules.map((rule: BumpRule) => rule.bump ? Array.isArray(rule.bump) ? rule.bump : [rule.bump] : [])
      .reduce((pre: string[], cur: string[]) => [...pre, ...cur], [])
  )];
}

/**
 * Extracts the items to reset based on the trigger and the branch
 * The branch is set as the destination branch for pr requests
 * @param rules {BumpRule[]} applicable rules for the current execution context
 */
export function getResetItems(rules: BumpRule[]): string[] {
  return [...new Set(
    rules.map((rule: BumpRule) => rule.reset ? Array.isArray(rule.reset) ? rule.reset : [rule.reset] : [])
      .reduce((pre: string[], cur: string[]) => [...pre, ...cur], [])
  )];
}

/**
 * finds the first prefix definition int he applicable rules and returns it
 * @param {BumpRule[]} rules
 * @returns {BumpRule | undefined}
 */
function getApplicablePrefix(rules: BumpRule[]): string {
  return rules.find(r => r.prefix)?.prefix ?? '';
}

/**
 * finds the first suffix definition in the applicable rules and returns it
 * @param {BumpRule[]} rules
 * @returns {BumpRule | undefined}
 */
function getApplicableSuffix(rules: BumpRule[]): string {
  return rules.find(r => r.suffix)?.suffix ?? '';
}

/**
 * Find whether or not the commit should be tagged or not
 * @param {BumperOptionsFile} options
 * @param {RuleTrigger} trigger
 * @param {string} branch
 * @param {string} destBranch
 * @returns {boolean}
 */
export function getTag(options: BumperOptionsFile, trigger: RuleTrigger, branch: string, destBranch: string): boolean {
  const rules = getRules(options, trigger, branch, destBranch);
  return rules.reduce((pre: boolean, cur: BumpRule) => pre || (cur.tag || false), false);
}

/**
 * Returns key value object of version item and its value.
 * @param options
 * @param version
 */
export function getVersionMap(options: BumperOptionsFile, version: string): { [index: string]: number } {
  normalizeOptions(options);
  let versionValues: string[] = version.split(/[.,;:\-_><]+/g).filter((tag: string) => tag !== ""), // get version numbers for all tags
    tags: string[] = options.schemeDefinition!.split(/[.,;:\-_><\]\[]+/g).filter((tag: string) => tag !== ""),
    map = tags.reduce((pre: { [index: string]: number }, cur: string) => { // set the map to all zero
      return { ...pre, [cur]: 0 };
    }, {});
  for (let i = 0; i < versionValues.length; i++) { // loop through the version values (takes into account optional values at the end that may not be present)
    map[tags[i]] += +versionValues[i]; // add the current version value to the tag
  }
  return map;
}

/**
 * Get all the optional items from the scheme as an object with the tag as the key and the tag with seperator as a value
 * @param scheme
 */
export function getOptional(scheme: string) {
  // return getOptionalItems(scheme).map(item => item.replace(/[.,;:\-_><]+/g, ''));
  return getOptionalItems(scheme).reduce((pre: any, cur: string) => {
    return { ...pre, [cur.replace(/[.,;:\-_><]+/g, '')]: cur };
  }, {});
}

/**
 * Get all the optional items including separators from the scheme
 * @param scheme
 */
export function getOptionalItems(scheme: string) {
  let optional = getIntrabracketContent(scheme);
  if (optional === null) return [];
  else return optional.reduce((pre: string[], cur: string) => {
    if (getIntrabracketContent(cur)) return [...pre,
    cur.split(/[\[\]]+/g)[0], // cur.split(/[\[\]]+/g)[0] -> get the first item in the interbracket content that corresponds to the tag
    ...getOptionalItems(cur)]; // recursively get optional from the current top level interbracket content
    else return [...pre, cur]; // if there is no other interabracket content then no need to recurse, this is the tag
  }, []);
}

/**
 * Get all the possible prefixes from the rule bumps
 * @param {BumperOptionsFile} options
 * @returns {string[]}
 */
export function getPrefixes(options: BumperOptionsFile): string[] {
  return [...options.rules
    .map(r => r.prefix)
    .reduce((acc: Set<string>, cur?: string) => cur ? acc.add(cur) : acc, new Set<string>())];
}

/**
 * Get all the possible suffixes from the rule bumps
 * @param {BumperOptionsFile} options
 * @returns {string[]}
 */
export function getSuffixes(options: BumperOptionsFile): string[] {
  return [...options.rules
    .map(r => r.suffix)
    .reduce((acc: Set<string>, cur?: string) => cur ? acc.add(cur) : acc, new Set<string>())];
}

/**
 * Returns a string from the scheme with the correct values for each item
 * @param options
 * @param map
 */
export function versionMapToString(options: BumperOptionsFile, map: { [index: string]: number }) {
  normalizeOptions(options);
  let optional = getOptional(options.schemeDefinition!),
    opKeys = Object.keys(optional),
    orderedItems = options.schemeDefinition!.split(/[.,;:\-_><\]\[]+/g).filter((tag: string) => tag !== ""),
    version = options.schemeDefinition!.replace(/[\[\]]+/g, ''), //remove the optional brackets

    // flags if the tags can be omitted if optional (goes from the back to the front. If the backmost tag is not 0 then it cant be omitted and all that follow must also be put
    // e.g. if the scheme is major[.minor][.build],
    //  - if build is 0 it can be omitted,
    //  - if minor and build are both 0 they can both be omitted,
    //  - if build is not 0 then minor must be put even if it is 0
    mandatory = false;

  for (let i = (orderedItems.length - 1); i >= 0; i--) { // from back to front as optional values will be found at the back
    let tag = orderedItems[i];
    if (opKeys.indexOf(tag) !== -1 && !mandatory && map[tag] === 0) // if optional and not mandatory and 0
      version = version.replace(optional[tag], ''); // removes the tag and the separator by using the value from the getOptional method
    else if (opKeys.indexOf(tag) !== -1 && !mandatory && map[tag] !== 0) { // if optional amd not mandatory but not 0
      mandatory = true; // all following must be put
      version = version.replace(tag, map[tag].toString());
    } else if (opKeys.indexOf(tag) === -1 && !mandatory) { // if not optional and not mandatory
      mandatory = true; // all following must be put
      version = version.replace(tag, map[tag].toString()); // replace tag name with value
    } else {
      version = version.replace(tag, map[tag].toString()); // replace tag name with value
    }

  }
  return version;
}

/**
 * Using the rules and/or trigger, bump the current version to the new version
 * @param options
 * @param trigger
 * @param branch
 */
export async function bumpVersion(options: BumperOptionsFile, trigger: RuleTrigger, branch: string, destBranch?: string): Promise<string> {
  const curVersion: string = await getCurVersion(options);
  const rules: BumpRule[] = getRules(options, trigger, branch, destBranch);
  const resetItems: string[] = getResetItems(rules);
  const bumpItems: string[] = getBumpItems(rules);
  const prefix: string = getApplicablePrefix(rules);
  const suffix: string = getApplicableSuffix(rules);
  const versionMap = getVersionMap(options, curVersion);

  for (let item of resetItems) versionMap[item] = 0; // reset items
  for (let item of bumpItems) versionMap[item] += 1; // bump items

  return prefix + versionMapToString(options, versionMap) + suffix;
}
