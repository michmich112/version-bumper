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
const core = __importStar(require("@actions/core"));
const fs = __importStar(require("fs"));
const gh_action_stats_1 = __importDefault(require("gh-action-stats"));
const options_1 = require("./utils/options");
const readline = __importStar(require("readline"));
const gitUtils_1 = require("./utils/gitUtils");
const Git_1 = __importDefault(require("./lib/Git"));
const SUCCESS = 0, FAILURE = 1;
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        gh_action_stats_1.default();
        if (!core.getInput('github-token')) {
            core.error("Github token required");
            return FAILURE;
        }
        try {
            let options = yield options_1.getBumperOptions();
            let state = yield options_1.getBumperState(options);
            if (state.curVersion === state.newVersion) {
                core.info('No bump rules applicable');
                return SUCCESS;
            }
            yield new Git_1.default().checkoutBranch(state.branch);
            yield bump(state);
            const GIT_OPTIONS = {
                userName: 'version-bumper',
                userEmail: 'bumper@boringday.co',
                message: state.skip ? '[SKIP] ' : '' + `Updated version ${state.curVersion} -> ${state.newVersion}.`,
                tag: state.tag ? { name: state.newVersion } : undefined,
                token: core.getInput('github-token'),
                branch: state.branch
            };
            yield gitUtils_1.commitAndPush(GIT_OPTIONS);
            return SUCCESS;
        }
        catch (e) {
            core.error(e.message);
            return FAILURE;
        }
    });
}
function bump(state) {
    return __awaiter(this, void 0, void 0, function* () {
        let { files, curVersion, newVersion } = state;
        let wbArray = []; // write back array
        for (const file of files) {
            try {
                wbArray.push(yield setNewVersion(file, curVersion, newVersion));
            }
            catch (e) {
                core.error(`Error setting new version for file with path ${file.path}`);
                core.error(e.message);
            }
        }
        for (const wb of wbArray) {
            try {
                yield wb();
            }
            catch (e) {
                core.error(`Write back error`);
                core.error(e.message);
            }
        }
    });
}
function setNewVersion(file, curVersion, newVersion) {
    var e_1, _a;
    return __awaiter(this, void 0, void 0, function* () {
        const rl = readline.createInterface({ input: fs.createReadStream(file.path), crlfDelay: Infinity });
        const numMatches = 1;
        let counter = 1, // line counter
        matches = 0, // matches counter
        update = ""; // string representation of the new file with updated version
        if (!fs.existsSync(file.path))
            throw new Error(`File with path ${file.path} cannot be bumped as it cannot be found.`);
        try {
            for (var rl_1 = __asyncValues(rl), rl_1_1; rl_1_1 = yield rl_1.next(), !rl_1_1.done;) {
                let ln = rl_1_1.value;
                if (ln.indexOf(curVersion) !== -1
                    && matches < numMatches && !file.line) {
                    matches += 1;
                    ln = ln.replace(curVersion, newVersion);
                }
                else if (file.line && counter === file.line) {
                    if (ln.indexOf(curVersion) === -1)
                        throw new Error(`Current Version not found on line ${file.line} in file with path ${file.path}.`);
                    matches += 1;
                    ln = ln.replace(curVersion, newVersion);
                }
                update += ln + '\n';
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
        return () => __awaiter(this, void 0, void 0, function* () {
            yield fs.writeFileSync(file.path, update, { encoding: 'utf8', flag: 'w' });
        });
    });
}
main()
    .then(status => status)
    .catch(e => {
    core.error(e);
    return FAILURE;
});
