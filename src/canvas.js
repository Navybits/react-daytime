import paper from "paper";

import * as CONSTANTS from "./constants";
import {
	state,
	hourState,
	dayState,
	dragState,
	callbacks
} from "./canvasState";

import Theme from "./theme";

export default class DayTimeCanvas {
	constructor(onChange, defaultValue, customTheme, hourDivider, canvasWidth) {
		this.theme = new Theme(customTheme);
		this.defaultValue = defaultValue;
		callbacks.onChange = onChange;
		this.hourDivider = hourDivider;
		this.canvasWidth = canvasWidth;
	}
	_calculateCellWidth() {
		let { hourDivider, canvasWidth } = this;
		return (
			((CONSTANTS.CELL_WIDTH / hourDivider) * canvasWidth) / CONSTANTS.WIDTH
		);
	}
	_findCell(point) {
		let found = null;
		state.forEach(row => {
			row.forEach(slot => {
				if (slot.cell.hitTest(point)) {
					found = slot;
				}
			});
		});
		return found;
	}

	_findAllSelected(p1, p2, callback) {
		const marquee = new paper.Rectangle(p1, p2);
		state.forEach(row => {
			row.forEach(slot => {
				if (
					slot.cell.isInside(marquee) ||
					slot.cell.bounds.intersects(marquee)
				) {
					callback(slot);
				}
			});
		});
	}

	_syncHeaderState() {
		let { hourDivider } = this;
		let selected;
		let i, j;
		for (i = 0; i < 7; i++) {
			selected = true;
			for (j = 0; j < 24 * hourDivider; j++) {
				if (!state[i][j].selected) {
					selected = false;
					break;
				}
			}
			this._setHeaderState(dayState[i], selected);
		}
		for (i = 0; i < 24 * hourDivider; i++) {
			selected = true;
			for (j = 0; j < 7; j++) {
				if (!state[j][i].selected) {
					selected = false;
					break;
				}
			}
			this._setHeaderState(hourState[i], selected);
		}
	}

	_fireChangeEvent() {
		const result = {};
		if (typeof callbacks.onChange === "function") {
			state.forEach((row, rownum) => {
				const selectedHours = [];
				row.forEach((col, colnum) => {
					if (col.selected) {
						selectedHours.push(colnum);
					}
				});
				if (selectedHours.length) {
					result[CONSTANTS.DAYS[rownum]] = selectedHours;
				}
			});
			callbacks.onChange(result);
		}
	}

	_setState(cellState, selected) {
		cellState.selected = selected;
		if (selected) {
			cellState.cell.fillColor = this.theme.cell.backgroundColor[1];
		} else {
			cellState.cell.fillColor = this.theme.cell.backgroundColor[0];
		}
		this._syncHeaderState();
		return cellState;
	}

	_setHeaderState(cellState, selected) {
		cellState.selected = selected;
		if (selected) {
			cellState.cell.fillColor = this.theme.header.backgroundColor[1];
			cellState.label.fillColor = this.theme.header.color[1];
		} else {
			cellState.cell.fillColor = this.theme.header.backgroundColor[0];
			cellState.label.fillColor = this.theme.header.color[0];
		}
		return state;
	}

	_flipHeaderCell(cellState) {
		const selected = !cellState.selected;
		this._setHeaderState(cellState, selected);
		return selected;
	}

	_flipCell(cellState) {
		const selected = !cellState.selected;
		this._setState(cellState, selected);
		this._fireChangeEvent();
		return selected;
	}

	_flipRow(rowState, index) {
		let { hourDivider } = this;

		const selected = this._flipHeaderCell(rowState[index]);
		let j;
		for (j = 0; j < 24 * hourDivider; j++) {
			this._setState(state[index][j], selected);
		}
		this._fireChangeEvent();
	}

	_flipCol(colState, index) {
		const selected = this._flipHeaderCell(colState[index]);
		let j;
		for (j = 0; j < 7; j++) {
			this._setState(state[j][index], selected);
		}
		this._fireChangeEvent();
	}

	_onDragEnd() {
		this._fireChangeEvent();
	}

	_cursorPointer() {
		document.body.style.cursor = "pointer";
	}

