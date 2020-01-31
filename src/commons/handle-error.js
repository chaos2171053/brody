import { notification } from "antd";
import { toLogin } from "./index";

/**
 * 尝试获取错误信息 errorTio > resData.message > error.message > '未知系统错误'
 *
 * @param error
 * @param errorTip
 * @returns {*}
 */
function getErrorTip({ errorTip, error }) {
    const commonTip = "系统开小差了，请稍后再试或联系管理员";
    const { code, data } = error;

    if (errorTip && errorTip !== true) return errorTip;

    if (code === 403) {
        return "您无权访问";
    }

    if (code === 404) {
        return "您访问的资源不存在";
    }

    if (typeof data.error === "string" && !data.detail) {
        return data.error;
    }
    if (
        data.detail &&
        Object.prototype.toString.call(data.detail).includes("Object")
    ) {
        let msg = "";
        Object.keys(data.detail).forEach(
            key => (msg += ` ${key}: ${data.detail[key]}`)
        );
        return msg;
    }
    if (
        data.detail &&
        Object.prototype.toString.call(data.detail).includes("Array")
    ) {
        let msg = "";
        data.detail.forEach(d => {
            Object.keys(d).forEach(key => (msg += ` ${key}: ${d[key]}`));
        });
        return msg;
    }

    return commonTip;
}

export default function handleError({ error, errorTip }) {
    if (error.response.status === 401) {
        notification.error({
            message: "失败",
            description: "登录失效，请重新登录",
            duration: 2
        });
        return toLogin();
    }

    if (errorTip === false) return;

    const description = getErrorTip({ errorTip, error: error.response.data });

    notification.error({
        message: "失败",
        description,
        duration: 2
    });
}
