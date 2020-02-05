"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj["default"] = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _paper = require("paper");

var _paper2 = _interopRequireDefault(_paper);

var _constants = require("./constants");

var CONSTANTS = _interopRequireWildcard(_constants);

var _canvasState = require("./canvasState");

var _theme = require("./theme");

var _theme2 = _interopRequireDefault(_theme);

var DayTimeCanvas = (function () {
	function DayTimeCanvas(onChange, defaultValue, customTheme) {
		var options = arguments.length <= 3 || arguments[3] === undefined ? {} : arguments[3];

		_classCallCheck(this, DayTimeCanvas);

		this.theme = new _theme2["default"](customTheme);
		this.defaultValue = defaultValue;
		_canvasState.callbacks.onChange = onChange;
		var hourDivider = options.hourDivider;
		var canvasWidth = options.canvasWidth;
		var startHour = options.startHour;
		var endHour = options.endHour;

		this.hourDivider = hourDivider;
		this.canvasWidth = canvasWidth;
		this.startHour = startHour;
		this.endHour = endHour;
	}

	_createClass(DayTimeCanvas, [{
		key: "_calculateCellWidth",
		value: function _calculateCellWidth() {
			var hourDivider = this.hourDivider;
			var canvasWidth = this.canvasWidth;
			var startHour = this.startHour;
			var endHour = this.endHour;

			var openingHours = endHour - startHour + 1;

			return CONSTANTS.CELL_WIDTH / hourDivider * canvasWidth / CONSTANTS.WIDTH * 24 / openingHours;
		}
	}, {
		key: "_missingColumnsNumber",
		value: function _missingColumnsNumber() {
			var hourDivider = this.hourDivider;
			var startHour = this.startHour;
			var endHour = this.endHour;

			var missingLeft = startHour * hourDivider,
			    missingRight = (23 - endHour) * hourDivider;
			return { missingLeft: missingLeft, missingRight: missingRight };
		}
	}, {
		key: "_checkInsideOpening",
		value: function _checkInsideOpening(index) {
			var hourDivider = this.hourDivider;
			var startHour = this.startHour;
			var endHour = this.endHour;

			return parseInt(index / hourDivider) >= startHour && parseInt(index / hourDivider) < endHour;
		}
	}, {
		key: "_findCell",
		value: function _findCell(point) {
			var found = null;
			_canvasState.state.forEach(function (row) {
				row.forEach(function (slot) {
					if (slot.cell.hitTest(point)) {
						found = slot;
					}
				});
			});
			return found;
		}
	}, {
		key: "_findAllSelected",
		value: function _findAllSelected(p1, p2, callback) {
			var marquee = new _paper2["default"].Rectangle(p1, p2);
			_canvasState.state.forEach(function (row) {
				row.forEach(function (slot) {
					if (slot.cell.isInside(marquee) || slot.cell.bounds.intersects(marquee)) {
						callback(slot);
					}
				});
			});
		}
	}, {
		key: "_syncHeaderState",
		value: function _syncHeaderState() {
			var hourDivider = this.hourDivider;

			var _this = this;
			var selected = undefined;
			var i = undefined,
			    j = undefined;
			for (i = 0; i < 7; i++) {
				selected = true;
				for (j = 0; j < 24 * hourDivider; j++) {
					if (!_this._checkInsideOpening(j)) continue;

					if (!_canvasState.state[i][j].selected) {
						selected = false;
						break;
					}
				}
				this._setHeaderState(_canvasState.dayState[i], selected);
			}
			for (i = 0; i < 24 * hourDivider; i++) {
				if (!_this._checkInsideOpening(i)) continue;
				selected = true;
				for (j = 0; j < 7; j++) {
					if (!_canvasState.state[j][i].selected) {
						selected = false;
						break;
					}
				}
				this._setHeaderState(_canvasState.hourState[i], selected);
			}
		}
	}, {
		key: "_fireChangeEvent",
		value: function _fireChangeEvent() {
			var result = {};
			if (typeof _canvasState.callbacks.onChange === "function") {
				_canvasState.state.forEach(function (row, rownum) {
					var selectedHours = [];
					row.forEach(function (col, colnum) {
						if (col.selected) {
							selectedHours.push(colnum);
						}
					});
					if (selectedHours.length) {
						result[CONSTANTS.DAYS[rownum]] = selectedHours;
					}
				});
				_canvasState.callbacks.onChange(result);
			}
		}
	}, {
		key: "_setState",
		value: function _setState(cellState, selected) {
			if (!cellState) return;
			cellState.selected = selected;
			if (selected) {
				cellState.cell.fillColor = this.theme.cell.backgroundColor[1];
			} else {
				cellState.cell.fillColor = this.theme.cell.backgroundColor[0];
			}
			this._syncHeaderState();
			return cellState;
		}
	}, {
		key: "_setHeaderState",
		value: function _setHeaderState(cellState, selected) {
			cellState.selected = selected;
			if (selected) {
				cellState.cell.fillColor = this.theme.header.backgroundColor[1];
				cellState.label.fillColor = this.theme.header.color[1];
			} else {
				cellState.cell.fillColor = this.theme.header.backgroundColor[0];
				cellState.label.fillColor = this.theme.header.color[0];
			}
			return _canvasState.state;
		}
	}, {
		key: "_flipHeaderCell",
		value: function _flipHeaderCell(cellState) {
			var selected = !cellState.selected;
			this._setHeaderState(cellState, selected);
			return selected;
		}
	}, {
		key: "_flipCell",
		value: function _flipCell(cellState) {
			var selected = !cellState.selected;
			this._setState(cellState, selected);
			this._fireChangeEvent();
			return selected;
		}
	}, {
		key: "_flipRow",
		value: function _flipRow(rowState, index) {
			var hourDivider = this.hourDivider;

			var selected = this._flipHeaderCell(rowState[index]);
			var j = undefined;
			for (j = 0; j < 24 * hourDivider; j++) {
				if (!this._checkInsideOpening(j)) continue;
				this._setState(_canvasState.state[index][j], selected);
			}
			this._fireChangeEvent();
		}
	}, {
		key: "_flipCol",
		value: function _flipCol(colState, index) {
			var selected = this._flipHeaderCell(colState[index]);
			var j = undefined;
			for (j = 0; j < 7; j++) {
				this._setState(_canvasState.state[j][index], selected);
			}
			this._fireChangeEvent();
		}
	}, {
		key: "_onDragEnd",
		value: function _onDragEnd() {
			this._fireChangeEvent();
		}
	}, {
		key: "_cursorPointer",
		value: function _cursorPointer() {
			document.body.style.cursor = "pointer";
		}
	}, {
		key: "_cursorDefault",
		value: function _cursorDefault() {
			document.body.style.cursor = "";
		}
	}, {
		key: "_drawSlots",
		value: function _drawSlots() {
			var _this2 = this;

			var hourDivider = this.hourDivider;

			var _this = this;
			var i = undefined,
			    j = undefined;
			for (i = 0; i < 7; i++) {
				_canvasState.state[i] = [];
				for (j = 0; j < 24 * hourDivider; j++) {
					if (!_this._checkInsideOpening(j)) continue;
					var topLeft = new _paper2["default"].Point(CONSTANTS.STARTX + (j - _this._missingColumnsNumber().missingLeft) * _this._calculateCellWidth(), CONSTANTS.STARTY + i * CONSTANTS.CELL_HEIGHT);
					var rectSize = new _paper2["default"].Size(_this._calculateCellWidth(), CONSTANTS.CELL_HEIGHT);
					var rect = new _paper2["default"].Rectangle(topLeft, rectSize);
					var path = new _paper2["default"].Path.Rectangle(rect);
					path.fillColor = this.theme.cell.backgroundColor[0];
					path.strokeColor = this.theme.border.color;

					_canvasState.state[i][j] = {
						cell: path,
						selected: false,
						x1: topLeft.x,
						y1: topLeft.y,
						x2: topLeft.x + _this._calculateCellWidth(),
						y2: topLeft.y + CONSTANTS.CELL_HEIGHT
					};
					(function (day, hour, slot) {
						slot.on("click", function (ev) {
							_this2._flipCell(_canvasState.state[day][hour]);
						});
						slot.on("mousedrag", function (f) {
							return f;
						});
					})(i, j, path);
				}
			}
		}
	}, {
		key: "_drawRowHeader",
		value: function _drawRowHeader() {
			var _this3 = this;

			var _this = this;
			// DAY CONTROLLERS
			var i = undefined,
			    j = undefined;

			var _loop = function () {
				var topLeft = new _paper2["default"].Point(0, CONSTANTS.STARTY + i * CONSTANTS.CELL_HEIGHT);
				var rectSize = new _paper2["default"].Size(CONSTANTS.STARTX, CONSTANTS.CELL_HEIGHT);
				var rect = new _paper2["default"].Rectangle(topLeft, rectSize);
				var path = new _paper2["default"].Path.Rectangle(rect);

				var label = new _paper2["default"].PointText();
				label.content = CONSTANTS.DAYS[i];
				label.position = new _paper2["default"].Point(CONSTANTS.STARTX / 2, topLeft.y + CONSTANTS.CELL_HEIGHT / 2);
				label.style = {
					fillColor: _this3.theme.header.color[0]
				};
				if (_this3.theme.header.fontFamily) {
					label.style.fontFamily = _this3.theme.header.fontFamily;
				}
				path.style = {
					fillColor: _this3.theme.header.backgroundColor[0],
					strokeColor: _this3.theme.border.color
				};

				_canvasState.dayState[i] = {
					cell: path,
					label: label,
					selected: false,
					x1: topLeft.x,
					y1: topLeft.y,
					x2: topLeft.x + _this._calculateCellWidth(),
					y2: topLeft.y + CONSTANTS.CELL_HEIGHT
				};
				(function (day, slot) {
					var selectAllHours = function selectAllHours(ev) {
						_this3._flipRow(_canvasState.dayState, day);
					};
					slot.on("click", selectAllHours);
					label.on("click", selectAllHours);
					label.on("mouseenter", _this3._cursorPointer);
					label.on("mouseleave", _this3._cursorDefault);
					slot.on("mouseenter", _this3._cursorPointer);
					slot.on("mouseleave", _this3._cursorDefault);
				})(i, path);
			};

			for (i = 0; i < 7; i++) {
				_loop();
			}
		}
	}, {
		key: "_drawColHeader",
		value: function _drawColHeader() {
			var _this4 = this;

			var hourDivider = this.hourDivider;

			var _this = this;
			// HOUR CONTROLLERS
			var i = undefined,
			    j = undefined;

			var _loop2 = function () {
				if (!_this._checkInsideOpening(i)) return "continue";
				var topLeft = new _paper2["default"].Point(CONSTANTS.STARTX + (i - _this._missingColumnsNumber().missingLeft) * _this4._calculateCellWidth(), 0);
				var rectSize = new _paper2["default"].Size(_this4._calculateCellWidth(), CONSTANTS.STARTY);
				var rect = new _paper2["default"].Rectangle(topLeft, rectSize);
				var path = new _paper2["default"].Path.Rectangle(rect);

				var label = new _paper2["default"].PointText();
				var hourFraction = i % hourDivider * (60 / hourDivider) % 60;

				var index = parseInt(i / hourDivider);
				var splittedContent = CONSTANTS.HOURS[index].split(" ");
				label.content = "" + splittedContent[0] + (hourFraction ? ":" + hourFraction : "") + " " + splittedContent[1];
				label.position = new _paper2["default"].Point(topLeft.x + _this4._calculateCellWidth() / 2, topLeft.y + CONSTANTS.STARTY / 2);
				label.rotation = -90;
				label.style = {
					fillColor: _this4.theme.header.color[0]
				};
				if (_this4.theme.header.fontFamily) {
					label.style.fontFamily = _this4.theme.header.fontFamily;
				}
				path.style = {
					fillColor: _this4.theme.header.backgroundColor[0],
					strokeColor: _this4.theme.border.color
				};

				_canvasState.hourState[i] = {
					cell: path,
					label: label,
					selected: false,
					x1: topLeft.x,
					y1: topLeft.y,
					x2: topLeft.x + _this4._calculateCellWidth(),
					y2: topLeft.y + CONSTANTS.CELL_HEIGHT
				};
				(function (hour, slot) {
					var selectAllDays = function selectAllDays() {
						_this4._flipCol(_canvasState.hourState, hour);
					};
					label.on("click", selectAllDays);
					slot.on("click", selectAllDays);
					label.on("mouseenter", _this4._cursorPointer);
					label.on("mouseleave", _this4._cursorDefault);
					slot.on("mouseenter", _this4._cursorPointer);
					slot.on("mouseleave", _this4._cursorDefault);
				})(i, path);
			};

			for (i = 0; i < 24 * hourDivider; i++) {
				var _ret2 = _loop2();

				if (_ret2 === "continue") continue;
			}
		}
	}, {
		key: "_drawResetButton",
		value: function _drawResetButton() {
			var _this5 = this;

			var hourDivider = this.hourDivider;

			// filler
			var btnReset = new _paper2["default"].Path.Rectangle(new _paper2["default"].Rectangle(new _paper2["default"].Point(0, 0), new _paper2["default"].Size(CONSTANTS.STARTX, CONSTANTS.STARTY)));
			var label = new _paper2["default"].PointText();
			label.style = {
				fillColor: this.theme.header.color[0],
				fontSize: 10
			};
			if (this.theme.header.fontFamily) {
				label.style.fontFamily = this.theme.header.fontFamily;
			}
			label.content = "CLEAR";
			label.position = new _paper2["default"].Point(CONSTANTS.STARTX / 2, CONSTANTS.STARTY / 2);
			btnReset.style = {
				fillColor: this.theme.header.backgroundColor[0]
			};
			var resetState = function resetState() {
				CONSTANTS.DAYS.forEach(function (day, dayNum) {
					Array.from({ length: CONSTANTS.HOURS.length * hourDivider }, function (v, i) {
						return i;
					}).forEach(function (hour, hourNum) {
						if (_canvasState.state[dayNum][hourNum]) _this5._setState(_canvasState.state[dayNum][hourNum], false);
					});
				});
				_this5._fireChangeEvent();
			};
			label.on("click", resetState);
			btnReset.on("click", resetState);
			label.on("mouseenter", this._cursorPointer);
			label.on("mouseleave", this._cursorDefault);
			btnReset.on("mouseenter", this._cursorPointer);
			btnReset.on("mouseleave", this._cursorDefault);
		}
	}, {
		key: "_populateDefaultState",
		value: function _populateDefaultState() {
			var _this6 = this;

			var hourDivider = this.hourDivider;

			// set defaultValue
			CONSTANTS.DAYS.forEach(function (day, dayNum) {
				Array.from({ length: CONSTANTS.HOURS.length * hourDivider }, function (v, i) {
					return i;
				}).forEach(function (hour, hourNum) {
					if (_this6.defaultValue && day in _this6.defaultValue && _this6.defaultValue[day].indexOf(hourNum) >= 0) {
						_this6._setState(_canvasState.state[dayNum][hourNum], true);
					}
				});
			});
		}
	}, {
		key: "_attachEvents",
		value: function _attachEvents() {
			var _this7 = this;

			// Marquee Select
			_paper2["default"].view.on("mousedrag", function (ev) {
				var pos = ev.point;
				if (!_canvasState.dragState.dragging) {
					_canvasState.dragState.dragging = true;
					_canvasState.dragState.dragStart = pos;
					_canvasState.dragState.startCell = _this7._findCell(pos);
					if (_canvasState.dragState.startCell) {
						_canvasState.dragState.paintSelected = !_canvasState.dragState.startCell.selected;
					} else {
						_canvasState.dragState.paintSelected = true;
					}
				}
				_this7._findAllSelected(_canvasState.dragState.dragStart, pos, function (slot) {
					_this7._setState(slot, _canvasState.dragState.paintSelected);
				});
			});
			// End drag-mode
			_paper2["default"].view.on("mouseup", function (ev) {
				if (_canvasState.dragState.dragging) {
					_canvasState.dragState.dragging = false;
					_this7._onDragEnd();
				}
			});
		}
	}, {
		key: "render",
		value: function render(canvasId) {
			_paper2["default"].setup(canvasId);
			this._drawRowHeader();
			this._drawColHeader();
			this._drawResetButton();
			this._drawSlots();
			this._populateDefaultState();
			this._attachEvents();
		}
	}]);

	return DayTimeCanvas;
})();

exports["default"] = DayTimeCanvas;
module.exports = exports["default"];