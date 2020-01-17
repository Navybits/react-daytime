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
	}
	componentWillMount() {
		this.canvas = new DayTimeCanvas(
			this.props.onChange,
			this.props.defaultValue,
			this.props.theme,
            this.hourDivider,
            this.width
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
    width: PropTypes.number
};

export default ReactDaytime;