	_cursorDefault() {
		document.body.style.cursor = "";
	}

	_drawSlots() {
		let { hourDivider } = this;
		let _this = this;
		let i, j;
		for (i = 0; i < 7; i++) {
			state[i] = [];
			for (j = 0; j < 24 * hourDivider; j++) {
				const topLeft = new paper.Point(
					CONSTANTS.STARTX + j * _this._calculateCellWidth(),
					CONSTANTS.STARTY + i * CONSTANTS.CELL_HEIGHT
				);
				const rectSize = new paper.Size(
					_this._calculateCellWidth(),
					CONSTANTS.CELL_HEIGHT
				);
				const rect = new paper.Rectangle(topLeft, rectSize);
				const path = new paper.Path.Rectangle(rect);
				path.fillColor = this.theme.cell.backgroundColor[0];
				path.strokeColor = this.theme.border.color;

				state[i][j] = {
					cell: path,
					selected: false,
					x1: topLeft.x,
					y1: topLeft.y,
					x2: topLeft.x + _this._calculateCellWidth(),
					y2: topLeft.y + CONSTANTS.CELL_HEIGHT
				};
				((day, hour, slot) => {
					slot.on("click", ev => {
						this._flipCell(state[day][hour]);
					});
					slot.on("mousedrag", f => f);
				})(i, j, path);
			}
		}
	}

	_drawRowHeader() {
		let { hourDivider } = this;
		let _this = this;
		// DAY CONTROLLERS
		let i, j;
		for (i = 0; i < 7; i++) {
			const topLeft = new paper.Point(
				0,
				CONSTANTS.STARTY + i * CONSTANTS.CELL_HEIGHT
			);
			const rectSize = new paper.Size(CONSTANTS.STARTX, CONSTANTS.CELL_HEIGHT);
			const rect = new paper.Rectangle(topLeft, rectSize);
			const path = new paper.Path.Rectangle(rect);

			const label = new paper.PointText();
			label.content = CONSTANTS.DAYS[i];
			label.position = new paper.Point(
				CONSTANTS.STARTX / 2,
				topLeft.y + CONSTANTS.CELL_HEIGHT / 2
			);
			label.style = {
				fillColor: this.theme.header.color[0]
			};
			if (this.theme.header.fontFamily) {
				label.style.fontFamily = this.theme.header.fontFamily;
			}
			path.style = {
				fillColor: this.theme.header.backgroundColor[0],
				strokeColor: this.theme.border.color
			};

			dayState[i] = {
				cell: path,
				label,
				selected: false,
				x1: topLeft.x,
				y1: topLeft.y,
				x2: topLeft.x + _this._calculateCellWidth(),
				y2: topLeft.y + CONSTANTS.CELL_HEIGHT
			};
			((day, slot) => {
				const selectAllHours = ev => {
					this._flipRow(dayState, day);
				};
				slot.on("click", selectAllHours);
				label.on("click", selectAllHours);
				label.on("mouseenter", this._cursorPointer);
				label.on("mouseleave", this._cursorDefault);
				slot.on("mouseenter", this._cursorPointer);
				slot.on("mouseleave", this._cursorDefault);
			})(i, path);
		}
	}

