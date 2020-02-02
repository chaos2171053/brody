import React, { Component } from "react";
import { Form, Button } from "antd";
import { FormElement, FormRow } from "@/library/components";
import config from "@/commons/config-hoc";
import PageContent from "@/layouts/page-content";
import { connect } from "@/models/index";
import moment from "moment";

import MdEditor from "react-markdown-editor-lite";
import MarkdownIt from "markdown-it";
import "react-markdown-editor-lite/lib/index.css";
import { notification } from "antd";

const mdParser = new MarkdownIt();
@config({
    path: "/article/_/edit/:id",
    ajax: true,
    connect: true
})
@connect(state => {
    const { title } = state.page;
    return {
        title
    };
})
@Form.create()
export default class Edit extends Component {
    state = {
        loading: false, // 页面加载loading
        data: {}, // 表单回显数据
        articleType: [], // 文章类别
        isEdit: false // 是否是编辑页面
    };
    static displayName = `page-article-edit`;

    async componentDidMount() {
        const { id } = this.props.match.params;
        const {
            action: { page }
        } = this.props;
        const isEdit = id !== ":id";

        this.setState({ isEdit });
        await this.fetchArticleType();

        if (isEdit) {
            await this.fetchData();
            page.setTitle("编辑文章");
        } else {
            page.setTitle("新增文章");
        }
    }
    fetchArticleType = async () => {
        const params = {
            page: 1,
            pageSize: 100
        };
        await this.props.ajax.get("/admin/article_type", params).then(res => {
            const articleType = res.data.map(type => {
                return {
                    value: type.id,
                    label: type.type_name
                };
            });
            this.setState({
                articleType
            });
        });
    };
    async fetchData() {
        if (this.state.loading) return;

        const { id } = this.props.match.params;

        this.setState({ loading: true });
        await this.props.ajax
            .get(`/admin/article/${id}`)
            .then(res => {
                console.log(res);
                this.setState({ data: { ...res } });
            })
            .finally(() => this.setState({ loading: false }));
    }

    handleSubmit = () => {
        if (this.state.loading) return;

        this.props.form.validateFieldsAndScroll((err, values) => {
            if (err) return;
            const { created_at, title, type_id } = values;
            const {
                data: { introduce, content }
            } = this.state;
            if (!introduce) {
                notification.error({
                    message: "失败",
                    description: "请输入文章介绍",
                    duration: 2
                });
                return;
            }

            if (!content) {
                notification.error({
                    message: "失败",
                    description: "请输入文章内容",
                    duration: 2
                });
                return;
            }

            const params = {
                title,
                type_id,
                created_at: moment(created_at).format("YYYY-MM-DD HH:mm:ss"),
                introduce,
                content
            };

            const { isEdit } = this.state;
            const ajaxMethod = isEdit
                ? this.props.ajax.patch
                : this.props.ajax.post;
            const successTip = isEdit ? "修改成功！" : "添加成功！";
            const url = isEdit
                ? `/admin/article/${this.props.match.params.id}`
                : `/admin/article`;

            this.setState({ loading: true });

            ajaxMethod(url, params, { successTip, noEmpty: true })
                .then(() => {
                    this.props.action.system.closeCurrentTab();
                })
                .finally(() => this.setState({ loading: false }));
        });
    };

    handleContentEditorChange = ({ html, text }) => {
        this.setState({
            data: {
                ...this.state.data,
                content: text
            }
        });
    };
    handleIntroduceEditorChange = ({ html, text }) => {
        this.setState({
            data: {
                ...this.state.data,
                introduce: text
            }
        });
    };

    render() {
        const { form } = this.props;
        const { loading, data, isEdit, articleType } = this.state;
        const formProps = {
            labelWidth: 100,
            form,
            width: "50%"
        };
        return (
            <PageContent loading={loading}>
                <Form onSubmit={this.handleSubmit}>
                    {isEdit ? (
                        <FormElement
                            {...formProps}
                            type="hidden"
                            field="id"
                            initialValue={data.id}
                        />
                    ) : null}
                    <FormRow>
                        <FormElement
                            {...formProps}
                            label="标题"
                            field="title"
                            initialValue={data.title}
                            required
                            maxLength={20}
                        />
                        <FormElement
                            {...formProps}
                            type="select"
                            label="文章类别"
                            field="type_id"
                            initialValue={data.type_id}
                            required
                            options={articleType}
                        />
                    </FormRow>
                    <FormRow>
                        <FormElement
                            {...formProps}
                            type="date-time"
                            label="发表时间"
                            field="created_at"
                            initialValue={moment(data.created_at)}
                            required
                        ></FormElement>
                    </FormRow>
                    <FormRow>
                        <FormElement
                            {...formProps}
                            width="100%"
                            label="介绍"
                            layout
                        >
                            <MdEditor
                                value={data.introduce}
                                renderHTML={text => mdParser.render(text)}
                                onChange={this.handleIntroduceEditorChange}
                            />
                        </FormElement>
                    </FormRow>

                    <FormRow>
                        <FormElement
                            {...formProps}
                            width="100%"
                            label="内容"
                            layout
                        >
                            <MdEditor
                                value={data.content}
                                renderHTML={text => mdParser.render(text)}
                                onChange={this.handleContentEditorChange}
                            />
                        </FormElement>
                    </FormRow>

                    <FormRow>
                        <FormElement {...formProps} layout>
                            <Button type="primary" onClick={this.handleSubmit}>
                                发布
                            </Button>
                            <Button onClick={() => form.resetFields()}>
                                重置
                            </Button>
                        </FormElement>
                    </FormRow>
                </Form>
            </PageContent>
        );
    }
}
