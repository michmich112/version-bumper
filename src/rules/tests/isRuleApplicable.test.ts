import { BumpRule, RuleTrigger } from '../../lib/types/OptionsFile.types';
import isRuleApplicable from '../isRuleApplicable';

describe('[ RULE ] - isRuleApplicable', () => {
  test('it should match if the trigger and the branch both match exactly', () => {
    const rule: BumpRule = {
      trigger: 'commit',
      branch: 'test'
    };
    const trigger = 'commit';
    const branch = 'test';
    expect(isRuleApplicable(rule, trigger, branch)).toBe(true);
  });

  test('it should match if the trigger matches exactly and the branch is absent', () => {
    const rule: BumpRule = {
      trigger: 'commit',
    };
    const trigger = 'commit';
    const branch = 'anyRandomBranch';
    expect(isRuleApplicable(rule, trigger, branch)).toBe(true);
  });

  test('it should not match if the trigger matches but only part of the branch name matches', () => {
    const rule: BumpRule = {
      trigger: 'commit',
      branch: 'important-test'
    };
    const trigger = 'commit';
    const branch = 'test';
    expect(isRuleApplicable(rule, trigger, branch)).toBe(false);
  });

  test('it should match if the trigger matches and the branch name is a matching regexp', () => {
    const rule: BumpRule = {
      trigger: 'commit',
      branch: 'release-?\\d{0,3}'
    };
    const trigger = 'commit';
    const branch1 = 'release-001';
    const branch2 = 'release69'; // nice
    const branch3 = 'release';
    const branch4 = 'releases';
    expect(isRuleApplicable(rule, trigger, branch1)).toBe(true);
    expect(isRuleApplicable(rule, trigger, branch2)).toBe(true);
    expect(isRuleApplicable(rule, trigger, branch3)).toBe(true);
    expect(isRuleApplicable(rule, trigger, branch4)).toBe(false);
  });

  test('it should not match if the trigger does not match', () => {
    const rule: BumpRule = {
      trigger: 'commit',
    };
    const trigger: RuleTrigger = 'manual';
    const branch = 'randomBranch';
    expect(isRuleApplicable(rule, trigger, branch)).toBe(false);
  });

  test('it should match if destination branch matches and is the only defined', () => {
    const rule: BumpRule = {
      trigger: 'pull-request',
      destBranch: 'master',
    };
    const trigger: RuleTrigger = 'pull-request';
    const branch = 'randomBranch';
    const destBranch = 'master'
    expect(isRuleApplicable(rule, trigger, branch, destBranch)).toBe(true);
  });

  test('it should match if branch matches and is the only defined', () => {
    const rule: BumpRule = {
      trigger: 'pull-request',
      branch: 'feature-branch',
    }
    const trigger: RuleTrigger = 'pull-request';
    const branch = 'feature-branch';
    const destBranch = 'master';
    expect(isRuleApplicable(rule, trigger, branch, destBranch)).toBe(true);
  });

  test('it should match if branch and destination branch matches', () => {
    const rule: BumpRule = {
      trigger: 'pull-request',
      branch: 'feature-branch',
      destBranch: 'master',
    }
    const trigger: RuleTrigger = 'pull-request';
    const branch = 'feature-branch';
    const destBranch = 'master';
    expect(isRuleApplicable(rule, trigger, branch, destBranch)).toBe(true);
  });

  test('it should not match if only branch matches and destination branch does not match', () => {
    const rule: BumpRule = {
      trigger: 'pull-request',
      branch: 'feature-branch',
      destBranch: 'develop',
    }
    const trigger: RuleTrigger = 'pull-request';
    const branch = 'feature-branch';
    const destBranch = 'master';
    expect(isRuleApplicable(rule, trigger, branch, destBranch)).toBe(false);
  });

  test('it should not match if only destBranch matches and destination branch does not match', () => {
    const rule: BumpRule = {
      trigger: 'pull-request',
      branch: 'develop',
      destBranch: 'master',
    }
    const trigger: RuleTrigger = 'pull-request';
    const branch = 'feature-branch';
    const destBranch = 'master';
    expect(isRuleApplicable(rule, trigger, branch, destBranch)).toBe(false);
  });

  test('it should not match if either destBranch nor branch match', () => {
    const rule: BumpRule = {
      trigger: 'pull-request',
      branch: 'develop',
      destBranch: 'release',
    }
    const trigger: RuleTrigger = 'pull-request';
    const branch = 'feature-branch';
    const destBranch = 'master';
    expect(isRuleApplicable(rule, trigger, branch, destBranch)).toBe(false);
  });

  test('it should match if neithere branch nor destBranch are defined', () => {
    const rule: BumpRule = {
      trigger: 'pull-request',
    }
    const trigger: RuleTrigger = 'pull-request';
    const branch = 'feature-branch';
    const destBranch = 'master';
    expect(isRuleApplicable(rule, trigger, branch, destBranch)).toBe(true);
  });
});