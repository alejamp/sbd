const tokenizer = require('../lib/tokenizer');
var async_mutex_1 = require('async-mutex');
var Match  = require("./Match");

var streamDetector = /** @class */ (function () {


    function streamDetector(handler, single_response) {
        if (single_response === void 0) { single_response = false; }
        this.handler = handler;
        this.single_response = single_response;
        this.buffer = '';
        this.options = {
            newline_boundaries: true,
            html_boundaries: false,
            sanitize: false
        };
        this.mutex = new async_mutex_1.Mutex();
    }

    streamDetector.prototype.feed = function (text) {
        var _this = this;

        return __awaiter(this, void 0, void 0, function () {
            var sentences, sentence;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.mutex.runExclusive(function () { return __awaiter(void 0, void 0, void 0, function () {

                            return __generator(this, function (_a) {
                                _this.buffer += text;
                                if (_this.single_response) {
                                    return [2 /*return*/];
                                }

                                sentences = tokenizer.sentences(_this.buffer, _this.options);
                        
                                if (sentences.length > 1 && sentences[1]) {

                                    // check if sentences[1] has a URL or email
                                    // if so, it's probably not a sentence ending
                                    if (Match.endsInURL(_this.buffer)) {
                                        return;
                                    }

                                    sentence = sentences[0];
                                    _this.buffer = sentences[1];
                                    _this.handler(sentence);
                                }
                                return [2 /*return*/];
                            });
                        }); })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };

    streamDetector.prototype.flush = function () {
        var _this = this;
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.mutex.runExclusive(function () { return __awaiter(void 0, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                if (_this.buffer.length > 0) {
                                    _this.handler(_this.buffer);
                                    _this.buffer = '';
                                }
                                return [2 /*return*/];
                            });
                        }); })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    return streamDetector;
}());

exports.streamDetector = streamDetector;