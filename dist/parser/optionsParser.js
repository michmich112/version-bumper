"use strict";
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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const readline = __importStar(require("readline"));
const regExpParser_1 = require("./regExpParser");
/**
 * returns top content inside square brackets.
 * @param content
 */
function getIntrabracketContent(content) {
    let bracketContent = content.split('').reduce((pre, cur) => {
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
    normalizeOptions(options);
    return regExpParser_1.generateSchemeRegexp(options.customScheme);
}
exports.getSchemeRegex = getSchemeRegex;
/**
 * Normalizes options by associating the scheme if user has selected a preset scheme
 * @param options
 */
function normalizeOptions(options) {
    let semanticScheme = "major.minor[.build]";
    if (options.scheme === "semantic" && options.customScheme !== semanticScheme)
        options.customScheme = semanticScheme;
    else if (options.scheme === "custom" && !options.customScheme)
        throw new Error("Custom Scheme must be specified in the options file");
}
exports.normalizeOptions = normalizeOptions;
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
        let { path, line } = options.versionFile, regExp = getSchemeRegex(options);
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
 * Extracts the items to bump based on the trigger and the branch
 * The branch is set as the destination branch for pr requests
 * @param options
 * @param trigger
 * @param branch
 */
function getBumpItems(options, trigger, branch) {
    let bumpItems = new Set();
    for (let rule of options.rules) {
        const triggerMatch = rule.trigger === trigger, branchMatch = rule.branch ? branch.match(rule.branch) : true;
        if (triggerMatch && branchMatch) {
            // Add the bump items if the trigger and branch match
            if (rule.bump && Array.isArray(rule.bump))
                rule.bump.forEach((br) => bumpItems.add(br));
            else if (rule.bump)
                bumpItems.add(rule.bump);
        }
    }
    return [...bumpItems.values()];
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
    let resetItems = new Set();
    for (let rule of options.rules) {
        const triggerMatch = rule.trigger === trigger, branchMatch = rule.branch ? branch.match(rule.branch) : true;
        if (triggerMatch && branchMatch) {
            // Add the bump items if the trigger and branch match
            if (rule.reset && Array.isArray(rule.reset))
                rule.reset.forEach((br) => resetItems.add(br));
            else if (rule.reset)
                resetItems.add(rule.reset);
        }
    }
    return [...resetItems.values()];
}
exports.getResetItems = getResetItems;
/**
 * Returns key value object of version item and its value.
 * @param options
 * @param version
 */
function getVersionMap(options, version) {
    normalizeOptions(options);
    let versionValues = version.split(/[.,;:\-_><]+/g).filter((tag) => tag !== ""), // get version numbers for all tags
    tags = options.customScheme.split(/[.,;:\-_><\]\[]+/g).filter((tag) => tag !== ""), map = tags.reduce((pre, cur) => {
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
 * Returns a string from the scheme with the correct values for each item
 * @param options
 * @param map
 */
function versionMapToString(options, map) {
    normalizeOptions(options);
    let optional = getOptional(options.customScheme), opKeys = Object.keys(optional), orderedItems = options.customScheme.split(/[.,;:\-_><\]\[]+/g).filter((tag) => tag !== ""), version = options.customScheme.replace(/[\[\]]+/g, ''), //remove the optional brackets
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
        // console.log(bumpItems);
        let versionMap = getVersionMap(options, curVersion);
        for (let item of resetItems)
            versionMap[item] = 0;
        for (let item of bumpItems)
            versionMap[item] += 1;
        // console.log(versionMap);
        return versionMapToString(options, versionMap);
    });
}
exports.bumpVersion = bumpVersion;
