/* 
 * QR Code generator library (JavaScript)
 * 
 * Copyright (c) Project Nayuki. (MIT License)
 * https://www.nayuki.io/page/qr-code-generator-library
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 * - The above copyright notice and this permission notice shall be included in
 *   all copies or substantial portions of the Software.
 * - The Software is provided "as is", without warranty of any kind, express or
 *   implied, including but not limited to the warranties of merchantability,
 *   fitness for a particular purpose and noninfringement. In no event shall the
 *   authors or copyright holders be liable for any claim, damages or other
 *   liability, whether in an action of contract, tort or otherwise, arising from,
 *   out of or in connection with the Software or the use or other dealings in the
 *   Software.
 */

"use strict";

var qrcodegen = new function() {
	
	// ---- QR Code symbol class ----
	
	// Creates a new QR Code with the given version number,
	// error correction level, data codeword bytes, and mask number.
	this.QrCode = function(version, errorCorrectionLevel, dataCodewords, msk) {
		
		// The version number of this QR Code, which is between 1 and 40 (inclusive).
		Object.defineProperty(this, "version", {value:version, enumerable:true});
		
		// The width and height of this QR Code, measured in modules, between 21 and 177 (inclusive).
		Object.defineProperty(this, "size", {value:version * 4 + 17, enumerable:true});
		
		// The error correction level used in this QR Code.
		Object.defineProperty(this, "errorCorrectionLevel", {value:errorCorrectionLevel, enumerable:true});
		
		// The index of the mask pattern used in this QR Code, which is between 0 and 7 (inclusive).
		Object.defineProperty(this, "mask", {value:msk, enumerable:true});
		
		// The modules of this QR Code (false = light, true = dark).
		var modules = [];
		var isFunction = [];
		var size = this.size;
		var that = this;
		
		// Initialize arrays
		for (var i = 0; i < size * size; i++) {
			modules.push(false);
			isFunction.push(false);
		}
		
		// Draw function patterns, codewords, do masking
		drawFunctionPatterns();
		var allCodewords = addEccAndInterleave(dataCodewords);
		drawCodewords(allCodewords);
		
		// Handle masking
		if (msk == -1) {  // Automatically choose best mask
			var minPenalty = 1000000000;
			for (var i = 0; i < 8; i++) {
				applyMask(i);
				drawFormatBits(i);
				var penalty = getPenaltyScore();
				if (penalty < minPenalty) {
					msk = i;
					minPenalty = penalty;
				}
				applyMask(i);  // Undoes the mask due to XOR
			}
		}
		if (msk < 0 || msk > 7)
			throw new RangeError("Mask value out of range");
		applyMask(msk);  // Apply the final choice of mask
		drawFormatBits(msk);  // Overwrite old format bits
		
		isFunction = null;
		
		// Returns the color of the module (pixel) at the given coordinates
		this.getModule = function(x, y) {
			return 0 <= x && x < size && 0 <= y && y < size && modules[y * size + x];
		};
		
		// Draws function patterns
		function drawFunctionPatterns() {
			// Draw horizontal and vertical timing patterns
			for (var i = 0; i < size; i++) {
				setFunctionModule(6, i, i % 2 == 0);
				setFunctionModule(i, 6, i % 2 == 0);
			}
			
			// Draw 3 finder patterns
			drawFinderPattern(3, 3);
			drawFinderPattern(size - 4, 3);
			drawFinderPattern(3, size - 4);
			
			// Draw numerous alignment patterns
			var alignPatPos = getAlignmentPatternPositions();
			var numAlign = alignPatPos.length;
			for (var i = 0; i < numAlign; i++) {
				for (var j = 0; j < numAlign; j++) {
					if (!(i == 0 && j == 0 || i == 0 && j == numAlign - 1 || i == numAlign - 1 && j == 0))
						drawAlignmentPattern(alignPatPos[i], alignPatPos[j]);
				}
			}
			
			// Draw configuration data
			drawFormatBits(0);  // Dummy mask value; overwritten later
			drawVersion();
		}
		
		function drawFormatBits(msk) {
			var data = errorCorrectionLevel.formatBits << 3 | msk;
			var rem = data;
			for (var i = 0; i < 10; i++)
				rem = (rem << 1) ^ ((rem >>> 9) * 0x537);
			var bits = (data << 10 | rem) ^ 0x5412;
			
			// Draw first copy
			for (var i = 0; i <= 5; i++)
				setFunctionModule(8, i, getBit(bits, i));
			setFunctionModule(8, 7, getBit(bits, 6));
			setFunctionModule(8, 8, getBit(bits, 7));
			setFunctionModule(7, 8, getBit(bits, 8));
			for (var i = 9; i < 15; i++)
				setFunctionModule(14 - i, 8, getBit(bits, i));
			
			// Draw second copy
			for (var i = 0; i < 8; i++)
				setFunctionModule(size - 1 - i, 8, getBit(bits, i));
			for (var i = 8; i < 15; i++)
				setFunctionModule(8, size - 15 + i, getBit(bits, i));
			setFunctionModule(8, size - 8, true);  // Always dark
		}
		
		function drawVersion() {
			if (version < 7)
				return;
			
			var rem = version;
			for (var i = 0; i < 12; i++)
				rem = (rem << 1) ^ ((rem >>> 11) * 0x1F25);
			var bits = version << 12 | rem;
			
			// Draw two copies
			for (var i = 0; i < 18; i++) {
				var color = getBit(bits, i);
				var a = size - 11 + i % 3;
				var b = Math.floor(i / 3);
				setFunctionModule(a, b, color);
				setFunctionModule(b, a, color);
			}
		}
		
		function drawFinderPattern(x, y) {
			for (var dy = -4; dy <= 4; dy++) {
				for (var dx = -4; dx <= 4; dx++) {
					var dist = Math.max(Math.abs(dx), Math.abs(dy));
					var xx = x + dx, yy = y + dy;
					if (0 <= xx && xx < size && 0 <= yy && yy < size)
						setFunctionModule(xx, yy, dist != 2 && dist != 4);
				}
			}
		}
		
		function drawAlignmentPattern(x, y) {
			for (var dy = -2; dy <= 2; dy++) {
				for (var dx = -2; dx <= 2; dx++)
					setFunctionModule(x + dx, y + dy, Math.max(Math.abs(dx), Math.abs(dy)) != 1);
			}
		}
		
		function setFunctionModule(x, y, isDark) {
			modules[y * size + x] = isDark;
			isFunction[y * size + x] = true;
		}
		
		function addEccAndInterleave(data) {
			var numBlocks = NUM_ERROR_CORRECTION_BLOCKS[errorCorrectionLevel.ordinal][version];
			var blockEccLen = ECC_CODEWORDS_PER_BLOCK[errorCorrectionLevel.ordinal][version];
			var rawCodewords = Math.floor(getNumRawDataModules(version) / 8);
			var numShortBlocks = numBlocks - rawCodewords % numBlocks;
			var shortBlockLen = Math.floor(rawCodewords / numBlocks);
			
			var blocks = [];
			var rsDiv = reedSolomonComputeDivisor(blockEccLen);
			for (var i = 0, k = 0; i < numBlocks; i++) {
				var dat = data.slice(k, k + shortBlockLen - blockEccLen + (i < numShortBlocks ? 0 : 1));
				k += dat.length;
				var ecc = reedSolomonComputeRemainder(dat, rsDiv);
				if (i < numShortBlocks)
					dat.push(0);
				blocks.push(dat.concat(ecc));
			}
			
			var result = [];
			for (var i = 0; i < blocks[0].length; i++) {
				blocks.forEach(function(block, j) {
					if (i != shortBlockLen - blockEccLen || j >= numShortBlocks)
						result.push(block[i]);
				});
			}
			return result;
		}
		
		function drawCodewords(data) {
			var i = 0;
			for (var right = size - 1; right >= 1; right -= 2) {
				if (right == 6)
					right = 5;
				for (var vert = 0; vert < size; vert++) {
					for (var j = 0; j < 2; j++) {
						var x = right - j;
						var upward = ((right + 1) & 2) == 0;
						var y = upward ? size - 1 - vert : vert;
						if (!isFunction[y * size + x] && i < data.length * 8) {
							modules[y * size + x] = getBit(data[i >>> 3], 7 - (i & 7));
							i++;
						}
					}
				}
			}
		}
		
		function applyMask(msk) {
			for (var y = 0; y < size; y++) {
				for (var x = 0; x < size; x++) {
					var invert;
					switch (msk) {
						case 0:  invert = (x + y) % 2 == 0;                    break;
						case 1:  invert = y % 2 == 0;                          break;
						case 2:  invert = x % 3 == 0;                          break;
						case 3:  invert = (x + y) % 3 == 0;                    break;
						case 4:  invert = (Math.floor(x / 3) + Math.floor(y / 2)) % 2 == 0;  break;
						case 5:  invert = (x * y) % 2 + (x * y) % 3 == 0;      break;
						case 6:  invert = ((x * y) % 2 + (x * y) % 3) % 2 == 0;  break;
						case 7:  invert = ((x + y) % 2 + (x * y) % 3) % 2 == 0;  break;
						default:  throw new RangeError("Assertion error");
					}
					if (!isFunction[y * size + x] && invert)
						modules[y * size + x] = !modules[y * size + x];
				}
			}
		}
		
		function getPenaltyScore() {
			var result = 0;
			
			// Adjacent modules in row having same color
			for (var y = 0; y < size; y++) {
				var runColor = false;
				var runX = 0;
				for (var x = 0; x < size; x++) {
					if (modules[y * size + x] == runColor) {
						runX++;
						if (runX == 5)
							result += 3;
						else if (runX > 5)
							result++;
					} else {
						runColor = modules[y * size + x];
						runX = 1;
					}
				}
			}
			
			// Adjacent modules in column having same color
			for (var x = 0; x < size; x++) {
				var runColor = false;
				var runY = 0;
				for (var y = 0; y < size; y++) {
					if (modules[y * size + x] == runColor) {
						runY++;
						if (runY == 5)
							result += 3;
						else if (runY > 5)
							result++;
					} else {
						runColor = modules[y * size + x];
						runY = 1;
					}
				}
			}
			
			// 2*2 blocks of modules having same color
			for (var y = 0; y < size - 1; y++) {
				for (var x = 0; x < size - 1; x++) {
					var color = modules[y * size + x];
					if (color == modules[y * size + x + 1] &&
					    color == modules[(y + 1) * size + x] &&
					    color == modules[(y + 1) * size + x + 1])
						result += 3;
				}
			}
			
			return result;
		}
		
		function getAlignmentPatternPositions() {
			if (version == 1)
				return [];
			else {
				var numAlign = Math.floor(version / 7) + 2;
				var step = (version == 32) ? 26 : 
					Math.ceil((version*4 + 4) / (numAlign*2 - 2)) * 2;
				var result = [6];
				for (var pos = size - 7; result.length < numAlign; pos -= step)
					result.splice(1, 0, pos);
				return result;
			}
		}
		
		function getNumRawDataModules(ver) {
			var result = (16 * ver + 128) * ver + 64;
			if (ver >= 2) {
				var numAlign = Math.floor(ver / 7) + 2;
				result -= (25 * numAlign - 10) * numAlign - 55;
				if (ver >= 7)
					result -= 36;
			}
			return result;
		}
		
		function reedSolomonComputeDivisor(degree) {
			var result = [];
			for (var i = 0; i < degree - 1; i++)
				result.push(0);
			result.push(1);
			
			var root = 1;
			for (var i = 0; i < degree; i++) {
				for (var j = 0; j < result.length; j++) {
					result[j] = reedSolomonMultiply(result[j], root);
					if (j + 1 < result.length)
						result[j] ^= result[j + 1];
				}
				root = reedSolomonMultiply(root, 0x02);
			}
			return result;
		}
		
		function reedSolomonComputeRemainder(data, divisor) {
			var result = divisor.map(function(x) { return 0; });
			for (var i = 0; i < data.length; i++) {
				var factor = data[i] ^ result.shift();
				result.push(0);
				divisor.forEach(function(coef, j) {
					result[j] ^= reedSolomonMultiply(coef, factor);
				});
			}
			return result;
		}
		
		function reedSolomonMultiply(x, y) {
			var z = 0;
			for (var i = 7; i >= 0; i--) {
				z = (z << 1) ^ ((z >>> 7) * 0x11D);
				z ^= ((y >>> i) & 1) * x;
			}
			return z;
		}
	};
	
	// ---- Static factory functions (high level) ----
	
	// Returns a QR Code representing the given Unicode text string at the given error correction level.
	this.QrCode.encodeText = function(text, ecl) {
		var segs = qrcodegen.QrSegment.makeSegments(text);
		return qrcodegen.QrCode.encodeSegments(segs, ecl, 1, 40, -1, true);
	};
	
	// Returns a QR Code representing the given segments at the given error correction level.
	this.QrCode.encodeSegments = function(segs, ecl, minVersion, maxVersion, mask, boostEcl) {
		if (!(1 <= minVersion && minVersion <= maxVersion && maxVersion <= 40) || mask < -1 || mask > 7)
			throw new RangeError("Invalid value");
		
		// Find the minimal version number to use
		var version, dataUsedBits;
		for (version = minVersion; ; version++) {
			var dataCapacityBits = qrcodegen.QrCode.getNumDataCodewords(version, ecl) * 8;  // Number of data bits available
			var usedBits = qrcodegen.QrSegment.getTotalBits(segs, version);
			if (usedBits <= dataCapacityBits) {
				dataUsedBits = usedBits;
				break;  // This version number is found to be suitable
			}
			if (version >= maxVersion)  // All versions in the range could not fit the given data
				throw new RangeError("Data too long");
		}
		
		// Increase the error correction level while the data still fits in the same version number
		for (var newEcl of [qrcodegen.QrCode.Ecc.MEDIUM, qrcodegen.QrCode.Ecc.QUARTILE, qrcodegen.QrCode.Ecc.HIGH]) {  // From low to high
			if (boostEcl && dataUsedBits <= qrcodegen.QrCode.getNumDataCodewords(version, newEcl) * 8)
				ecl = newEcl;
		}
		
		// Concatenate all segments to create the data bit string
		var bb = [];
		for (var seg of segs) {
			appendBits(seg.mode.modeBits, 4, bb);
			appendBits(seg.numChars, seg.mode.numCharCountBits(version), bb);
			for (var b of seg.data)
				bb.push(b);
		}
		
		// Add terminator and pad up to a byte if applicable
		var dataCapacityBits = qrcodegen.QrCode.getNumDataCodewords(version, ecl) * 8;
		appendBits(0, Math.min(4, dataCapacityBits - bb.length), bb);
		appendBits(0, (8 - bb.length % 8) % 8, bb);
		
		// Pad with alternating bytes until data capacity is reached
		for (var padByte = 0xEC; bb.length < dataCapacityBits; padByte ^= 0xEC ^ 0x11)
			appendBits(padByte, 8, bb);
		
		// Pack bits into bytes in big endian
		var dataCodewords = [];
		while (dataCodewords.length * 8 < bb.length)
			dataCodewords.push(0);
		for (var i = 0; i < bb.length; i++)
			dataCodewords[i >>> 3] |= bb[i] << (7 - (i & 7));
		
		// Create the QR Code object
		return new qrcodegen.QrCode(version, ecl, dataCodewords, mask);
	};
	
	// Returns the number of data codewords that can be stored in a QR Code of the given version number and error correction level.
	this.QrCode.getNumDataCodewords = function(ver, ecl) {
		return Math.floor(getNumRawDataModules(ver) / 8) -
			ECC_CODEWORDS_PER_BLOCK    [ecl.ordinal][ver] *
			NUM_ERROR_CORRECTION_BLOCKS[ecl.ordinal][ver];
		
		function getNumRawDataModules(ver) {
			var result = (16 * ver + 128) * ver + 64;
			if (ver >= 2) {
				var numAlign = Math.floor(ver / 7) + 2;
				result -= (25 * numAlign - 10) * numAlign - 55;
				if (ver >= 7)
					result -= 36;
			}
			return result;
		}
	};
	
	// ---- Error correction level constants ----
	
	this.QrCode.Ecc = {
		LOW     : {ordinal: 0, formatBits: 1},
		MEDIUM  : {ordinal: 1, formatBits: 0},
		QUARTILE: {ordinal: 2, formatBits: 3},
		HIGH    : {ordinal: 3, formatBits: 2},
	};
	
	// ---- Data segment class ----
	
	this.QrSegment = function(mode, numChars, data) {
		Object.defineProperty(this, "mode"    , {value:mode    , enumerable:true});
		Object.defineProperty(this, "numChars", {value:numChars, enumerable:true});
		Object.defineProperty(this, "data"    , {value:data    , enumerable:true});
	};
	
	// Returns a segment representing the given binary data encoded in byte mode.
	this.QrSegment.makeBytes = function(data) {
		var bb = [];
		for (var b of data)
			appendBits(b, 8, bb);
		return new qrcodegen.QrSegment(qrcodegen.QrSegment.Mode.BYTE, data.length, bb);
	};
	
	// Returns a segment representing the given string of decimal digits encoded in numeric mode.
	this.QrSegment.makeNumeric = function(digits) {
		var bb = [];
		for (var i = 0; i < digits.length; ) {
			var n = Math.min(digits.length - i, 3);
			appendBits(parseInt(digits.substr(i, n), 10), n * 3 + 1, bb);
			i += n;
		}
		return new qrcodegen.QrSegment(qrcodegen.QrSegment.Mode.NUMERIC, digits.length, bb);
	};
	
	// Returns a segment representing the given text string encoded in alphanumeric mode.
	this.QrSegment.makeAlphanumeric = function(text) {
		var bb = [];
		var i;
		for (i = 0; i + 2 <= text.length; i += 2) {
			var temp = ALPHANUMERIC_CHARSET.indexOf(text.charAt(i)) * 45;
			temp += ALPHANUMERIC_CHARSET.indexOf(text.charAt(i + 1));
			appendBits(temp, 11, bb);
		}
		if (i < text.length)
			appendBits(ALPHANUMERIC_CHARSET.indexOf(text.charAt(i)), 6, bb);
		return new qrcodegen.QrSegment(qrcodegen.QrSegment.Mode.ALPHANUMERIC, text.length, bb);
	};
	
	// Returns a new mutable list of zero or more segments to represent the given Unicode text string.
	this.QrSegment.makeSegments = function(text) {
		// Select the most efficient segment encoding automatically
		if (text == "")
			return [];
		else if (isNumeric(text))
			return [qrcodegen.QrSegment.makeNumeric(text)];
		else if (isAlphanumeric(text))
			return [qrcodegen.QrSegment.makeAlphanumeric(text)];
		else
			return [qrcodegen.QrSegment.makeBytes(toUtf8ByteArray(text))];
	};
	
	// Returns the number of Unicode code points in the given string object.
	this.QrSegment.getTotalBits = function(segs, version) {
		var result = 0;
		for (var seg of segs) {
			var ccbits = seg.mode.numCharCountBits(version);
			if (seg.numChars >= (1 << ccbits))
				return Infinity;  // The segment's length doesn't fit the field's bit width
			result += 4 + ccbits + seg.data.length;
		}
		return result;
	};
	
	// ---- Segment mode constants ----
	
	this.QrSegment.Mode = {
		NUMERIC     : {modeBits: 0x1, numCharCountBits: function(ver) { return ver <  10 ? 10 : ver <  27 ? 12 : 14; }},
		ALPHANUMERIC: {modeBits: 0x2, numCharCountBits: function(ver) { return ver <  10 ?  9 : ver <  27 ? 11 : 13; }},
		BYTE        : {modeBits: 0x4, numCharCountBits: function(ver) { return ver <  10 ?  8 : ver <  27 ? 16 : 16; }},
		KANJI       : {modeBits: 0x8, numCharCountBits: function(ver) { return ver <  10 ?  8 : ver <  27 ? 10 : 12; }},
		ECI         : {modeBits: 0x7, numCharCountBits: function(ver) { return 0; }},
	};
	
	// ---- Private helper functions and constants ----
	
	var ALPHANUMERIC_CHARSET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:";
	
	function isNumeric(text) {
		return /^[0-9]*$/.test(text);
	}
	
	function isAlphanumeric(text) {
		return /^[A-Z0-9 $%*+.\/:-]*$/.test(text);
	}
	
	function toUtf8ByteArray(str) {
		str = encodeURI(str);
		var result = [];
		for (var i = 0; i < str.length; i++) {
			if (str.charAt(i) != "%")
				result.push(str.charCodeAt(i));
			else {
				result.push(parseInt(str.substr(i + 1, 2), 16));
				i += 2;
			}
		}
		return result;
	}
	
	function appendBits(val, len, bb) {
		for (var i = len - 1; i >= 0; i--)
			bb.push((val >>> i) & 1);
	}
	
	function getBit(x, i) {
		return ((x >>> i) & 1) != 0;
	}
	
	// ---- Constants ----
	
	var ECC_CODEWORDS_PER_BLOCK = [
		[-1,  7, 10, 15, 20, 26, 18, 20, 24, 30, 18, 20, 24, 26, 30, 22, 24, 28, 30, 28, 28, 28, 28, 30, 30, 26, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],  // Low
		[-1, 10, 16, 26, 18, 24, 16, 18, 22, 22, 26, 30, 22, 22, 24, 24, 28, 28, 26, 26, 26, 26, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28],  // Medium
		[-1, 13, 22, 18, 26, 18, 24, 18, 22, 20, 24, 28, 26, 24, 20, 30, 24, 28, 28, 26, 30, 28, 30, 30, 30, 30, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],  // Quartile
		[-1, 17, 28, 22, 16, 22, 28, 26, 26, 24, 28, 24, 28, 22, 24, 24, 30, 28, 28, 26, 28, 30, 24, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],  // High
	];
	
	var NUM_ERROR_CORRECTION_BLOCKS = [
		[-1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 4,  4,  4,  4,  4,  6,  6,  6,  6,  7,  8,  8,  9,  9, 10, 12, 12, 12, 13, 14, 15, 16, 17, 18, 19, 19, 20, 21, 22, 24, 25],  // Low
		[-1, 1, 1, 1, 2, 2, 4, 4, 4, 5, 5,  5,  8,  9,  9, 10, 10, 11, 13, 14, 16, 17, 17, 18, 20, 21, 23, 25, 26, 28, 29, 31, 33, 35, 37, 38, 40, 43, 45, 47, 49],  // Medium
		[-1, 1, 1, 2, 2, 4, 4, 6, 6, 8, 8,  8, 10, 12, 16, 12, 17, 16, 18, 21, 20, 23, 23, 25, 27, 29, 34, 34, 35, 38, 40, 43, 45, 48, 51, 53, 56, 59, 62, 65, 68],  // Quartile
		[-1, 1, 1, 2, 4, 4, 4, 5, 6, 8, 8, 11, 11, 16, 16, 18, 16, 19, 21, 25, 25, 25, 34, 30, 32, 35, 37, 40, 42, 45, 48, 51, 54, 57, 60, 63, 66, 70, 74, 77, 81],  // High
	];
	
}();