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
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBumperState = exports.getTrigger = exports.normalizeFiles = exports.getSkipOption = exports.getFiles = exports.getBumperOptions = exports.getDestBranchFromTrigger = exports.getBranchFromTrigger = exports.getSchemeDefinition = exports.normalizeOptions = void 0;
const definedSchemes = __importStar(require("../schemes.json"));
const utils_1 = require("./utils");
const core = __importStar(require("@actions/core"));
const github = __importStar(require("@actions/github"));
const fs = __importStar(require("fs"));
/**
 * Normalizes options by associating the scheme if user has selected a preset scheme
 * @param options
 */
function normalizeOptions(options) {
    try {
        options.schemeDefinition = getSchemeDefinition(options);
    }
    catch (e) {
        console.error(e.message);
        throw e; // rethrow to stop process
    }
}
exports.normalizeOptions = normalizeOptions;
/**
 * Gets the scheme definitions from the Bumper Options
 * @param options
 */
function getSchemeDefinition(options) {
    let definedSchemesNames = Object.keys(definedSchemes);
    // verify that its not custom and preset
    if (options.scheme !== "custom" && definedSchemesNames.indexOf(options.scheme) !== -1)
        return definedSchemes[options.scheme];
    // Throw error if scheme is not defined
    else if (options.scheme !== "custom" && definedSchemesNames.indexOf(options.scheme) === -1) {
        throw new Error(`Scheme ${options.scheme} is not defined.`);
    }
    else if (options.scheme === "custom" && (!options.schemeDefinition || options.schemeDefinition.trim() === "")) {
        throw new Error(`Custom scheme has no definition. Scheme Definition must be specified in options`);
    }
    else if (!options.schemeDefinition || options.schemeDefinition.trim() === "") {
        throw new Error(`Custom scheme has no definition. Scheme Definition must be specified in options`);
    }
    else {
        return options.schemeDefinition;
    }
}
exports.getSchemeDefinition = getSchemeDefinition;
/**
 * Get Branch name from reference
 * Only tested with the GITHUB_REF env var
 * @param trigger
 */
function getBranchFromTrigger(trigger) {
    var _a;
    let branch;
    switch (trigger) {
        case 'pull-request':
            branch = process.env.GITHUB_HEAD_REF || '';
            break;
        case 'commit':
        case 'manual':
        default:
            branch = ((_a = process.env.GITHUB_REF) === null || _a === void 0 ? void 0 : _a.substring('refs/heads/'.length)) || '';
            break;
    }
    core.info(`process.env.GITHUB_BASE_REF ${process.env.GITHUB_BASE_REF}`);
    core.info(`process.env.GITHUB_HEAD_REF: ${process.env.GITHUB_HEAD_REF}`);
    core.info(`process.env.GITHUB_REF: ${process.env.GITHUB_REF}`);
    core.info(`Current Branch identified: ${branch}`);
    return branch;
}
exports.getBranchFromTrigger = getBranchFromTrigger;
/**
 * Get the destination branch for an action,
 * this is principally used for pull requests to match head and base refs
 * @param trigger {RuleTrigger}
 * @returns {string}
 */
function getDestBranchFromTrigger(trigger) {
    var _a;
    let branch;
    switch (trigger) {
        case 'pull-request':
            branch = process.env.GITHUB_BASE_REF || '';
            break;
        case 'commit':
        case 'manual':
        default:
            branch = ((_a = process.env.GITHUB_REF) === null || _a === void 0 ? void 0 : _a.substring('refs/heads/'.length)) || '';
            break;
    }
    return branch;
}
exports.getDestBranchFromTrigger = getDestBranchFromTrigger;
/**
 * Get all bumper options
 */
