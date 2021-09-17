"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const isRuleApplicable_1 = __importDefault(require("../isRuleApplicable"));
describe('[ RULE ] - isRuleApplicable', () => {
    test('it should match if the trigger and the branch both match exactly', () => {
        const rule = {
            trigger: 'commit',
            branch: 'test'
        };
        const trigger = 'commit';
        const branch = 'test';
        expect((0, isRuleApplicable_1.default)(rule, trigger, branch)).toBe(true);
    });
    test('it should match if the trigger matches exactly and the branch is absent', () => {
        const rule = {
            trigger: 'commit',
        };
        const trigger = 'commit';
        const branch = 'anyRandomBranch';
        expect((0, isRuleApplicable_1.default)(rule, trigger, branch)).toBe(true);
    });
    test('it should not match if the trigger matches but only part of the branch name matches', () => {
        const rule = {
            trigger: 'commit',
            branch: 'important-test'
        };
        const trigger = 'commit';
        const branch = 'test';
        expect((0, isRuleApplicable_1.default)(rule, trigger, branch)).toBe(false);
    });
    test('it should match if the trigger matches and the branch name is a matching regexp', () => {
        const rule = {
            trigger: 'commit',
            branch: 'release-?\\d{0,3}'
        };
        const trigger = 'commit';
        const branch1 = 'release-001';
        const branch2 = 'release69'; // nice
        const branch3 = 'release';
        const branch4 = 'releases';
        expect((0, isRuleApplicable_1.default)(rule, trigger, branch1)).toBe(true);
        expect((0, isRuleApplicable_1.default)(rule, trigger, branch2)).toBe(true);
        expect((0, isRuleApplicable_1.default)(rule, trigger, branch3)).toBe(true);
        expect((0, isRuleApplicable_1.default)(rule, trigger, branch4)).toBe(false);
    });
    test('it should not match if the trigger does not match', () => {
        const rule = {
            trigger: 'commit',
        };
        const trigger = 'manual';
        const branch = 'randomBranch';
        expect((0, isRuleApplicable_1.default)(rule, trigger, branch)).toBe(false);
    });
});
