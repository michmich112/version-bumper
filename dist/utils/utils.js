"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bumpVersion = exports.versionMapToString = exports.getSuffixes = exports.getPrefixes = exports.getOptionalItems = exports.getOptional = exports.getVersionMap = exports.getTag = exports.getResetItems = exports.getBumpItems = exports.getRules = exports.getCurVersion = exports.getSchemeRegex = exports.getIntrabracketContent = exports.verifyTrigger = void 0;
const fs = __importStar(require("fs"));
const readline = __importStar(require("readline"));
const regExpParser_1 = require("./regExpParser");
const options_1 = require("./options");
const isRuleApplicable_1 = __importDefault(require("../rules/isRuleApplicable"));
/**
 * Verifies that the trigger event is acceptable
 */
function verifyTrigger() {
    try {
        options_1.getTrigger();
        return true;
    }
    catch (e) {
        return false;
    }
}
exports.verifyTrigger = verifyTrigger;
/**
 * Gets the content inside brackets (1st level)
 * returns top content inside square brackets.
 * @param content
 */
function getIntrabracketContent(content) {
    const bracketContent = content.split('')
        .reduce((pre, cur) => {
        if (cur === '[')
            pre = Object.assign(Object.assign({}, pre), { open: pre.open + 1, content: pre.open === 0 ? [...pre.content, ""] : [...pre.content] });
        else if (cur === ']')
            pre = {
                open: pre.open - 1,
                index: pre.open === 1 ? pre.index + 1 : pre.index,
                content: pre.content.filter((val) => val !== "")
            };
        if (pre.open > 0 && !(cur === '[' && pre.open === 1))
            pre.content[pre.index] += cur;
        return pre;
    }, { open: 0, index: 0, content: [] }).content;
    return bracketContent.length > 0 ? bracketContent : null;
}
exports.getIntrabracketContent = getIntrabracketContent;
/**
 * Extract the proper regex from specified scheme (semantic or custom)
 * @param options
 */
function getSchemeRegex(options) {
    options_1.normalizeOptions(options);
    return regExpParser_1.generateSchemeRegexp(options.schemeDefinition);
}
exports.getSchemeRegex = getSchemeRegex;
/**
 * Adds prefix and suffix recognition to version scheme regex
 * only one prefix and one suffix will be detected maximally
 * result of the form: (prefix1|prefix2)?<scheme regExp>(suffix1|suffix2)?
 * @param {RegExp} schemeRegExp
 * @param {BumperOptionsFile} options
 * @returns {RegExp}
 */
