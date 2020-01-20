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
	}
	componentWillMount() {
		this.canvas = new DayTimeCanvas(
			this.props.onChange,
			this.props.defaultValue,
			this.props.theme,
			{
				hourDivider: this.hourDivider,
				canvasWidth: this.width,
				startHour: this.startHour,
				endHour: this.endHour
			}
		);
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
