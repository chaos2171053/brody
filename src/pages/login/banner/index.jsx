import React, {Component} from 'react';
import './style.less';
import logo from './logo.png';

export default class index extends Component {
    state = {
        isMount: false,
    };

    componentDidMount() {
        this.setState({isMount: true});
    }


    render() {
        const {isMount} = this.state;

        return (
            <div styleName={isMount ? 'root active' : 'root'}>
                <div styleName="logo">
                    <img src={logo} alt="图标"/>
                    <span>React Admin</span>
                </div>
            </div>
        );
    }
}
