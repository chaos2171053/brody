import { notification } from "antd";
import { toLogin } from "./index";

/**
 * 尝试获取错误信息 errorTio > resData.message > error.message > '未知系统错误'
 *
 * @param error
 * @param errorTip
 * @returns {*}
 */
function getErrorTip({ error, errorTip }) {
    const commonTip = "系统开小差了，请稍后再试或联系管理员";

    if (errorTip && errorTip !== true) return errorTip;

    if (error && error.data) {
        const { code, data } = error;

        if (code === 403) {
            return "您无权访问";
        }

        if (code === 404) {
            return "您访问的资源不存在";
        }

        if (code === 504) {
            return commonTip;
        }

        if (code === 500) {
            return commonTip;
        }

        // 后端自定义信息
        if (typeof data.error === "string") return data.error;
        if (Object.prototype.toString.call(data.error).includes("Object")) {
            let msg = "";
            Object.keys(data.error).forEach(
                key => (msg += ` ${key}: ${data.error[key]}`)
            );
            return msg;
        }
    }

    return commonTip;
}

export default function handleError({ error, errorTip }) {
    const { code } = error;

    // 如果是未登录问题，不显示错误提示
    if (code === 401) return toLogin();

    if (errorTip === false) return;

    const description = getErrorTip({ error, errorTip });

    notification.error({
        message: "失败",
        description,
        duration: 2
    });
}