function getBumperOptions() {
    return __awaiter(this, void 0, void 0, function* () {
        const optionsFile = core.getInput('options-file');
        const scheme = core.getInput('scheme');
        const skip = core.getInput('skip');
        const customScheme = core.getInput('custom-scheme');
        const versionFile = core.getInput('version-file');
        const files = core.getInput('files');
        const rules = core.getInput('rules');
        const username = core.getInput('username');
        const email = core.getInput('email');
        let error = ""; // error message
        let bumperOptions = {};
        let err = (message) => {
            console.error(message);
            error += message + '\n';
        };
        if (optionsFile && !fs.existsSync(optionsFile)) {
            console.warn(`Options file with path ${optionsFile} does not exist`);
            // error += `Options file with path ${optionsFile} does not exist\n`;
        }
        else if (optionsFile && fs.existsSync(optionsFile)) {
            try {
                bumperOptions = JSON.parse(yield fs.readFileSync(optionsFile, { encoding: 'utf8', flag: 'r' }));
            }
            catch (e) {
                console.warn(`Error reading or parsing bumper options file with path ${optionsFile}\n${e}`);
            }
        }
        if (scheme)
            bumperOptions.scheme = scheme;
        else if (!scheme && (!bumperOptions.hasOwnProperty('scheme')
            || !bumperOptions.scheme
            || bumperOptions.scheme.trim() === "")) {
            err("Scheme is not defined in option file or workflow input.");
        }
        if (customScheme && customScheme.trim() !== "") {
            bumperOptions.scheme = "custom";
            bumperOptions.schemeDefinition = customScheme;
        }
        try {
            bumperOptions.schemeDefinition = getSchemeDefinition(bumperOptions);
        }
        catch (e) {
            err(e);
        }
        if (versionFile && versionFile.trim() !== '') {
            try {
                bumperOptions.versionFile = JSON.parse(versionFile);
            }
            catch (e) {
                // console.log(e.message);
                bumperOptions.versionFile = { path: versionFile };
            }
        }
        else if (!bumperOptions.hasOwnProperty('versionFile')
            || !bumperOptions.versionFile
            || bumperOptions.versionFile.trim() === "") {
            err("Version file is not defined in option file or workflow input.");
        }
        else {
            bumperOptions.versionFile = normalizeFiles([bumperOptions.versionFile])[0];
        }
        if (files && files.trim() !== '') {
            try {
                const filesArray = JSON.parse(files);
                if (!Array.isArray(filesArray)) {
                    err("Files should be in array stringified JSON format");
                }
                else
                    bumperOptions.files = normalizeFiles([bumperOptions.versionFile, ...filesArray]);
            }
            catch (e) {
                err("Files not in JSON format");
            }
        }
        else if (!bumperOptions.hasOwnProperty('files')
            || !bumperOptions.files
            || !Array.isArray(bumperOptions.files)) {
            err("Files are not defined in option file or workflow input.");
        }
        else
            bumperOptions.files = normalizeFiles([bumperOptions.versionFile, ...bumperOptions.files]);
        if (rules && rules.trim() !== '') {
            try {
                const rulesArray = JSON.parse(rules);
                if (!Array.isArray(rulesArray)) {
                    err("Rules should be in array stringified JSON format");
                }
                else
                    bumperOptions.rules = rulesArray;
            }
            catch (e) {
                err("Rules not in JSON format");
            }
        }
        else if (!bumperOptions.hasOwnProperty('rules')
            || !bumperOptions.rules
            || !Array.isArray(bumperOptions.rules)) {
            err("Rules are not defined in option file or workflow input.");
        }
        if (skip)
            bumperOptions.skip = skip;
        if (username)
            bumperOptions.username = username;
        if (email)
            bumperOptions.email = email;
        if (error !== "")
            throw new Error(error);
        else {
            console.log(JSON.stringify(bumperOptions));
            return bumperOptions;
        }
    });
}
exports.getBumperOptions = getBumperOptions;
/**
 * Get the version files in a consistent format
 * @param options {VersionFile[]}
 */
function getFiles(options) {
    return normalizeFiles(options.files);
}
exports.getFiles = getFiles;
/**
 * Check if should add [SKIP] prefix
 * @param options {skip}
 */
function getSkipOption(options) {
    return options.skip || false;
}
exports.getSkipOption = getSkipOption;
/**
 * Normalize the file format
 * @param files
 */
function normalizeFiles(files) {
    let filez = {};
    for (let file of files) {
        if (typeof file === 'object') // VersionFile
            filez[file.path] = file.line;
        else
            filez[file] = undefined;
    }
    return Object.keys(filez).reduce((pre, cur) => [...pre,
        filez[cur] ? { path: cur, line: filez[cur] } : { path: cur }], []);
}
exports.normalizeFiles = normalizeFiles;
/**
 * Gets the trigger event.
 * Valid trigger events:
 *  - push: [created]
 *  - pull_request: any
 *  - pull_request_review_comment: any
 *  - workflow_dispatch: any
 */
function getTrigger() {
    let { eventName, payload } = github.context;
    const payload_action = payload.action;
    console.info(`Trigger -> ${eventName} - ${payload_action}`);
    switch (eventName) {
        case 'push':
            return 'commit';
        case 'pull_request':
            if (payload_action === "opened")
                return 'pull-request';
            if (payload_action === "synchronize")
                return 'pull-request-sync';
            return 'pull-request-other';
        // case 'pull_request_review_comment':
        //   return 'pr-comment';
        case 'workflow_dispatch':
            return 'manual';
        default:
            console.warn("Event trigger not of type: commit, pull request or manual.");
            throw new Error("Invalid trigger event");
    }
}
exports.getTrigger = getTrigger;
/**
 * Get state variables
 * @param options
 */
function getBumperState(options) {
    return __awaiter(this, void 0, void 0, function* () {
        const trigger = getTrigger(), branch = getBranchFromTrigger(trigger), destBranch = getDestBranchFromTrigger(trigger), skip = getSkipOption(options), schemeRegExp = (0, utils_1.getSchemeRegex)(options), schemeDefinition = getSchemeDefinition(options), curVersion = yield (0, utils_1.getCurVersion)(options), tag = (0, utils_1.getTag)(options, trigger, branch, destBranch), newVersion = yield (0, utils_1.bumpVersion)(options, trigger, branch, destBranch), files = getFiles(options);
        const state = {
            curVersion,
            newVersion,
            skip,
            schemeRegExp,
            schemeDefinition,
            tag,
            trigger,
            branch,
            destBranch,
            files
        };
        core.info(`State -> ${JSON.stringify(state)}`);
        return state;
    });
}
exports.getBumperState = getBumperState;