	_drawColHeader() {
		let { hourDivider } = this;

		// HOUR CONTROLLERS
		let i, j;
		for (i = 0; i < 24 * hourDivider; i++) {
			const topLeft = new paper.Point(
				CONSTANTS.STARTX + i * this._calculateCellWidth(),
				0
			);
			const rectSize = new paper.Size(
				this._calculateCellWidth(),
				CONSTANTS.STARTY
			);
			const rect = new paper.Rectangle(topLeft, rectSize);
			const path = new paper.Path.Rectangle(rect);

			const label = new paper.PointText();
			let hourFraction = ((i % hourDivider) * (60 / hourDivider)) % 60;

			let index = parseInt(i / hourDivider);
			let splittedContent = CONSTANTS.HOURS[index].split(" ");
			label.content = `${splittedContent[0]}${
				hourFraction ? `:${hourFraction}` : ""
			} ${splittedContent[1]}`;
			label.position = new paper.Point(
				topLeft.x + this._calculateCellWidth() / 2,
				topLeft.y + CONSTANTS.STARTY / 2
			);
			label.rotation = -90;
			label.style = {
				fillColor: this.theme.header.color[0]
			};
			if (this.theme.header.fontFamily) {
				label.style.fontFamily = this.theme.header.fontFamily;
			}
			path.style = {
				fillColor: this.theme.header.backgroundColor[0],
				strokeColor: this.theme.border.color
			};

			hourState[i] = {
				cell: path,
				label,
				selected: false,
				x1: topLeft.x,
				y1: topLeft.y,
				x2: topLeft.x + this._calculateCellWidth(),
				y2: topLeft.y + CONSTANTS.CELL_HEIGHT
			};
			((hour, slot) => {
				const selectAllDays = () => {
					this._flipCol(hourState, hour);
				};
				label.on("click", selectAllDays);
				slot.on("click", selectAllDays);
				label.on("mouseenter", this._cursorPointer);
				label.on("mouseleave", this._cursorDefault);
				slot.on("mouseenter", this._cursorPointer);
				slot.on("mouseleave", this._cursorDefault);
			})(i, path);
		}
	}

	_drawResetButton() {
		let { hourDivider } = this;
		// filler
		const btnReset = new paper.Path.Rectangle(
			new paper.Rectangle(
				new paper.Point(0, 0),
				new paper.Size(CONSTANTS.STARTX, CONSTANTS.STARTY)
			)
		);
		const label = new paper.PointText();
		label.style = {
			fillColor: this.theme.header.color[0],
			fontSize: 10
		};
		if (this.theme.header.fontFamily) {
			label.style.fontFamily = this.theme.header.fontFamily;
		}
		label.content = "CLEAR";
		label.position = new paper.Point(
			CONSTANTS.STARTX / 2,
			CONSTANTS.STARTY / 2
		);
		btnReset.style = {
			fillColor: this.theme.header.backgroundColor[0]
		};
		const resetState = () => {
			CONSTANTS.DAYS.forEach((day, dayNum) => {
				Array.from(
					{ length: CONSTANTS.HOURS.length * hourDivider },
					(v, i) => i
				).forEach((hour, hourNum) => {
					this._setState(state[dayNum][hourNum], false);
				});
			});
			this._fireChangeEvent();
		};
		label.on("click", resetState);
		btnReset.on("click", resetState);
		label.on("mouseenter", this._cursorPointer);
		label.on("mouseleave", this._cursorDefault);
		btnReset.on("mouseenter", this._cursorPointer);
		btnReset.on("mouseleave", this._cursorDefault);
	}

	_populateDefaultState() {
		let { hourDivider } = this;
		// set defaultValue
		CONSTANTS.DAYS.forEach((day, dayNum) => {
			CONSTANTS.HOURS.forEach((hour, hourNum) => {
				if (
					this.defaultValue &&
					day in this.defaultValue &&
					this.defaultValue[day].indexOf(hourNum) >= 0
				) {
					this._setState(state[dayNum][hourNum], true);
				}
			});
		});
	}

	_attachEvents() {
		let { hourDivider } = this;

		// Marquee Select
		paper.view.on("mousedrag", ev => {
			const pos = ev.point;
			if (!dragState.dragging) {
				dragState.dragging = true;
				dragState.dragStart = pos;
				dragState.startCell = this._findCell(pos);
				if (dragState.startCell) {
					dragState.paintSelected = !dragState.startCell.selected;
				} else {
					dragState.paintSelected = true;
				}
			}
			this._findAllSelected(dragState.dragStart, pos, slot => {
				this._setState(slot, dragState.paintSelected);
			});
		});
		// End drag-mode
		paper.view.on("mouseup", ev => {
			if (dragState.dragging) {
				dragState.dragging = false;
				this._onDragEnd();
			}
		});
	}

	render(canvasId) {
		let hourDivider = this.hourDivider;
		paper.setup(canvasId);
		this._drawRowHeader();
		this._drawColHeader();
		this._drawResetButton();
		this._drawSlots();
		this._populateDefaultState();
		this._attachEvents();
	}
}
