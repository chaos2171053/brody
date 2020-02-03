import React, { Component } from "react";
import "./style.less";

export default class index extends Component {
    state = {
        isMount: false
    };

    componentDidMount() {
        this.setState({ isMount: true });
    }

    render() {
        const { isMount } = this.state;

        return <></>;
    }
}
