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

        return (
            <div styleName={isMount ? "root active" : "root"}>
                <div styleName="star">{/* <img src={star} alt="星星"/> */}</div>
                <div styleName="logo">
                    {/* <img src={logo} alt="图标"/> */}
                    <span>Admin</span>
                </div>
            </div>
        );
    }
}
