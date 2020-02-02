import React, { Component } from "react";
import { Form } from "antd";
import { FormElement } from "@/library/components";
import config from "@/commons/config-hoc";
import validator from "@/library/utils/validation-rule";
import { ModalContent } from "@/library/components";

@config({
    ajax: true,
    modal: {
        title: props => (props.isEdit ? "修改类别" : "添加类别")
    }
})
@Form.create()
export default class EditModal extends Component {
    state = {
        loading: false, // 页面加载loading
        data: {} // 表单回显数据
    };

    componentDidMount() {
        const { isEdit } = this.props;

        if (isEdit) {
            this.fetchData();
        }
    }

    fetchData = () => {
        if (this.state.loading) return;

        const { id } = this.props;

        this.setState({ loading: true });
        this.props.ajax
            .get(`/admin/article_type/${id}`)
            .then(res => {
                this.setState({ data: res || {} });
            })
            .finally(() => this.setState({ loading: false }));
    };

    handleSubmit = () => {
        if (this.state.loading) return;

        this.props.form.validateFieldsAndScroll((err, values) => {
            if (err) return;

            const { isEdit } = this.props;
            const ajaxMethod = isEdit
                ? this.props.ajax.put
                : this.props.ajax.post;
            const successTip = isEdit ? "修改成功！" : "添加成功！";
            const url = isEdit
                ? `/admin/article_type/${this.props.id}`
                : `/admin/article_type`;
            console.log(isEdit);

            this.setState({ loading: true });
            ajaxMethod(url, values, { successTip })
                .then(() => {
                    const { onOk } = this.props;
                    onOk && onOk();
                })
                .finally(() => this.setState({ loading: false }));
        });
    };

    render() {
        const { isEdit, form } = this.props;
        const { loading, data } = this.state;
        const formProps = {
            labelWidth: 100,
            form
        };
        return (
            <ModalContent
                loading={loading}
                okText="保存"
                cancelText="重置"
                onOk={this.handleSubmit}
                onCancel={() => form.resetFields()}
            >
                <Form onSubmit={this.handleSubmit}>
                    {isEdit ? (
                        <FormElement
                            {...formProps}
                            type="hidden"
                            field="id"
                            initialValue={data.id}
                        />
                    ) : null}
                    <FormElement
                        {...formProps}
                        label="名称"
                        field="type_name"
                        initialValue={data.type_name}
                        required
                        noSpace
                        rules={[validator.userNameExist()]}
                    />
                    <FormElement
                        {...formProps}
                        type="number"
                        label="顺序"
                        field="order_num"
                        initialValue={data.order_num}
                        required
                    />
                </Form>
            </ModalContent>
        );
    }
}
