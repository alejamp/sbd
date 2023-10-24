(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.tokenizer = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
var abbreviations;

var englishAbbreviations = [
    "al",
    "adj",
    "assn",
    "Ave",
    "BSc", "MSc",
    "Cell",
    "Ch",
    "Co",
    "cc",
    "Corp",
    "Dem",
    "Dept",
    "ed",
    "eg",
    "Eq",
    "Eqs",
    "est",
    "est",
    "etc",
    "Ex",
    "ext", // + number?
    "Fig",
    "fig",
    "Figs",
    "figs",
    "i.e",
    "ie",
    "Inc",
    "inc",
    "Jan","Feb","Mar","Apr","Jun","Jul","Aug","Sep","Sept","Oct","Nov","Dec",
    "jr",
    "mi",
    "Miss", "Mrs", "Mr", "Ms",
    "Mol",
    "mt",
    "mts",
    "no",
    "Nos",
    "PhD", "MD", "BA", "MA", "MM",
    "pl",
    "pop",
    "pp",
    "Prof", "Dr",
    "pt",
    "Ref",
    "Refs",
    "Rep",
    "repr",
    "rev",
    "Sec",
    "Secs",
    "Sgt", "Col", "Gen", "Rep", "Sen",'Gov', "Lt", "Maj", "Capt","St",
    "Sr", "sr", "Jr", "jr", "Rev",
    "Sun","Mon","Tu","Tue","Tues","Wed","Th","Thu","Thur","Thurs","Fri","Sat",
    "trans",
    "Univ",
    "Viz",
    "Vol",
    "vs",
    "v",
];

exports.setAbbreviations = function(abbr) {
    if (abbr) {
        abbreviations = abbr;
    } else {
        abbreviations = englishAbbreviations;
    }
}

var isCapitalized = exports.isCapitalized = function(str) {
    return /^[A-Z][a-z].*/.test(str) || isNumber(str);
}

// Start with opening quotes or capitalized letter
exports.isSentenceStarter = function(str) {
    return isCapitalized(str) || /``|"|'/.test(str.substring(0,2));
}

exports.isCommonAbbreviation = function(str) {
    var noSymbols = str.replace(/[-'`~!@#$%^&*()_|+=?;:'",.<>\{\}\[\]\\\/]/gi, "");

    return ~abbreviations.indexOf(noSymbols);
}

// This is going towards too much rule based
exports.isTimeAbbreviation = function(word, next) {
    if (word === "a.m." || word === "p.m.") {
        var tmp = next.replace(/\W+/g, '').slice(-3).toLowerCase();

        if (tmp === "day") {
            return true;
        }
    }

    return false;
}

exports.isDottedAbbreviation = function(word) {
    var matches = word.replace(/[\(\)\[\]\{\}]/g, '').match(/(.\.)*/);
    return matches && matches[0].length > 0;
}

// TODO look for next words, if multiple are capitalized,
// then it's probably not a sentence ending
exports.isCustomAbbreviation = function(str) {
    if (str.length <= 3) {
        return true;
    }

    return isCapitalized(str);
}

// Uses current word count in sentence and next few words to check if it is
// more likely an abbreviation + name or new sentence.
exports.isNameAbbreviation = function(wordCount, words) {
    if (words.length > 0) {
        if (wordCount < 5 && words[0].length < 6 && isCapitalized(words[0])) {
            return true;
        }

        var capitalized = words.filter(function(str) {
            return /[A-Z]/.test(str.charAt(0));
        });

        return capitalized.length >= 3;
    }

    return false;
}

var isNumber = exports.isNumber = function(str, dotPos) {
    if (dotPos) {
        str = str.slice(dotPos-1, dotPos+2);
    }

    return !isNaN(str);
};

// Phone number matching
// http://stackoverflow.com/a/123666/951517
exports.isPhoneNr = function(str) {
    return str.match(/^(?:(?:\+?1\s*(?:[.-]\s*)?)?(?:\(\s*([2-9]1[02-9]|[2-9][02-8]1|[2-9][02-8][02-9])\s*\)|([2-9]1[02-9]|[2-9][02-8]1|[2-9][02-8][02-9]))\s*(?:[.-]\s*)?)?([2-9]1[02-9]|[2-9][02-9]1|[2-9][02-9]{2})\s*(?:[.-]\s*)?([0-9]{4})(?:\s*(?:#|x\.?|ext\.?|extension)\s*(\d+))?$/);
};

// Match urls / emails
// http://stackoverflow.com/a/3809435/951517
exports.isURL = function(str) {
    return str.match(/[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/);
};

// Starting a new sentence if beginning with capital letter
// Exception: The word is enclosed in brackets
exports.isConcatenated = function(word) {
    var i = 0;

    if ((i = word.indexOf(".")) > -1 ||
        (i = word.indexOf("!")) > -1 ||
        (i = word.indexOf("?")) > -1)
    {
        var c = word.charAt(i + 1);

        // Check if the next word starts with a letter
        if (c.match(/[a-zA-Z].*/)) {
            return [word.slice(0, i), word.slice(i+1)];
        }
    }

    return false;
};

exports.isBoundaryChar = function(word) {
    return word === "." ||
           word === "!" ||
           word === "?";
};

},{}],2:[function(require,module,exports){

module.exports = function sanitizeHtml(text, opts) {
  // Strip HTML from Text using browser HTML parser
  if ((typeof text == 'string' || text instanceof String) && typeof document !== "undefined") {
    var $div = document.createElement("DIV");
    $div.innerHTML = text;
    text = ($div.textContent || '').trim();
  }
  //DOM Object
  else if (typeof text === 'object' && text.textContent) {
    text = (text.textContent || '').trim();
  }

  return text;
};

},{}],3:[function(require,module,exports){
const tokenizer = require('../lib/tokenizer');
var async_mutex_1 = require('async-mutex');


var SentenceDetector = /** @class */ (function () {
    function SentenceDetector(handler, single_response) {
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

    SentenceDetector.prototype.feed = function (text) {
        return __awaiter(this, void 0, void 0, function () {
            var sentences, sentence;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.mutex.runExclusive(function () { return __awaiter(void 0, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                this.buffer += text;
                                if (this.single_response) {
                                    return [2 /*return*/];
                                }
                                sentences = tokenizer.sentences(this.buffer, this.options);
                                if (sentences.length > 1) {
                                    sentence = sentences[0];
                                    this.buffer = sentences[1];
                                    this.handler(sentence);
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

    SentenceDetector.prototype.flush = function () {
        var _this = this;
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.mutex.runExclusive(function () { return __awaiter(void 0, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                if (_this.buffer.length > 0) {
                                    _this.handler(this.buffer);
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
    return SentenceDetector;
}());

exports.SentenceDetector = SentenceDetector;
},{"../lib/tokenizer":5,"async-mutex":9}],4:[function(require,module,exports){

exports.endsWithChar = function ends_with_char(word, c) {
    if (c.length > 1) {
        return c.indexOf(word.slice(-1)) > -1;
    }

    return word.slice(-1) === c;
};

exports.endsWith = function ends_with(word, end) {
    return word.slice(word.length - end.length) === end;
};
},{}],5:[function(require,module,exports){
/*jshint node:true, laxcomma:true */

var sanitizeHtml = require("sanitize-html");

var { SentenceDetector } = require('./stream-tokenizer');
var stringHelper = require("./stringHelper");
var Match  = require("./Match");

var newline_placeholder = " @~@ ";
var newline_placeholder_t = newline_placeholder.trim();


var whiteSpaceCheck = new RegExp("\\S", "");
var addNewLineBoundaries = new RegExp("\\n+|[-#=_+*]{4,}", "g");
var splitIntoWords = new RegExp("\\S+|\\n", "g");

exports.SentenceDetector = SentenceDetector;

// Split the entry into sentences.
exports.sentences = function(text, user_options) {
    if (!text || typeof text !== "string" || !text.length) {
        return [];
    }

    if (!whiteSpaceCheck.test(text)) {
      // whitespace-only string has no sentences
      return [];
    }

    var options = {
        "newline_boundaries"  : false,
        "html_boundaries"     : false,
        "html_boundaries_tags": ["p","div","ul","ol"],
        "sanitize"            : false,
        "allowed_tags"        : false,
        "preserve_whitespace" : false,
        "abbreviations"       : null
    };

    if (typeof user_options === "boolean") {
        // Deprecated quick option
        options.newline_boundaries = true;
    }
    else {
        // Extend options
        for (var k in user_options) {
            options[k] = user_options[k];
        }
    }

    Match.setAbbreviations(options.abbreviations);

    if (options.newline_boundaries) {
        text = text.replace(addNewLineBoundaries, newline_placeholder);
    }

    if (options.html_boundaries) {
        var html_boundaries_regexp = "(<br\\s*\\/?>|<\\/(" + options.html_boundaries_tags.join("|") + ")>)";
        var re = new RegExp(html_boundaries_regexp, "g");
        text = text.replace(re, "$1" + newline_placeholder);
    }

    if (options.sanitize || options.allowed_tags) {
        if (! options.allowed_tags) {
            options.allowed_tags = [""];
        }

        text = sanitizeHtml(text, { "allowedTags" : options.allowed_tags });
    }


    // Split the text into words
    var words;
    var tokens;

    // Split the text into words
    if (options.preserve_whitespace) {
        // <br> tags are the odd man out, as whitespace is allowed inside the tag
        tokens = text.split(/(<br\s*\/?>|\S+|\n+)/);

        // every other token is a word
        words = tokens.filter(function (token, ii) {
          return ii % 2;
        });
    }
    else {
        // - see http://blog.tompawlak.org/split-string-into-tokens-javascript
        words = text.trim().match(splitIntoWords);
    }


    var wordCount = 0;
    var index = 0;
    var temp  = [];
    var sentences = [];
    var current   = [];

    // If given text is only whitespace (or nothing of \S+)
    if (!words || !words.length) {
        return [];
    }

    for (var i=0, L=words.length; i < L; i++) {
        wordCount++;

        // Add the word to current sentence
        current.push(words[i]);

        // Sub-sentences, reset counter
        if (~words[i].indexOf(",")) {
            wordCount = 0;
        }

        if (Match.isBoundaryChar(words[i]) || stringHelper.endsWithChar(words[i], "?!") || words[i] === newline_placeholder_t) {
            if ((options.newline_boundaries || options.html_boundaries) && words[i] === newline_placeholder_t) {
                current.pop();
            }

            sentences.push(current);

            wordCount = 0;
            current   = [];

            continue;
        }


        if (stringHelper.endsWithChar(words[i], "\"") || stringHelper.endsWithChar(words[i], "”")) {
            words[i] = words[i].slice(0, -1);
        }

        // A dot might indicate the end sentences
        // Exception: The next sentence starts with a word (non abbreviation)
        //            that has a capital letter.
        if (stringHelper.endsWithChar(words[i], ".")) {
            // Check if there is a next word
            // This probably needs to be improved with machine learning
            if (i+1 < L) {
                // Single character abbr.
                if (words[i].length === 2 && isNaN(words[i].charAt(0))) {
                    continue;
                }

                // Common abbr. that often do not end sentences
                if (Match.isCommonAbbreviation(words[i])) {
                    continue;
                }

                // Next word starts with capital word, but current sentence is
                // quite short
                if (Match.isSentenceStarter(words[i+1])) {
                    if (Match.isTimeAbbreviation(words[i], words[i+1])) {
                        continue;
                    }

                    // Dealing with names at the start of sentences
                    if (Match.isNameAbbreviation(wordCount, words.slice(i, 6))) {
                        continue;
                    }

                    if (Match.isNumber(words[i+1])) {
                        if (Match.isCustomAbbreviation(words[i])) {
                            continue;
                        }
                    }
                }
                else {
                    // Skip ellipsis
                    if (stringHelper.endsWith(words[i], "..")) {
                        continue;
                    }

                    //// Skip abbreviations
                    // Short words + dot or a dot after each letter
                    if (Match.isDottedAbbreviation(words[i])) {
                        continue;
                    }

                    if (Match.isNameAbbreviation(wordCount, words.slice(i, 5))) {
                        continue;
                    }
                }
            }

            sentences.push(current);
            current   = [];
            wordCount = 0;

            continue;
        }

        // Check if the word has a dot in it
        if ((index = words[i].indexOf(".")) > -1) {
            if (Match.isNumber(words[i], index)) {
                continue;
            }

            // Custom dotted abbreviations (like K.L.M or I.C.T)
            if (Match.isDottedAbbreviation(words[i])) {
                continue;
            }

            // Skip urls / emails and the like
            if (Match.isURL(words[i]) || Match.isPhoneNr(words[i])) {
                continue;
            }
        }

        if (temp = Match.isConcatenated(words[i])) {
            current.pop();
            current.push(temp[0]);
            sentences.push(current);

            current = [];
            wordCount = 0;
            current.push(temp[1]);
        }
    }

    if (current.length) {
        sentences.push(current);
    }


    // Clear "empty" sentences
    sentences = sentences.filter(function(s) {
        return s.length > 0;
    });

    var result = sentences.slice(1).reduce(function (out, sentence) {
      var lastSentence = out[out.length - 1];

      // Single words, could be "enumeration lists"
      if (lastSentence.length === 1 && /^.{1,2}[.]$/.test(lastSentence[0])) {
          // Check if there is a next sentence
          // It should not be another list item
          if (!/[.]/.test(sentence[0])) {
              out.pop()
              out.push(lastSentence.concat(sentence));
              return out;
          }
      }

      out.push(sentence);

      return out;
    }, [ sentences[0] ]);

    // join tokens back together
    return result.map(function (sentence, ii) {
      if (options.preserve_whitespace && !options.newline_boundaries && !options.html_boundaries) {
        // tokens looks like so: [leading-space token, non-space token, space
        // token, non-space token, space token... ]. In other words, the first
        // item is the leading space (or the empty string), and the rest of
        // the tokens are [non-space, space] token pairs.
        var tokenCount = sentence.length * 2;

        if (ii === 0) {
          tokenCount += 1;
        }

        return tokens.splice(0, tokenCount).join("");
      }

      return sentence.join(" ");
    });
};

},{"./Match":1,"./stream-tokenizer":3,"./stringHelper":4,"sanitize-html":2}],6:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var Semaphore_1 = require("./Semaphore");
var Mutex = /** @class */ (function () {
    function Mutex(cancelError) {
        this._semaphore = new Semaphore_1.default(1, cancelError);
    }
    Mutex.prototype.acquire = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var _a, releaser;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this._semaphore.acquire()];
                    case 1:
                        _a = _b.sent(), releaser = _a[1];
                        return [2 /*return*/, releaser];
                }
            });
        });
    };
    Mutex.prototype.runExclusive = function (callback) {
        return this._semaphore.runExclusive(function () { return callback(); });
    };
    Mutex.prototype.isLocked = function () {
        return this._semaphore.isLocked();
    };
    Mutex.prototype.waitForUnlock = function () {
        return this._semaphore.waitForUnlock();
    };
    Mutex.prototype.release = function () {
        if (this._semaphore.isLocked())
            this._semaphore.release();
    };
    Mutex.prototype.cancel = function () {
        return this._semaphore.cancel();
    };
    return Mutex;
}());
exports.default = Mutex;

},{"./Semaphore":7,"tslib":12}],7:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var errors_1 = require("./errors");
var Semaphore = /** @class */ (function () {
    function Semaphore(_value, _cancelError) {
        if (_cancelError === void 0) { _cancelError = errors_1.E_CANCELED; }
        this._value = _value;
        this._cancelError = _cancelError;
        this._weightedQueues = [];
        this._weightedWaiters = [];
    }
    Semaphore.prototype.acquire = function (weight) {
        var _this = this;
        if (weight === void 0) { weight = 1; }
        if (weight <= 0)
            throw new Error("invalid weight ".concat(weight, ": must be positive"));
        return new Promise(function (resolve, reject) {
            if (!_this._weightedQueues[weight - 1])
                _this._weightedQueues[weight - 1] = [];
            _this._weightedQueues[weight - 1].push({ resolve: resolve, reject: reject });
            _this._dispatch();
        });
    };
    Semaphore.prototype.runExclusive = function (callback, weight) {
        if (weight === void 0) { weight = 1; }
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var _a, value, release;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.acquire(weight)];
                    case 1:
                        _a = _b.sent(), value = _a[0], release = _a[1];
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, , 4, 5]);
                        return [4 /*yield*/, callback(value)];
                    case 3: return [2 /*return*/, _b.sent()];
                    case 4:
                        release();
                        return [7 /*endfinally*/];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    Semaphore.prototype.waitForUnlock = function (weight) {
        var _this = this;
        if (weight === void 0) { weight = 1; }
        if (weight <= 0)
            throw new Error("invalid weight ".concat(weight, ": must be positive"));
        return new Promise(function (resolve) {
            if (!_this._weightedWaiters[weight - 1])
                _this._weightedWaiters[weight - 1] = [];
            _this._weightedWaiters[weight - 1].push(resolve);
            _this._dispatch();
        });
    };
    Semaphore.prototype.isLocked = function () {
        return this._value <= 0;
    };
    Semaphore.prototype.getValue = function () {
        return this._value;
    };
    Semaphore.prototype.setValue = function (value) {
        this._value = value;
        this._dispatch();
    };
    Semaphore.prototype.release = function (weight) {
        if (weight === void 0) { weight = 1; }
        if (weight <= 0)
            throw new Error("invalid weight ".concat(weight, ": must be positive"));
        this._value += weight;
        this._dispatch();
    };
    Semaphore.prototype.cancel = function () {
        var _this = this;
        this._weightedQueues.forEach(function (queue) { return queue.forEach(function (entry) { return entry.reject(_this._cancelError); }); });
        this._weightedQueues = [];
    };
    Semaphore.prototype._dispatch = function () {
        var _a;
        for (var weight = this._value; weight > 0; weight--) {
            var queueEntry = (_a = this._weightedQueues[weight - 1]) === null || _a === void 0 ? void 0 : _a.shift();
            if (!queueEntry)
                continue;
            var previousValue = this._value;
            var previousWeight = weight;
            this._value -= weight;
            weight = this._value + 1;
            queueEntry.resolve([previousValue, this._newReleaser(previousWeight)]);
        }
        this._drainUnlockWaiters();
    };
    Semaphore.prototype._newReleaser = function (weight) {
        var _this = this;
        var called = false;
        return function () {
            if (called)
                return;
            called = true;
            _this.release(weight);
        };
    };
    Semaphore.prototype._drainUnlockWaiters = function () {
        for (var weight = this._value; weight > 0; weight--) {
            if (!this._weightedWaiters[weight - 1])
                continue;
            this._weightedWaiters[weight - 1].forEach(function (waiter) { return waiter(); });
            this._weightedWaiters[weight - 1] = [];
        }
    };
    return Semaphore;
}());
exports.default = Semaphore;

},{"./errors":8,"tslib":12}],8:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.E_CANCELED = exports.E_ALREADY_LOCKED = exports.E_TIMEOUT = void 0;
exports.E_TIMEOUT = new Error('timeout while waiting for mutex to become available');
exports.E_ALREADY_LOCKED = new Error('mutex already locked');
exports.E_CANCELED = new Error('request for lock canceled');

},{}],9:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tryAcquire = exports.withTimeout = exports.Semaphore = exports.Mutex = void 0;
var tslib_1 = require("tslib");
var Mutex_1 = require("./Mutex");
Object.defineProperty(exports, "Mutex", { enumerable: true, get: function () { return Mutex_1.default; } });
var Semaphore_1 = require("./Semaphore");
Object.defineProperty(exports, "Semaphore", { enumerable: true, get: function () { return Semaphore_1.default; } });
var withTimeout_1 = require("./withTimeout");
Object.defineProperty(exports, "withTimeout", { enumerable: true, get: function () { return withTimeout_1.withTimeout; } });
var tryAcquire_1 = require("./tryAcquire");
Object.defineProperty(exports, "tryAcquire", { enumerable: true, get: function () { return tryAcquire_1.tryAcquire; } });
tslib_1.__exportStar(require("./errors"), exports);

},{"./Mutex":6,"./Semaphore":7,"./errors":8,"./tryAcquire":10,"./withTimeout":11,"tslib":12}],10:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tryAcquire = void 0;
var errors_1 = require("./errors");
var withTimeout_1 = require("./withTimeout");
// eslint-disable-next-lisne @typescript-eslint/explicit-module-boundary-types
function tryAcquire(sync, alreadyAcquiredError) {
    if (alreadyAcquiredError === void 0) { alreadyAcquiredError = errors_1.E_ALREADY_LOCKED; }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (0, withTimeout_1.withTimeout)(sync, 0, alreadyAcquiredError);
}
exports.tryAcquire = tryAcquire;

},{"./errors":8,"./withTimeout":11}],11:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.withTimeout = void 0;
var tslib_1 = require("tslib");
/* eslint-disable @typescript-eslint/no-explicit-any */
var errors_1 = require("./errors");
function withTimeout(sync, timeout, timeoutError) {
    var _this = this;
    if (timeoutError === void 0) { timeoutError = errors_1.E_TIMEOUT; }
    return {
        acquire: function (weight) {
            if (weight !== undefined && weight <= 0) {
                throw new Error("invalid weight ".concat(weight, ": must be positive"));
            }
            return new Promise(function (resolve, reject) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                var isTimeout, handle, ticket, release, e_1;
                return tslib_1.__generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            isTimeout = false;
                            handle = setTimeout(function () {
                                isTimeout = true;
                                reject(timeoutError);
                            }, timeout);
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 3, , 4]);
                            return [4 /*yield*/, sync.acquire(weight)];
                        case 2:
                            ticket = _a.sent();
                            if (isTimeout) {
                                release = Array.isArray(ticket) ? ticket[1] : ticket;
                                release();
                            }
                            else {
                                clearTimeout(handle);
                                resolve(ticket);
                            }
                            return [3 /*break*/, 4];
                        case 3:
                            e_1 = _a.sent();
                            if (!isTimeout) {
                                clearTimeout(handle);
                                reject(e_1);
                            }
                            return [3 /*break*/, 4];
                        case 4: return [2 /*return*/];
                    }
                });
            }); });
        },
        runExclusive: function (callback, weight) {
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                var release, ticket;
                return tslib_1.__generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            release = function () { return undefined; };
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, , 7, 8]);
                            return [4 /*yield*/, this.acquire(weight)];
                        case 2:
                            ticket = _a.sent();
                            if (!Array.isArray(ticket)) return [3 /*break*/, 4];
                            release = ticket[1];
                            return [4 /*yield*/, callback(ticket[0])];
                        case 3: return [2 /*return*/, _a.sent()];
                        case 4:
                            release = ticket;
                            return [4 /*yield*/, callback()];
                        case 5: return [2 /*return*/, _a.sent()];
                        case 6: return [3 /*break*/, 8];
                        case 7:
                            release();
                            return [7 /*endfinally*/];
                        case 8: return [2 /*return*/];
                    }
                });
            });
        },
        release: function (weight) {
            sync.release(weight);
        },
        cancel: function () {
            return sync.cancel();
        },
        waitForUnlock: function (weight) {
            if (weight !== undefined && weight <= 0) {
                throw new Error("invalid weight ".concat(weight, ": must be positive"));
            }
            return new Promise(function (resolve, reject) {
                sync.waitForUnlock(weight).then(resolve);
                setTimeout(function () { return reject(timeoutError); }, timeout);
            });
        },
        isLocked: function () { return sync.isLocked(); },
        getValue: function () { return sync.getValue(); },
        setValue: function (value) { return sync.setValue(value); },
    };
}
exports.withTimeout = withTimeout;

},{"./errors":8,"tslib":12}],12:[function(require,module,exports){
(function (global){(function (){
/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
/* global global, define, Symbol, Reflect, Promise, SuppressedError */
var __extends;
var __assign;
var __rest;
var __decorate;
var __param;
var __esDecorate;
var __runInitializers;
var __propKey;
var __setFunctionName;
var __metadata;
var __awaiter;
var __generator;
var __exportStar;
var __values;
var __read;
var __spread;
var __spreadArrays;
var __spreadArray;
var __await;
var __asyncGenerator;
var __asyncDelegator;
var __asyncValues;
var __makeTemplateObject;
var __importStar;
var __importDefault;
var __classPrivateFieldGet;
var __classPrivateFieldSet;
var __classPrivateFieldIn;
var __createBinding;
var __addDisposableResource;
var __disposeResources;
(function (factory) {
    var root = typeof global === "object" ? global : typeof self === "object" ? self : typeof this === "object" ? this : {};
    if (typeof define === "function" && define.amd) {
        define("tslib", ["exports"], function (exports) { factory(createExporter(root, createExporter(exports))); });
    }
    else if (typeof module === "object" && typeof module.exports === "object") {
        factory(createExporter(root, createExporter(module.exports)));
    }
    else {
        factory(createExporter(root));
    }
    function createExporter(exports, previous) {
        if (exports !== root) {
            if (typeof Object.create === "function") {
                Object.defineProperty(exports, "__esModule", { value: true });
            }
            else {
                exports.__esModule = true;
            }
        }
        return function (id, v) { return exports[id] = previous ? previous(id, v) : v; };
    }
})
(function (exporter) {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };

    __extends = function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };

    __assign = Object.assign || function (t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
    };

    __rest = function (s, e) {
        var t = {};
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
            t[p] = s[p];
        if (s != null && typeof Object.getOwnPropertySymbols === "function")
            for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
                if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                    t[p[i]] = s[p[i]];
            }
        return t;
    };

    __decorate = function (decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };

    __param = function (paramIndex, decorator) {
        return function (target, key) { decorator(target, key, paramIndex); }
    };

    __esDecorate = function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
        function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
        var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
        var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
        var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
        var _, done = false;
        for (var i = decorators.length - 1; i >= 0; i--) {
            var context = {};
            for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
            for (var p in contextIn.access) context.access[p] = contextIn.access[p];
            context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
            var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
            if (kind === "accessor") {
                if (result === void 0) continue;
                if (result === null || typeof result !== "object") throw new TypeError("Object expected");
                if (_ = accept(result.get)) descriptor.get = _;
                if (_ = accept(result.set)) descriptor.set = _;
                if (_ = accept(result.init)) initializers.unshift(_);
            }
            else if (_ = accept(result)) {
                if (kind === "field") initializers.unshift(_);
                else descriptor[key] = _;
            }
        }
        if (target) Object.defineProperty(target, contextIn.name, descriptor);
        done = true;
    };

    __runInitializers = function (thisArg, initializers, value) {
        var useValue = arguments.length > 2;
        for (var i = 0; i < initializers.length; i++) {
            value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
        }
        return useValue ? value : void 0;
    };

    __propKey = function (x) {
        return typeof x === "symbol" ? x : "".concat(x);
    };

    __setFunctionName = function (f, name, prefix) {
        if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
        return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
    };

    __metadata = function (metadataKey, metadataValue) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(metadataKey, metadataValue);
    };

    __awaiter = function (thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    };

    __generator = function (thisArg, body) {
        var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
        return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
        function verb(n) { return function (v) { return step([n, v]); }; }
        function step(op) {
            if (f) throw new TypeError("Generator is already executing.");
            while (g && (g = 0, op[0] && (_ = 0)), _) try {
                if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
                if (y = 0, t) op = [op[0] & 2, t.value];
                switch (op[0]) {
                    case 0: case 1: t = op; break;
                    case 4: _.label++; return { value: op[1], done: false };
                    case 5: _.label++; y = op[1]; op = [0]; continue;
                    case 7: op = _.ops.pop(); _.trys.pop(); continue;
                    default:
                        if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                        if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                        if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                        if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                        if (t[2]) _.ops.pop();
                        _.trys.pop(); continue;
                }
                op = body.call(thisArg, _);
            } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
            if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
        }
    };

    __exportStar = function(m, o) {
        for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(o, p)) __createBinding(o, m, p);
    };

    __createBinding = Object.create ? (function(o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
            desc = { enumerable: true, get: function() { return m[k]; } };
        }
        Object.defineProperty(o, k2, desc);
    }) : (function(o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
    });

    __values = function (o) {
        var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
        if (m) return m.call(o);
        if (o && typeof o.length === "number") return {
            next: function () {
                if (o && i >= o.length) o = void 0;
                return { value: o && o[i++], done: !o };
            }
        };
        throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
    };

    __read = function (o, n) {
        var m = typeof Symbol === "function" && o[Symbol.iterator];
        if (!m) return o;
        var i = m.call(o), r, ar = [], e;
        try {
            while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
        }
        catch (error) { e = { error: error }; }
        finally {
            try {
                if (r && !r.done && (m = i["return"])) m.call(i);
            }
            finally { if (e) throw e.error; }
        }
        return ar;
    };

    /** @deprecated */
    __spread = function () {
        for (var ar = [], i = 0; i < arguments.length; i++)
            ar = ar.concat(__read(arguments[i]));
        return ar;
    };

    /** @deprecated */
    __spreadArrays = function () {
        for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
        for (var r = Array(s), k = 0, i = 0; i < il; i++)
            for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
                r[k] = a[j];
        return r;
    };

    __spreadArray = function (to, from, pack) {
        if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
            if (ar || !(i in from)) {
                if (!ar) ar = Array.prototype.slice.call(from, 0, i);
                ar[i] = from[i];
            }
        }
        return to.concat(ar || Array.prototype.slice.call(from));
    };

    __await = function (v) {
        return this instanceof __await ? (this.v = v, this) : new __await(v);
    };

    __asyncGenerator = function (thisArg, _arguments, generator) {
        if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
        var g = generator.apply(thisArg, _arguments || []), i, q = [];
        return i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i;
        function verb(n) { if (g[n]) i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; }
        function resume(n, v) { try { step(g[n](v)); } catch (e) { settle(q[0][3], e); } }
        function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r);  }
        function fulfill(value) { resume("next", value); }
        function reject(value) { resume("throw", value); }
        function settle(f, v) { if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]); }
    };

    __asyncDelegator = function (o) {
        var i, p;
        return i = {}, verb("next"), verb("throw", function (e) { throw e; }), verb("return"), i[Symbol.iterator] = function () { return this; }, i;
        function verb(n, f) { i[n] = o[n] ? function (v) { return (p = !p) ? { value: __await(o[n](v)), done: false } : f ? f(v) : v; } : f; }
    };

    __asyncValues = function (o) {
        if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
        var m = o[Symbol.asyncIterator], i;
        return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
        function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
        function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
    };

    __makeTemplateObject = function (cooked, raw) {
        if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
        return cooked;
    };

    var __setModuleDefault = Object.create ? (function(o, v) {
        Object.defineProperty(o, "default", { enumerable: true, value: v });
    }) : function(o, v) {
        o["default"] = v;
    };

    __importStar = function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
        __setModuleDefault(result, mod);
        return result;
    };

    __importDefault = function (mod) {
        return (mod && mod.__esModule) ? mod : { "default": mod };
    };

    __classPrivateFieldGet = function (receiver, state, kind, f) {
        if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
        if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
        return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
    };

    __classPrivateFieldSet = function (receiver, state, value, kind, f) {
        if (kind === "m") throw new TypeError("Private method is not writable");
        if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
        if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
        return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
    };

    __classPrivateFieldIn = function (state, receiver) {
        if (receiver === null || (typeof receiver !== "object" && typeof receiver !== "function")) throw new TypeError("Cannot use 'in' operator on non-object");
        return typeof state === "function" ? receiver === state : state.has(receiver);
    };

    __addDisposableResource = function (env, value, async) {
        if (value !== null && value !== void 0) {
            if (typeof value !== "object" && typeof value !== "function") throw new TypeError("Object expected.");
            var dispose;
            if (async) {
                if (!Symbol.asyncDispose) throw new TypeError("Symbol.asyncDispose is not defined.");
                dispose = value[Symbol.asyncDispose];
            }
            if (dispose === void 0) {
                if (!Symbol.dispose) throw new TypeError("Symbol.dispose is not defined.");
                dispose = value[Symbol.dispose];
            }
            if (typeof dispose !== "function") throw new TypeError("Object not disposable.");
            env.stack.push({ value: value, dispose: dispose, async: async });
        }
        else if (async) {
            env.stack.push({ async: true });
        }
        return value;
    };

    var _SuppressedError = typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
        var e = new Error(message);
        return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
    };

    __disposeResources = function (env) {
        function fail(e) {
            env.error = env.hasError ? new _SuppressedError(e, env.error, "An error was suppressed during disposal.") : e;
            env.hasError = true;
        }
        function next() {
            while (env.stack.length) {
                var rec = env.stack.pop();
                try {
                    var result = rec.dispose && rec.dispose.call(rec.value);
                    if (rec.async) return Promise.resolve(result).then(next, function(e) { fail(e); return next(); });
                }
                catch (e) {
                    fail(e);
                }
            }
            if (env.hasError) throw env.error;
        }
        return next();
    };

    exporter("__extends", __extends);
    exporter("__assign", __assign);
    exporter("__rest", __rest);
    exporter("__decorate", __decorate);
    exporter("__param", __param);
    exporter("__esDecorate", __esDecorate);
    exporter("__runInitializers", __runInitializers);
    exporter("__propKey", __propKey);
    exporter("__setFunctionName", __setFunctionName);
    exporter("__metadata", __metadata);
    exporter("__awaiter", __awaiter);
    exporter("__generator", __generator);
    exporter("__exportStar", __exportStar);
    exporter("__createBinding", __createBinding);
    exporter("__values", __values);
    exporter("__read", __read);
    exporter("__spread", __spread);
    exporter("__spreadArrays", __spreadArrays);
    exporter("__spreadArray", __spreadArray);
    exporter("__await", __await);
    exporter("__asyncGenerator", __asyncGenerator);
    exporter("__asyncDelegator", __asyncDelegator);
    exporter("__asyncValues", __asyncValues);
    exporter("__makeTemplateObject", __makeTemplateObject);
    exporter("__importStar", __importStar);
    exporter("__importDefault", __importDefault);
    exporter("__classPrivateFieldGet", __classPrivateFieldGet);
    exporter("__classPrivateFieldSet", __classPrivateFieldSet);
    exporter("__classPrivateFieldIn", __classPrivateFieldIn);
    exporter("__addDisposableResource", __addDisposableResource);
    exporter("__disposeResources", __disposeResources);
});

}).call(this)}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}]},{},[5])(5)
});
