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
Object.defineProperty(exports, "__esModule", { value: true });
const regExpParser_1 = require("../utils/regExpParser");
const utils_1 = require("../utils/utils");
describe("Retrieve 1st level interbracket content", () => {
    test("Simple input case: pre[intra content]post", () => {
        let testContent = "pre[intra content]post", intraContent = utils_1.getIntrabracketContent(testContent);
        expect(intraContent).toStrictEqual(["intra content"]);
    });
    test("Diagonal input case: pre[intra1][intra2]post", () => {
        let testContent = "pre[intra1][intra2]post", intraContent = utils_1.getIntrabracketContent(testContent);
        expect(intraContent).toStrictEqual(["intra1", "intra2"]);
    });
    test("Balanced bracket input: pre[intra1[intra2]]pos", () => {
        let testContent = "pre[intra1[intra2]]post", intraContent = utils_1.getIntrabracketContent(testContent);
        expect(intraContent).toStrictEqual(["intra1[intra2]"]);
    });
    test("No bracket input: prepost", () => {
        let testContent = "prepost", intraContent = utils_1.getIntrabracketContent(testContent);
        expect(intraContent).toBe(null);
    });
    test("Empty bracket input: prepost", () => {
        let testContent = "pre[]post", intraContent = utils_1.getIntrabracketContent(testContent);
        expect(intraContent).toBe(null);
    });
});
describe("Generate Regular expression from scheme description", () => {
    describe("General semantic cases: major.minor.build", () => {
        let scheme = 'major.minor.build', genRegExp = regExpParser_1.generateSchemeRegexp(scheme);
        console.log(genRegExp);
        test("it should identify the correct item in the string for a simple input", () => {
            let match = "1.2.3".match(genRegExp);
            expect(match).not.toBe(null);
            expect(match.length).toBe(1);
            expect(match[0]).toBe("1.2.3");
        });
        test("it should identify the correct item in the string for a complex input", () => {
            let match = "test1.2.3test".match(genRegExp);
            expect(match).not.toBe(null);
            expect(match.length).toBe(1);
            expect(match[0]).toBe("1.2.3");
        });
        describe("It should reject: Incorrect inputs", () => {
            test("missing item -> 1.2", () => {
                let match = "1.2".match(genRegExp);
                expect(match).toBe(null);
                // expect(match.length).toBe(0);
            });
            test("misnamed item -> 1.two.3", () => {
                let match = "1.two.3".match(genRegExp);
                expect(match).toBe(null);
                // expect(match.length).toBe(0);
            });
            test("incorrect seperator -> 1.2-3", () => {
                let match = "1.2-3".match(genRegExp);
                expect(match).toBe(null);
                // expect(match.length).toBe(0);
            });
        });
    });
    describe("General semantic cases w/ optional tag: major.minor[.build]", () => {
        let scheme = 'major.minor[.build]', genRegExp = regExpParser_1.generateSchemeRegexp(scheme);
        test("it should identify the correct item in the string for simple input (w/ optional)", () => {
            let match = "1.2.3".match(genRegExp);
            expect(match).not.toBe(null);
            expect(match.length).toBeGreaterThan(0);
            expect(match[0]).toBe("1.2.3");
        });
        test("it should identify the correct item in the string for simple input (w0/ optional)", () => {
            let match = "1.2".match(genRegExp);
            expect(match).not.toBe(null);
            expect(match.length).toBeGreaterThan(0);
            expect(match[0]).toBe("1.2");
        });
        test("it should identify the correct item in the string for complex input (w/ optional)", () => {
            let match = "test.1.2.3.4".match(genRegExp);
            expect(match).not.toBe(null);
            expect(match.length).toBeGreaterThan(0);
            expect(match[0]).toBe("1.2.3");
        });
        test("it should identify the correct item in the string for complex input (wo/ optional)", () => {
            let match = "test.1.2.test".match(genRegExp);
            expect(match).not.toBe(null);
            expect(match.length).toBeGreaterThan(0);
            expect(match[0]).toBe("1.2");
        });
        describe("It should reject: Incorrect inputs", () => {
            test("missing item -> 1.", () => {
                let match = "1.".match(genRegExp);
                expect(match).toBe(null);
            });
            test("misnamed item -> 1.two.3", () => {
                let match = "1.two.3".match(genRegExp);
                expect(match).toBe(null);
                // expect(match.length).toBe(0);
            });
            test("incorrect seperator -> 1-2-3", () => {
                let match = "1-2-3".match(genRegExp);
                expect(match).toBe(null);
                // expect(match.length).toBe(0);
            });
        });
    });
    describe("General semantic cases w/ optional tags: major.minor[.build][.commit]", () => {
        let scheme = 'major.minor[.build][.commit]', genRegExp = regExpParser_1.generateSchemeRegexp(scheme);
        test("it should identify the correct item in the string for simple input (w/ optionals)", () => {
            let match = "1.2.3.4".match(genRegExp);
            expect(match).not.toBe(null);
            expect(match.length).toBeGreaterThan(0);
            expect(match[0]).toBe("1.2.3.4");
        });
        test("it should identify the correct item in the string for simple input (wo/ optional)", () => {
            let match = "1.2.3".match(genRegExp);
            expect(match).not.toBe(null);
            expect(match.length).toBeGreaterThan(0);
            expect(match[0]).toBe("1.2.3");
        });
        test("it should identify the correct item in the string for simple input (wo/ optionals)", () => {
            let match = "1.2".match(genRegExp);
            expect(match).not.toBe(null);
            expect(match.length).toBeGreaterThan(0);
            expect(match[0]).toBe("1.2");
        });
        test("it should identify the correct item in the string for complex input (w/ optionals)", () => {
            let match = "test.1.2.3.4".match(genRegExp);
            expect(match).not.toBe(null);
            expect(match.length).toBeGreaterThan(0);
            expect(match[0]).toBe("1.2.3.4");
        });
        test("it should identify the correct item in the string for complex input (wo/ optionals)", () => {
            let match = "test.1.2.test".match(genRegExp);
            expect(match).not.toBe(null);
            expect(match.length).toBeGreaterThan(0);
            expect(match[0]).toBe("1.2");
        });
        describe("It should reject: Incorrect inputs", () => {
            test("missing item -> 1.", () => {
                let match = "1.".match(genRegExp);
                expect(match).toBe(null);
            });
            test("misnamed item -> 1.two.3", () => {
                let match = "1.two.3".match(genRegExp);
                expect(match).toBe(null);
                // expect(match.length).toBe(0);
            });
            test("incorrect seperator -> 1-2-3-4", () => {
                let match = "1-2-3-4".match(genRegExp);
                expect(match).toBe(null);
                // expect(match.length).toBe(0);
            });
            test("incorrect seperator -> 1-2-3", () => {
                let match = "1-2-3".match(genRegExp);
                expect(match).toBe(null);
                // expect(match.length).toBe(0);
            });
        });
    });
    describe("General semantic cases w/ compound optional tags: major.minor[.build[-commit]]", () => {
        let scheme = 'major.minor[.build[-commit]]', genRegExp = regExpParser_1.generateSchemeRegexp(scheme);
        test("it should identify the correct item in the string for simple input (w/ optionals)", () => {
            let match = "1.2.3-4".match(genRegExp);
            expect(match).not.toBe(null);
            expect(match.length).toBeGreaterThan(0);
            expect(match[0]).toBe("1.2.3-4");
        });
        test("it should identify the correct item in the string for simple input (wo/ optional)", () => {
            let match = "1.2.3".match(genRegExp);
            expect(match).not.toBe(null);
            expect(match.length).toBeGreaterThan(0);
            expect(match[0]).toBe("1.2.3");
        });
        test("it should identify the correct item in the string for simple input (wo/ optionals)", () => {
            let match = "1.2".match(genRegExp);
            expect(match).not.toBe(null);
            expect(match.length).toBeGreaterThan(0);
            expect(match[0]).toBe("1.2");
        });
        test("it should identify the correct item in the string for complex input (w/ optionals)", () => {
            let match = "test.1.2.3-4".match(genRegExp);
            expect(match).not.toBe(null);
            expect(match.length).toBeGreaterThan(0);
            expect(match[0]).toBe("1.2.3-4");
        });
        test("it should identify the correct item in the string for complex input (wo/ optionals)", () => {
            let match = "test.1.2.test".match(genRegExp);
            expect(match).not.toBe(null);
            expect(match.length).toBeGreaterThan(0);
            expect(match[0]).toBe("1.2");
        });
        describe("It should reject: Incorrect inputs", () => {
            test("missing item -> 1.", () => {
                let match = "1.".match(genRegExp);
                expect(match).toBe(null);
            });
            test("misnamed item -> 1.two.3", () => {
                let match = "1.two.3".match(genRegExp);
                expect(match).toBe(null);
                // expect(match.length).toBe(0);
            });
            test("incorrect seperator -> 1-2-3-4", () => {
                let match = "1-2-3-4".match(genRegExp);
                expect(match).toBe(null);
                // expect(match.length).toBe(0);
            });
            test("incorrect seperator -> 1-2-3", () => {
                let match = "1-2-3".match(genRegExp);
                expect(match).toBe(null);
                // expect(match.length).toBe(0);
            });
        });
    });
    describe("Case with multiple seperators", () => {
        test("multiple seperators -> 1.2->3", () => {
            let match = "1.2->3".match(regExpParser_1.generateSchemeRegexp("major.minor->build"));
            expect(match).not.toBe(null);
            expect(match[0]).toBe("1.2->3");
        });
        test("multiple seperators with optional -> 1.2->3", () => {
            let match = "1.2->3".match(regExpParser_1.generateSchemeRegexp("major.minor[->build]"));
            expect(match).not.toBe(null);
            expect(match[0]).toBe("1.2->3");
        });
        test("multiple seperators with optionals -> 1.2->3<-4", () => {
            let match = "1.2->3<-4".match(regExpParser_1.generateSchemeRegexp("major.minor[->build][<-tag]"));
            expect(match).not.toBe(null);
            expect(match[0]).toBe("1.2->3<-4");
        });
        test("multiple seperators with compound optionals -> 1.2->3<-4", () => {
            let match = "1.2->3<-4".match(regExpParser_1.generateSchemeRegexp("major.minor[->build[<-tag]]"));
            expect(match).not.toBe(null);
            expect(match[0]).toBe("1.2->3<-4");
        });
    });
});
describe("Get Current version from files", () => {
    describe("Get Current version from package.json - semantic", () => {
        const VERSION = '3.2.1';
        let filePath = "./src/tests/assets/package-semantic-stub.json", options = {
            scheme: "semantic",
            versionFile: { path: filePath },
            files: [],
            rules: []
        };
        test("Get without line number", () => __awaiter(void 0, void 0, void 0, function* () {
            let curVer = yield utils_1.getCurVersion(options);
            expect(curVer).toBe(VERSION);
        }));
        test("Get with line number", () => __awaiter(void 0, void 0, void 0, function* () {
            options.versionFile.line = 3;
            let curVer = yield utils_1.getCurVersion(options);
            expect(curVer).toBe(VERSION);
        }));
        test("Get with incorrect line number", () => __awaiter(void 0, void 0, void 0, function* () {
            options.versionFile.line = 7;
            let curVer = yield utils_1.getCurVersion(options);
            expect(curVer).toBe(VERSION);
        }));
    });
    test("Get version with multiple matched and line number", () => __awaiter(void 0, void 0, void 0, function* () {
        const VERSION = '3.2.1';
        let filePath = "./src/tests/assets/package-semantic-multiple-stub.json", options = {
            scheme: "semantic",
            versionFile: { path: filePath },
            files: [],
            rules: []
        };
        options.versionFile.line = 8;
        let curVer = yield utils_1.getCurVersion(options);
        expect(curVer).toBe(VERSION);
    }));
    describe("Get Current version from packae.json - custom", () => {
        const VERSION = '3-2>1';
        let filePath = "./src/tests/assets/package-custom-stub.json", options = {
            scheme: "custom",
            schemeDefinition: "major-minor>build",
            versionFile: { path: filePath },
            files: [],
            rules: []
        };
        test("Get without line number", () => __awaiter(void 0, void 0, void 0, function* () {
            let curVer = yield utils_1.getCurVersion(options);
            expect(curVer).toBe(VERSION);
        }));
        test("Get with line number", () => __awaiter(void 0, void 0, void 0, function* () {
            options.versionFile.line = 3;
            let curVer = yield utils_1.getCurVersion(options);
            expect(curVer).toBe(VERSION);
        }));
        test("Get with incorrect line number", () => __awaiter(void 0, void 0, void 0, function* () {
            options.versionFile.line = 7;
            let curVer = yield utils_1.getCurVersion(options);
            expect(curVer).toBe(VERSION);
        }));
    });
    test("Incorrect file path", (done) => __awaiter(void 0, void 0, void 0, function* () {
        let filePath = "./src/tests/assets/non-existent-file.txt", options = {
            scheme: "custom",
            schemeDefinition: "major-minor>build",
            versionFile: { path: filePath },
            files: [],
            rules: []
        };
        try {
            yield utils_1.getCurVersion(options);
            fail("Should return an error");
        }
        catch (e) {
            done();
        }
    }));
    test("No match", () => __awaiter(void 0, void 0, void 0, function* () {
        let filePath = "./src/tests/assets/package-custom-stub.json", options = {
            scheme: "custom",
            schemeDefinition: "major.minor.build",
            versionFile: { path: filePath },
            files: [],
            rules: []
        };
        try {
            yield utils_1.getCurVersion(options);
            fail("Should return an error");
        }
        catch (e) {
            expect(e.message).toBe(`No match found in file. Unable to identify current version number.`);
        }
    }));
});
describe("Get optional version items", () => {
    test("No Optional case.", () => {
        let optional = utils_1.getOptional("major.minor.build");
        expect(optional).toStrictEqual({});
    });
    test("Single optional Case", () => {
        let optional = utils_1.getOptional("major.minor[.build]");
        expect(optional).toStrictEqual({ "build": ".build" });
    });
    test("Double optional case", () => {
        let optional = utils_1.getOptional("major.minor[.build][.tag]");
        expect(optional).toStrictEqual({ "build": ".build", "tag": ".tag" });
    });
    test("Double compound case", () => {
        let optional = utils_1.getOptional("major.minor[.build[.tag]]");
        expect(optional).toStrictEqual({ "build": ".build", "tag": ".tag" });
        // Fails -> TODO - Update getOptional to pass
        // optional = getOptional("major.minor[[.build].tag]");
        // expect(optional).toStrictEqual(["build","tag"]);
    });
    test("Multiple compound case", () => {
        let optional = utils_1.getOptional("major.minor[.build[.tag][.other[.misc]]");
        expect(optional).toStrictEqual({ "build": ".build", "tag": ".tag", "other": ".other", "misc": ".misc" });
    });
});
describe("Get Version Map tests", () => {
    test("Preset semantic", () => {
        let options = {
            scheme: "semantic",
            versionFile: { path: "" },
            files: [],
            rules: []
        }, version = "1.2.3", map = utils_1.getVersionMap(options, version);
        expect(map).toStrictEqual({
            major: 1,
            minor: 2,
            build: 3
        });
        version = "1.2";
        map = utils_1.getVersionMap(options, version);
        expect(map).toStrictEqual({
            major: 1,
            minor: 2,
            build: 0
        });
    });
    test("No Optional Custom", () => {
        let options = {
            scheme: "custom",
            schemeDefinition: "version.patch->build",
            versionFile: { path: "" },
            files: [],
            rules: []
        }, version = "1.2->3", map = utils_1.getVersionMap(options, version);
        expect(map).toStrictEqual({
            version: 1,
            patch: 2,
            build: 3
        });
    });
    test("Single Optional Custom", () => {
        let options = {
            scheme: "custom",
            schemeDefinition: "version.patch[->build]",
            versionFile: { path: "" },
            files: [],
            rules: []
        }, version = "1.2->3", map = utils_1.getVersionMap(options, version);
        expect(map).toStrictEqual({
            version: 1,
            patch: 2,
            build: 3
        });
        version = "1.2";
        map = utils_1.getVersionMap(options, version);
        expect(map).toStrictEqual({
            version: 1,
            patch: 2,
            build: 0
        });
    });
    test("Multiple Optional Custom", () => {
        let options = {
            scheme: "custom",
            schemeDefinition: "major[.minor][.build][->patch]",
            versionFile: { path: "" },
            files: [],
            rules: []
        }, version = "1.2.3->4", map = utils_1.getVersionMap(options, version);
        expect(map).toStrictEqual({
            major: 1,
            minor: 2,
            patch: 4,
            build: 3
        });
        version = "1.2";
        map = utils_1.getVersionMap(options, version);
        expect(map).toStrictEqual({
            major: 1,
            minor: 2,
            patch: 0,
            build: 0
        });
        version = "1";
        map = utils_1.getVersionMap(options, version);
        expect(map).toStrictEqual({
            major: 1,
            minor: 0,
            patch: 0,
            build: 0
        });
    });
});
describe("Version map to String tests", () => {
    let options = {
        scheme: "custom",
        schemeDefinition: "major.minor.build",
        versionFile: { path: '' },
        files: [],
        rules: []
    }, map = {
        major: 2,
        minor: 1,
        build: 0
    };
    test("No optional", () => {
        let version = utils_1.versionMapToString(options, map);
        expect(version).toBe("2.1.0");
    });
    test("Single Optional zero", () => {
        options.schemeDefinition = "major.minor[.build]";
        map = {
            major: 2,
            minor: 1,
            build: 0
        };
        let version = utils_1.versionMapToString(options, map);
        expect(version).toBe("2.1");
    });
    test("Single Optional Value", () => {
        options.schemeDefinition = "major.minor[.build]";
        map = {
            major: 2,
            minor: 1,
            build: 34
        };
        let version = utils_1.versionMapToString(options, map);
        expect(version).toBe("2.1.34");
    });
    test("Multiple Optional Value", () => {
        options.schemeDefinition = "major[.minor][.build]";
        map = {
            major: 2,
            minor: 1,
            build: 34
        };
        let version = utils_1.versionMapToString(options, map);
        expect(version).toBe("2.1.34");
        options.schemeDefinition = "major[.minor[.build]]";
        version = utils_1.versionMapToString(options, map);
        expect(version).toBe("2.1.34");
    });
    test("Multiple Optional Single Zero", () => {
        // minor = 0
        options.schemeDefinition = "major[.minor][.build]";
        map = {
            major: 2,
            minor: 0,
            build: 34
        };
        let version = utils_1.versionMapToString(options, map);
        expect(version).toBe("2.0.34");
        options.schemeDefinition = "major[.minor[.build]]";
        version = utils_1.versionMapToString(options, map);
        expect(version).toBe("2.0.34");
        // build = 0
        options.schemeDefinition = "major[.minor][.build]";
        map = {
            major: 2,
            minor: 1,
            build: 0
        };
        version = utils_1.versionMapToString(options, map);
        expect(version).toBe("2.1");
        options.schemeDefinition = "major[.minor[.build]]";
        version = utils_1.versionMapToString(options, map);
        expect(version).toBe("2.1");
    });
    test("Multiple Optional Multiple Zero", () => {
        options.schemeDefinition = "major[.minor][.build]";
        map = {
            major: 2,
            minor: 0,
            build: 0
        };
        let version = utils_1.versionMapToString(options, map);
        expect(version).toBe("2");
        options.schemeDefinition = "major[.minor[.build]]";
        version = utils_1.versionMapToString(options, map);
        expect(version).toBe("2");
    });
});
describe("Bump Version tests", () => {
    describe("Preset Semantic", () => {
        let options = {
            scheme: "semantic",
            versionFile: { path: './src/tests/assets/INTEGRATION_VERSION.txt', line: 1 },
            files: [],
            rules: [
                // on any commit bump build
                { trigger: 'commit', bump: 'build' },
                // on any commit to branch master, bump minor and reset build
                {
                    trigger: 'commit',
                    branch: 'master',
                    bump: 'minor',
                    reset: 'build'
                },
                // on any commit to branch release, bump major and reset minor and build
                {
                    trigger: 'commit',
                    branch: 'release',
                    bump: 'major',
                    reset: ['minor', 'build']
                },
                // on any manual action bump build
                { trigger: 'manual', bump: 'build' },
                // on manual action on branch master, bump major and reset minor and build
                {
                    trigger: 'manual',
                    branch: 'master',
                    bump: 'major',
                    reset: ['minor', 'build']
                }
            ]
        };
        test("Commit Trigger random branch Tests", () => __awaiter(void 0, void 0, void 0, function* () {
            options.versionFile.line = 1; // should fetch version number 1.2.3
            // commit on random branch should result in just a bump from the build tag
            let newVersion = yield utils_1.bumpVersion(options, 'commit', 'random');
            expect(newVersion).toBe('1.2.4');
        }));
        test("Commit Trigger random branch Tests no build", () => __awaiter(void 0, void 0, void 0, function* () {
            options.versionFile.line = 2; // should fetch version number 1.2.3
            // commit on random branch should result in just a bump from the build tag
            console.log(options);
            let newVersion = yield utils_1.bumpVersion(options, 'commit', 'random');
            expect(newVersion).toBe('1.2.1');
        }));
        test("Commit Trigger release branch Tests", () => __awaiter(void 0, void 0, void 0, function* () {
            options.versionFile.line = 1; // should fetch version number 1.2.3
            // commit on release branch should bump major, reset minor and build, bump build
            let newVersion = yield utils_1.bumpVersion(options, 'commit', 'release');
            expect(newVersion).toBe('2.0.1');
        }));
        test("Commit Trigger release branch Tests no build", () => __awaiter(void 0, void 0, void 0, function* () {
            options.versionFile.line = 2; // should fetch version number 1.2.3
            // commit on release branch should bump major, reset minor and build, bump build
            let newVersion = yield utils_1.bumpVersion(options, 'commit', 'release');
            expect(newVersion).toBe('2.0.1');
        }));
        test("Commit Trigger master branch tests", () => __awaiter(void 0, void 0, void 0, function* () {
            options.versionFile.line = 1; // should fetch version number 1.2.3
            // commit on master branch should bump minor, reset and bump build
            let newVersion = yield utils_1.bumpVersion(options, 'commit', 'master');
            expect(newVersion).toBe('1.3.1');
        }));
        test("Commit Trigger master branch tests no build", () => __awaiter(void 0, void 0, void 0, function* () {
            options.versionFile.line = 2; // should fetch version number 1.2.3
            // commit on master branch should bump minor, reset and bump build
            let newVersion = yield utils_1.bumpVersion(options, 'commit', 'master');
            expect(newVersion).toBe('1.3.1');
        }));
        test("Manual Trigger random branch Tests", () => __awaiter(void 0, void 0, void 0, function* () {
            options.versionFile.line = 1; // should fetch version number 1.2.3
            // manual trigger on random branch should bump build tag
            let newVersion = yield utils_1.bumpVersion(options, 'manual', 'random');
            expect(newVersion).toBe('1.2.4');
        }));
        test("Manual Trigger random branch Tests no build", () => __awaiter(void 0, void 0, void 0, function* () {
            options.versionFile.line = 1; // should fetch version number 1.2.3
            // manual trigger on random branch should bump build tag
            let newVersion = yield utils_1.bumpVersion(options, 'manual', 'random');
            expect(newVersion).toBe('1.2.4');
        }));
        test("Manual Trigger master branch tests", () => __awaiter(void 0, void 0, void 0, function* () {
            options.versionFile.line = 1; // should fetch version number 1.2.3
            // manual trigger on master branch should bump major, reset minor and build, bump build
            let newVersion = yield utils_1.bumpVersion(options, 'manual', 'master');
            expect(newVersion).toBe('2.0.1');
        }));
        test("Manual Trigger master branch tests no build", () => __awaiter(void 0, void 0, void 0, function* () {
            options.versionFile.line = 2; // should fetch version number 1.2.3
            // manual trigger on master branch should bump major, reset minor and build, bump build
            let newVersion = yield utils_1.bumpVersion(options, 'manual', 'master');
            expect(newVersion).toBe('2.0.1');
        }));
        // describe("Pull-request trigger tests", () => {});
        // describe("Comment trigger", () => {});
    });
});
