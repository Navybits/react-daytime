import React from "react";
import PropTypes from "prop-types";
import uuid from "uuid4";

import DayTimeCanvas from "./canvas";
import { WIDTH, HEIGHT } from "./constants";

class ReactDaytime extends React.Component {
	constructor(props) {
		super(props);
		this.canvasId = "react-daytime-" + uuid();
		// Ability to divide the hour
		this.hourDivider = props.hourDivider || 1;
		this.width = this.props.width || WIDTH;
		this.startHour = this.props.startHour || 0;
		this.endHour = this.props.endHour || 23;
		this.buildCanvas = this.buildCanvas.bind(this);
	}
	buildCanvas(props, options = {}) {
		const { withRerender = false } = options;
		const _props = props || this.props;
		this.canvas = new DayTimeCanvas(
			_props.onChange,
			_props.defaultValue,
			_props.theme,
			{
				hourDivider: this.hourDivider,
				canvasWidth: this.width,
				startHour: this.startHour,
				endHour: this.endHour
			}
		);
		if (withRerender) this.canvas.render(this.canvasId);
	}
	componentWillMount() {
		this.buildCanvas();
	}
	componentWillReceiveProps(nextProps) {
		this.buildCanvas(nextProps, { withRerender: true });
	}
	componentDidMount() {
		this.canvas.render(this.canvasId);
	}
	render() {
		return <canvas id={this.canvasId} width={this.width} height={HEIGHT} />;
	}
}
ReactDaytime.propTypes = {
	defaultValue: PropTypes.object,
	onChange: PropTypes.func,
	theme: PropTypes.object,
	hourDivider: PropTypes.number,
	width: PropTypes.number,
	startHour: PropTypes.number,
	endHour: PropTypes.number
};

export default ReactDaytime;
