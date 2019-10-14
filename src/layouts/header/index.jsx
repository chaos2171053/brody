import React, {Component, Fragment} from 'react';
import PropTypes from 'prop-types';
import {Icon} from 'antd';
import Link from '../page-link';
import Logo from '../logo';
import HeaderUser from '../header-user';
import HeaderMenu from '../header-menu';
import HeaderFullScreen from '../header-full-screen';
import ThemeColorPicker from '../header-color-picker';
import {connect} from '../../models/index';
import {PAGE_FRAME_LAYOUT} from '@/models/settings';
import Breadcrumb from '../breadcrumb';
import './style.less';
import PageTabs from "@/layouts/page-tabs";

@connect(state => {
    const {menus, topMenu} = state.menu;
    const {show: showSide, width, collapsed, collapsedWidth, dragging} = state.side;
    const {breadcrumbs} = state.page;
    const {pageFrameLayout} = state.settings;

    return {
        menus,
        topMenu,

        showSide,
        sideWidth: width,
        sideCollapsed: collapsed,
        sideCollapsedWidth: collapsedWidth,
        sideDragging: dragging,
        breadcrumbs,

        layout: pageFrameLayout,
    };
})
export default class Header extends Component {
    static propTypes = {
        layout: PropTypes.string,
        theme: PropTypes.string,
    };

    static defaultProps = {
        layout: PAGE_FRAME_LAYOUT.SIDE_MENU,    // top-side-menu top-menu side-menu
        theme: 'default',                       // default dark
    };

    handleToggle = () => {
        const {sideCollapsed} = this.props;
        this.props.action.side.setCollapsed(!sideCollapsed);
    };

    render() {
        let {
            layout,
            menus,          // 所有的菜单数据
            topMenu,        // 当前页面选中菜单的顶级菜单
            sideCollapsed,
            sideCollapsedWidth,
            sideWidth,
            sideDragging,
            breadcrumbs,
            children,
        } = this.props;

        sideWidth = sideCollapsed ? sideCollapsedWidth : sideWidth;

        const isTopSideMenu = layout === PAGE_FRAME_LAYOUT.TOP_SIDE_MENU;
        const isTopMenu = layout === PAGE_FRAME_LAYOUT.TOP_MENU;
        const isSideMenu = layout === PAGE_FRAME_LAYOUT.SIDE_MENU;
        const showToggle = isTopSideMenu || isSideMenu;
        const showMenu = isTopSideMenu || isTopMenu;

        let topMenus = menus;
        if (isTopSideMenu) {
            topMenus = menus && menus.map(item => ({key: item.key, text: item.text, path: item.path, icon: item.icon}));
        }
        if (isTopMenu) {
            topMenus = menus;
        }

        let transitionDuration = sideDragging ? '0ms' : '300ms';

        const theme = this.props.theme || ((isTopSideMenu || isSideMenu) ? 'default' : 'dark');

        const windowWidth = window.innerWidth;

        return (
            <div id="header" styleName="header" data-theme={theme}>
                <div styleName="logo-container" id="logo-container" style={{flex: `0 0 ${sideWidth}px`, transitionDuration}}>
                    <Link to="/">
                        <Logo
                            min={sideCollapsed}
                            title="React Admin"
                        />
                    </Link>
                    {
                        showToggle && !sideCollapsed ? (
                            <Icon
                                className="header-trigger"
                                styleName="trigger"
                                type={sideCollapsed ? 'menu-unfold' : 'menu-fold'}
                                onClick={this.handleToggle}
                                style={theme === 'dark' ? {color: '#fff', backgroundColor: '#222'} : null}
                            />
                        ) : null
                    }
                </div>
                {
                    showToggle && sideCollapsed ? (
                        <Icon
                            className="header-trigger"
                            styleName="trigger"
                            type={sideCollapsed ? 'menu-unfold' : 'menu-fold'}
                            onClick={this.handleToggle}
                            style={theme === 'dark' ? {color: '#fff', backgroundColor: '#222'} : null}
                        />
                    ) : null
                }
                <div styleName="page-tabs" style={{left: sideWidth, width: windowWidth - sideWidth + 1, transitionDuration}}><PageTabs width={windowWidth - sideWidth + 1}/></div>
                <div styleName="right">
                    <ThemeColorPicker styleName="action" className="header-action"/>
                    <HeaderFullScreen styleName="action" className="header-action"/>
                    <HeaderUser styleName="action" className="header-action" theme={theme}/>
                </div>
            </div>
        );
    }
}
