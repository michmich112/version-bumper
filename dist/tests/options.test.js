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
const options_1 = require("../utils/options");
describe("Get Version files", () => {
    let options = {
        scheme: "semantic",
        versionFile: { path: "" },
        files: [],
        rules: []
    };
    test("All VersionFile format", () => {
        options.files = [{ path: "./first/file/path.txt" }, { path: "./second/file/path.json", line: 69 }];
        let files = options_1.getFiles(options);
        expect(files).toStrictEqual([{ path: "./first/file/path.txt" }, { path: "./second/file/path.json", line: 69 }]);
    });
    test("All String format", () => {
        options.files = ["./first/file/path.txt", "./second/file/path.json"];
        let files = options_1.getFiles(options);
        expect(files).toStrictEqual([{ path: "./first/file/path.txt" }, { path: "./second/file/path.json" }]);
    });
    test("Mixed format", () => {
        options.files = ["./first/file/path.txt", { path: "./second/file/path.json", line: 69 }];
        let files = options_1.getFiles(options);
        expect(files).toStrictEqual([{ path: "./first/file/path.txt" }, { path: "./second/file/path.json", line: 69 }]);
    });
});
jest.mock('@actions/core');
let core = require('@actions/core');
describe("Get Bumper Options", () => {
    let wfInput = { // Workflow input
    // 'options-file': '',
    // 'scheme': '',
    // 'custom-scheme': '',
    // 'version-file': '',
    // 'files': '',
    // 'rules': ''
    };
    let getInput = jest.fn((input) => {
        console.log(`${input} -> ${wfInput[input]}`);
        return wfInput[input];
    });
    core.getInput.mockImplementation(getInput);
    describe("Options-file tests", () => {
        test("Correct full options file", () => __awaiter(void 0, void 0, void 0, function* () {
            wfInput = { 'options-file': "./src/tests/assets/option-files/correctOptionFiles.json" };
            try {
                let options = yield options_1.getBumperOptions();
                console.log(`Options -> ${JSON.stringify(options)}`);
                expect(options).toStrictEqual({
                    "scheme": "semantic",
                    "schemeDefinition": "major.minor[.build]",
                    "versionFile": { "path": "./src/tests/assets/package-semantic-stub.json" },
                    "files": [{ "path": "./src/tests/assets/package-semantic-stub.json" },
                        {
                            "path": "./src/example/file1"
                        }, {
                            "path": "./src/example/file2"
                        }, {
                            "path": "./src/example/file3",
                            "line": 69
                        }],
                    "rules": [
                        {
                            "trigger": "commit",
                            "bump": "build"
                        },
                        {
                            "trigger": "commit",
                            "bump": "minor",
                            "branch": "master",
                            "reset": "build"
                        },
                        {
                            "trigger": "commit",
                            "bump": "major",
                            "branch": "release",
                            "reset": [
                                "minor",
                                "build"
                            ]
                        }
                    ]
                });
            }
            catch (e) {
                fail(e);
            }
        }));
        describe("Correct full options file with overrides", () => {
            test("Scheme Override", () => __awaiter(void 0, void 0, void 0, function* () {
                wfInput = {
                    'options-file': "./src/tests/assets/option-files/correctOptionFiles.json",
                    'scheme': 'custom'
                };
                try {
                    yield options_1.getBumperOptions();
                    console.error("Should fail with no custom scheme defined.");
                    fail("Should fail with no custom scheme defined.");
                }
                catch (e) {
                    // pass should fail
                }
                wfInput = {
                    'options-file': "./src/tests/assets/option-files/correctOptionFiles.json",
                    'scheme': 'custom',
                    'custom-scheme': 'major.minor[.build]'
                };
                try {
                    let options = yield options_1.getBumperOptions();
                    console.log(`Options -> ${JSON.stringify(options)}`);
                    expect(options).toStrictEqual({
                        "scheme": "custom",
                        "schemeDefinition": "major.minor[.build]",
                        "versionFile": { "path": "./src/tests/assets/package-semantic-stub.json" },
                        "files": [{ "path": "./src/tests/assets/package-semantic-stub.json" },
                            {
                                "path": "./src/example/file1"
                            }, {
                                "path": "./src/example/file2"
                            }, {
                                "path": "./src/example/file3",
                                "line": 69
                            }],
                        "rules": [
                            {
                                "trigger": "commit",
                                "bump": "build"
                            },
                            {
                                "trigger": "commit",
                                "bump": "minor",
                                "branch": "master",
                                "reset": "build"
                            },
                            {
                                "trigger": "commit",
                                "bump": "major",
                                "branch": "release",
                                "reset": [
                                    "minor",
                                    "build"
                                ]
                            }
                        ]
                    });
                }
                catch (e) {
                    fail(e);
                }
            }));
            test("Scheme Definition Override", () => __awaiter(void 0, void 0, void 0, function* () {
                wfInput = {
                    'options-file': "./src/tests/assets/option-files/correctOptionFiles.json",
                    'custom-scheme': 'major-minor[->build]'
                };
                try {
                    let options = yield options_1.getBumperOptions();
                    console.log(`Options -> ${JSON.stringify(options)}`);
                    expect(options).toStrictEqual({
                        "scheme": "custom",
                        "schemeDefinition": "major-minor[->build]",
                        "versionFile": { "path": "./src/tests/assets/package-semantic-stub.json" },
                        "files": [{ "path": "./src/tests/assets/package-semantic-stub.json" },
                            {
                                "path": "./src/example/file1"
                            }, {
                                "path": "./src/example/file2"
                            }, {
                                "path": "./src/example/file3",
                                "line": 69
                            }],
                        "rules": [
                            {
                                "trigger": "commit",
                                "bump": "build"
                            },
                            {
                                "trigger": "commit",
                                "bump": "minor",
                                "branch": "master",
                                "reset": "build"
                            },
                            {
                                "trigger": "commit",
                                "bump": "major",
                                "branch": "release",
                                "reset": [
                                    "minor",
                                    "build"
                                ]
                            }
                        ]
                    });
                }
                catch (e) {
                    console.error(`Should pass with just custom scheme defined.\n${e.message}`);
                    fail(`Should pass with just custom scheme defined.\n${e.message}`);
                }
                wfInput = {
                    'options-file': "./src/tests/assets/option-files/correctOptionFiles.json",
                    'scheme': 'custom',
                    'custom-scheme': 'major-minor[->build]'
                };
                try {
                    let options = yield options_1.getBumperOptions();
                    console.log(`Options -> ${JSON.stringify(options)}`);
                    expect(options).toStrictEqual({
                        "scheme": "custom",
                        "schemeDefinition": "major-minor[->build]",
                        "versionFile": { "path": "./src/tests/assets/package-semantic-stub.json" },
                        "files": [{ "path": "./src/tests/assets/package-semantic-stub.json" },
                            {
                                "path": "./src/example/file1"
                            }, {
                                "path": "./src/example/file2"
                            }, {
                                "path": "./src/example/file3",
                                "line": 69
                            }],
                        "rules": [
                            {
                                "trigger": "commit",
                                "bump": "build"
                            },
                            {
                                "trigger": "commit",
                                "bump": "minor",
                                "branch": "master",
                                "reset": "build"
                            },
                            {
                                "trigger": "commit",
                                "bump": "major",
                                "branch": "release",
                                "reset": [
                                    "minor",
                                    "build"
                                ]
                            }
                        ]
                    });
                }
                catch (e) {
                    fail(e);
                }
            }));
            test("Version File override", () => __awaiter(void 0, void 0, void 0, function* () {
                wfInput = {
                    'options-file': "./src/tests/assets/option-files/correctOptionFiles.json",
                    'version-file': "./src/tests/assets/package-custom-stub.json"
                };
                try {
                    let options = yield options_1.getBumperOptions();
                    console.log(`Options -> ${JSON.stringify(options)}`);
                    expect(options).toStrictEqual({
                        "scheme": "semantic",
                        "schemeDefinition": "major.minor[.build]",
                        "versionFile": { "path": "./src/tests/assets/package-custom-stub.json" },
                        "files": [{ "path": "./src/tests/assets/package-custom-stub.json" },
                            {
                                "path": "./src/example/file1"
                            }, {
                                "path": "./src/example/file2"
                            }, {
                                "path": "./src/example/file3",
                                "line": 69
                            }],
                        "rules": [
                            {
                                "trigger": "commit",
                                "bump": "build"
                            },
                            {
                                "trigger": "commit",
                                "bump": "minor",
                                "branch": "master",
                                "reset": "build"
                            },
                            {
                                "trigger": "commit",
                                "bump": "major",
                                "branch": "release",
                                "reset": [
                                    "minor",
                                    "build"
                                ]
                            }
                        ]
                    });
                }
                catch (e) {
                    fail(e);
                }
            }));
            test("Files override", () => __awaiter(void 0, void 0, void 0, function* () {
                wfInput = {
                    'options-file': "./src/tests/assets/option-files/correctOptionFiles.json",
                    'files': "[]"
                };
                try {
                    let options = yield options_1.getBumperOptions();
                    console.log(`Options -> ${JSON.stringify(options)}`);
                    expect(options).toStrictEqual({
                        "scheme": "semantic",
                        "schemeDefinition": "major.minor[.build]",
                        "versionFile": { "path": "./src/tests/assets/package-semantic-stub.json" },
                        "files": [{ "path": "./src/tests/assets/package-semantic-stub.json" }],
                        "rules": [
                            {
                                "trigger": "commit",
                                "bump": "build"
                            },
                            {
                                "trigger": "commit",
                                "bump": "minor",
                                "branch": "master",
                                "reset": "build"
                            },
                            {
                                "trigger": "commit",
                                "bump": "major",
                                "branch": "release",
                                "reset": [
                                    "minor",
                                    "build"
                                ]
                            }
                        ]
                    });
                }
                catch (e) {
                    fail(e);
                }
                wfInput = {
                    'options-file': "./src/tests/assets/option-files/correctOptionFiles.json",
                    'files': '["./file1", {"path":"./file2"}, {"path":"./file3", "line":3}]'
                };
                try {
                    let options = yield options_1.getBumperOptions();
                    console.log(`Options -> ${JSON.stringify(options)}`);
                    expect(options).toStrictEqual({
                        "scheme": "semantic",
                        "schemeDefinition": "major.minor[.build]",
                        "versionFile": { "path": "./src/tests/assets/package-semantic-stub.json" },
                        "files": [{ "path": "./src/tests/assets/package-semantic-stub.json" },
                            {
                                "path": './file1'
                            }, {
                                'path': './file2'
                            }, {
                                'path': './file3',
                                'line': 3
                            }],
                        "rules": [
                            {
                                "trigger": "commit",
                                "bump": "build"
                            },
                            {
                                "trigger": "commit",
                                "bump": "minor",
                                "branch": "master",
                                "reset": "build"
                            },
                            {
                                "trigger": "commit",
                                "bump": "major",
                                "branch": "release",
                                "reset": [
                                    "minor",
                                    "build"
                                ]
                            }
                        ]
                    });
                }
                catch (e) {
                    fail(e);
                }
            }));
            test("Rules override", () => __awaiter(void 0, void 0, void 0, function* () {
                wfInput = {
                    'options-file': "./src/tests/assets/option-files/correctOptionFiles.json",
                    'rules': "[]"
                };
                try {
                    let options = yield options_1.getBumperOptions();
                    console.log(`Options -> ${JSON.stringify(options)}`);
                    expect(options).toStrictEqual({
                        "scheme": "semantic",
                        "schemeDefinition": "major.minor[.build]",
                        "versionFile": { "path": "./src/tests/assets/package-semantic-stub.json" },
                        "files": [{ "path": "./src/tests/assets/package-semantic-stub.json" },
                            {
                                "path": "./src/example/file1"
                            }, {
                                "path": "./src/example/file2"
                            }, {
                                "path": "./src/example/file3",
                                "line": 69
                            }],
                        "rules": []
                    });
                }
                catch (e) {
                    fail(e);
                }
                wfInput = {
                    'options-file': "./src/tests/assets/option-files/correctOptionFiles.json",
                    'rules': '[{"trigger":"commit","bump":["minor","build"]}]'
                };
                try {
                    let options = yield options_1.getBumperOptions();
                    console.log(`Options -> ${JSON.stringify(options)}`);
                    expect(options).toStrictEqual({
                        "scheme": "semantic",
                        "schemeDefinition": "major.minor[.build]",
                        "versionFile": { "path": "./src/tests/assets/package-semantic-stub.json" },
                        "files": [{ "path": "./src/tests/assets/package-semantic-stub.json" },
                            {
                                "path": "./src/example/file1"
                            }, {
                                "path": "./src/example/file2"
                            }, {
                                "path": "./src/example/file3",
                                "line": 69
                            }],
                        "rules": [{
                                "trigger": "commit",
                                "bump": ["minor", "build"]
                            }]
                    });
                }
                catch (e) {
                    fail(e);
                }
            }));
        });
    });
});
