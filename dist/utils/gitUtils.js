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
Object.defineProperty(exports, "__esModule", { value: true });
exports.commitAndPush = exports.push = exports.commit = exports.checkout = void 0;
const core = __importStar(require("@actions/core"));
const exec_1 = require("@actions/exec");
const EXEC_OPTIONS = {
    cwd: process.env.GITHUB_WORKSPACE,
    listeners: {
        stdline: core.debug,
        stderr: core.error,
        debug: core.debug,
    },
};
const REMOTE_TAG = 'github';
/**
 * Checkout branch
 * @param branch
 */
function checkout(branch) {
    return __awaiter(this, void 0, void 0, function* () {
        yield exec_1.exec('git', ['checkout', branch], EXEC_OPTIONS);
    });
}
exports.checkout = checkout;
/**
 * Commit changes
 * @param options
 */
function commit(options) {
    return __awaiter(this, void 0, void 0, function* () {
        const { GITHUB_ACTOR, GITHUB_REPOSITORY } = process.env, ORIGIN = `https://${GITHUB_ACTOR}:${options.token}@github.com/${GITHUB_REPOSITORY}.git`;
        // Configure git
        yield exec_1.exec('git', ['config', 'user.name', `"${options.userName}"`], EXEC_OPTIONS);
        yield exec_1.exec('git', ['config', 'user.email', `"${options.userEmail}"`], EXEC_OPTIONS);
        // Add remote
        yield exec_1.exec('git', ['remote', 'add', REMOTE_TAG, ORIGIN], EXEC_OPTIONS);
        // Add all new modifications and deletions
        yield exec_1.exec('git', ['add', '-u'], EXEC_OPTIONS);
        // Commit all staged changes
        yield exec_1.exec('git', ['commit', '-v', '-m', `"${options.message}"`], EXEC_OPTIONS);
        // Tag the commit if tag info is passed
        if (options.tag) {
            let { name, message } = options.tag;
            yield exec_1.exec('git', ['tag', '-a', name, '-m', (message || '')]);
        }
    });
}
exports.commit = commit;
/**
 * Push to remote
 * @param branch
 */
function push(branch) {
    return __awaiter(this, void 0, void 0, function* () {
        yield exec_1.exec('git', ['push', REMOTE_TAG, branch], EXEC_OPTIONS);
    });
}
exports.push = push;
function commitAndPush(options) {
    return __awaiter(this, void 0, void 0, function* () {
        yield commit(options);
        yield push(options.branch);
    });
}
exports.commitAndPush = commitAndPush;
