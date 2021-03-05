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
});