function addPrefixAndSuffixRecognition(schemeRegExp, options) {
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
function getCurVersion(options) {
    var e_1, _a;
    return __awaiter(this, void 0, void 0, function* () {
        let { path, line } = options.versionFile;
        const schemeRegExp = getSchemeRegex(options);
        console.info("scheme regExp: ", schemeRegExp);
        const regExp = addPrefixAndSuffixRecognition(schemeRegExp, options);
        console.info("final regExp: ", regExp);
        // verify the path actually corresponds to a file
        if (!fs.existsSync(path))
            throw new Error(`Version file with path ${path} does not exist.`);
        const rl = readline.createInterface({ input: fs.createReadStream(path), crlfDelay: Infinity });
        let counter = 1, initialMatch;
        try {
            for (var rl_1 = __asyncValues(rl), rl_1_1; rl_1_1 = yield rl_1.next(), !rl_1_1.done;) {
                const ln = rl_1_1.value;
                const match = ln.match(regExp);
                if (!initialMatch && match !== null)
                    initialMatch = match[0]; // set the initial match
                if (!line && initialMatch) { // return straight away if line is not specified
                    console.log(`Match found line ${counter} -> ${initialMatch}`);
                    return initialMatch;
                }
                // if the user has specified a line number we go all the way to it
                if (line && counter === line) {
                    if (match !== null) {
                        console.log(`Found scheme match line ${counter} -> ${match[0]}`);
                        return match[0];
                    }
                    else {
                        console.log(`No match found for specified scheme on specified line ${line}.`);
                        if (initialMatch) {
                            console.log(`Using previous found match: ${initialMatch}`);
                            return initialMatch;
                        }
                        else
                            console.log(`No match found previously. Continuing file search.`);
                    }
                }
                else if (line && counter > line && initialMatch) {
                    console.log(`Match found line ${counter} -> ${initialMatch}`);
                    return initialMatch;
                }
                counter++; // increment line counter
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (rl_1_1 && !rl_1_1.done && (_a = rl_1.return)) yield _a.call(rl_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        throw new Error(`No match found in file. Unable to identify current version number.`);
    });
}
exports.getCurVersion = getCurVersion;
/**
 * Get a list of all the rules that are applicable for the current trigger and branch
 * @param {BumperOptionsFile} options
 * @param {RuleTrigger} trigger
 * @param {string} branch
 * @returns {BumpRule[]}
 */
function getRules(options, trigger, branch) {
    return options.rules.filter((rule) => isRuleApplicable_1.default(rule, trigger, branch));
}
exports.getRules = getRules;
/**
 * Extracts the items to bump based on the trigger and the branch
 * The branch is set as the destination branch for pr requests
 * @param options
 * @param trigger
 * @param branch
 */
function getBumpItems(options, trigger, branch) {
    const rules = getRules(options, trigger, branch);
    return [...new Set(rules.map((rule) => rule.bump ? Array.isArray(rule.bump) ? rule.bump : [rule.bump] : [])
            .reduce((pre, cur) => [...pre, ...cur], []))];
}
exports.getBumpItems = getBumpItems;
/**
 * Extracts the items to reset based on the trigger and the branch
 * The branch is set as the destination branch for pr requests
 * @param options
 * @param trigger
 * @param branch
 */
function getResetItems(options, trigger, branch) {
    const rules = getRules(options, trigger, branch);
    return [...new Set(rules.map((rule) => rule.reset ? Array.isArray(rule.reset) ? rule.reset : [rule.reset] : [])
            .reduce((pre, cur) => [...pre, ...cur], []))];
}
exports.getResetItems = getResetItems;
/**
 * Find whether or not the commit should be tagged or not
 * @param {BumperOptionsFile} options
 * @param {RuleTrigger} trigger
 * @param {string} branch
 * @returns {boolean}
 */
function getTag(options, trigger, branch) {
    const rules = getRules(options, trigger, branch);
    return rules.reduce((pre, cur) => pre || (cur.tag || false), false);
}
exports.getTag = getTag;
/**
 * Returns key value object of version item and its value.
 * @param options
 * @param version
 */
function getVersionMap(options, version) {
    options_1.normalizeOptions(options);
    let versionValues = version.split(/[.,;:\-_><]+/g).filter((tag) => tag !== ""), // get version numbers for all tags
    tags = options.schemeDefinition.split(/[.,;:\-_><\]\[]+/g).filter((tag) => tag !== ""), map = tags.reduce((pre, cur) => {
        return Object.assign(Object.assign({}, pre), { [cur]: 0 });
    }, {});
    for (let i = 0; i < versionValues.length; i++) { // loop through the version values (takes into account optional values at the end that may not be present)
        map[tags[i]] += +versionValues[i]; // add the current version value to the tag
    }
    return map;
}
exports.getVersionMap = getVersionMap;
/**
 * Get all the optional items from the scheme as an object with the tag as the key and the tag with seperator as a value
 * @param scheme
 */
function getOptional(scheme) {
    // return getOptionalItems(scheme).map(item => item.replace(/[.,;:\-_><]+/g, ''));
    return getOptionalItems(scheme).reduce((pre, cur) => {
        return Object.assign(Object.assign({}, pre), { [cur.replace(/[.,;:\-_><]+/g, '')]: cur });
    }, {});
}
exports.getOptional = getOptional;
/**
 * Get all the optional items including separators from the scheme
 * @param scheme
 */
function getOptionalItems(scheme) {
    let optional = getIntrabracketContent(scheme);
    if (optional === null)
        return [];
    else
        return optional.reduce((pre, cur) => {
            if (getIntrabracketContent(cur))
                return [...pre,
                    cur.split(/[\[\]]+/g)[0],
                    ...getOptionalItems(cur)]; // recursively get optional from the current top level interbracket content
            else
                return [...pre, cur]; // if there is no other interabracket content then no need to recurse, this is the tag
        }, []);
}
exports.getOptionalItems = getOptionalItems;
/**
 * Get all the possible prefixes from the rule bumps
 * @param {BumperOptionsFile} options
 * @returns {string[]}
 */
function getPrefixes(options) {
    return [...options.rules
            .map(r => r.prefix)
            .reduce((acc, cur) => cur ? acc.add(cur) : acc, new Set())];
}
exports.getPrefixes = getPrefixes;
/**
 * Get all the possible suffixes from the rule bumps
 * @param {BumperOptionsFile} options
 * @returns {string[]}
 */
function getSuffixes(options) {
    return [...options.rules
            .map(r => r.suffix)
            .reduce((acc, cur) => cur ? acc.add(cur) : acc, new Set())];
}
exports.getSuffixes = getSuffixes;
/**
 * Returns a string from the scheme with the correct values for each item
 * @param options
 * @param map
 */
function versionMapToString(options, map) {
    options_1.normalizeOptions(options);
    let optional = getOptional(options.schemeDefinition), opKeys = Object.keys(optional), orderedItems = options.schemeDefinition.split(/[.,;:\-_><\]\[]+/g).filter((tag) => tag !== ""), version = options.schemeDefinition.replace(/[\[\]]+/g, ''), //remove the optional brackets
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
        }
        else if (opKeys.indexOf(tag) === -1 && !mandatory) { // if not optional and not mandatory
            mandatory = true; // all following must be put
            version = version.replace(tag, map[tag].toString()); // replace tag name with value
        }
        else {
            version = version.replace(tag, map[tag].toString()); // replace tag name with value
        }
    }
    return version;
}
exports.versionMapToString = versionMapToString;
/**
 * Using the rules and/or trigger, bump the current version to the new version
 * @param options
 * @param trigger
 * @param branch
 */
function bumpVersion(options, trigger, branch) {
    return __awaiter(this, void 0, void 0, function* () {
        const curVersion = yield getCurVersion(options), resetItems = getResetItems(options, trigger, branch), bumpItems = getBumpItems(options, trigger, branch);
        let versionMap = getVersionMap(options, curVersion);
        for (let item of resetItems)
            versionMap[item] = 0; // reset items
        for (let item of bumpItems)
            versionMap[item] += 1; // bump items
        return versionMapToString(options, versionMap);
    });
}
exports.bumpVersion = bumpVersion;
