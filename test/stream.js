/*jshint node:true, laxcomma:true */
/*global describe:true, it:true */
"use strict";

const assert = require('assert');
const sbd = require('../lib/tokenizer');

describe('>>>> Stream sentences', function () {
    describe('Skip dotted abbreviations', function () {
        const entry = "Lorem ipsum, dolor sed amat frequentor minimus In I.C.T we have multiple U.S. challenges! There should only be two sentences.";

        var sentences = [];
        const detector = new sbd.streamDetector((sentence) => {
            sentences.push(sentence);
        });

        // feed char by char from entry to detector
        for (let i = 0; i < entry.length; i++) {
            detector.feed(entry[i]);
        }

        detector.flush();


        it("should get 2 sentences", function () {
            assert.equal(sentences.length, 2);
        });
    });

});

describe('>>>> Stream URLs', function () {
    describe('Skip dotted abbreviations', function () {
        // text with a URL
        const entry = "Lorem ipsum, https://www.google.com dolor sed amat frequentor minimus. In I.C.T we have multiple U.S. challenges!";

        var sentences = [];
        const detector = new sbd.streamDetector((sentence) => {
            sentences.push(sentence);
        });

        // feed char by char from entry to detector
        for (let i = 0; i < entry.length; i++) {
            detector.feed(entry[i]);
        }

        detector.flush();


        it("should get 2 sentences", function () {
            assert.equal(sentences.length, 2);
        });
    });

});

