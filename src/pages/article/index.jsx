import React, { Component } from "react";
import { Button, Form, Modal } from "antd";
import PageContent from "../../layouts/page-content";
import config from "../../commons/config-hoc";
import {
    QueryBar,
    FormRow,
    FormElement,
    ToolBar,
    Table,
    Operator,
    Pagination
} from "../../library/components";

@config({
    path: "/article",
    ajax: true,
    keepAlive: false
})
@Form.create()
export default class UserCenter extends Component {
    state = {
        loading: false, // 表格加载数据loading
        dataSource: [], // 表格数据
        selectedRowKeys: [], // 表格中选中行keys
        total: 0, // 分页中条数
        pageNum: 1, // 分页当前页
        pageSize: 10, // 分页每页显示条数
        deleting: false, // 批量删除中loading
        singleDeleting: {}, // 操作列删除loading
        id: null // 需要修改的数据id
    };

    columns = [
        { title: "标题", dataIndex: "title", width: 200 },
        { title: "类别", dataIndex: "article_type", width: 200 },
        {
            title: "浏览量",
            dataIndex: "view_count",
            width: 200
        },
        {
            title: "操作",
            dataIndex: "operator",
            width: 100,
            render: (value, record) => {
                const { id, title } = record;
                const { singleDeleting } = this.state;
                const deleting = singleDeleting[id];
                const items = [
                    {
                        label: "编辑",
                        onClick: () => this.setState({ visible: true, id })
                    },
                    {
                        label: "删除",
                        color: "red",
                        loading: deleting,
                        confirm: {
                            title: `您确定删除"${title}"?`,
                            onConfirm: () => this.handleDelete(id)
                        }
                    }
                ];

                return <Operator items={items} />;
            }
        }
    ];

    componentDidMount() {
        this.handleSearch();
    }

    handleSearch = e => {
        e && e.preventDefault();
        if (this.state.loading) return;

        this.props.form.validateFieldsAndScroll((err, values) => {
            if (err) return;

            const { pageNum, pageSize } = this.state;
            const params = {
                page: pageNum,
                pageSize
            };

            this.setState({ loading: true });
            this.props.ajax
                .get("/admin/article", params)
                .then(res => {
                    let dataSource = res?.data || [];
                    const total = res?.total || 0;
                    dataSource = dataSource.map(data => {
                        data.article_type = data.type?.type_name || "-";
                        return data;
                    });

                    this.setState({ dataSource, total });
                })
                .finally(() => this.setState({ loading: false }));
        });
    };

    handleDelete = id => {
        const singleDeleting = { ...this.state.singleDeleting };

        if (singleDeleting[id]) return;

        singleDeleting[id] = true;
        this.setState({ singleDeleting });
        this.props.ajax
            .del(`/admin/article/${id}`, null, {
                successTip: "删除成功！",
                errorTip: true
            })
            .then(() => this.handleSearch())
            .finally(() => {
                singleDeleting[id] = false;
                this.setState({ singleDeleting });
            });
    };

    handleBatchDelete = () => {
        if (this.state.deleting) return;

        const { selectedRowKeys } = this.state;
        const content = (
            <span>
                您确定删除
                <span style={{ padding: "0 5px", color: "red", fontSize: 18 }}>
                    {selectedRowKeys.length}
                </span>
                条记录吗？
            </span>
        );
        Modal.confirm({
            title: "温馨提示",
            content,
            onOk: () => {
                this.setState({ deleting: true });
                this.props.ajax
                    .del(
                        "/mock/users",
                        { ids: selectedRowKeys },
                        { successTip: "删除成功！", errorTip: "删除失败！" }
                    )
                    .then(() => this.handleSearch())
                    .finally(() => this.setState({ deleting: false }));
            }
        });
    };

    render() {
        const {
            loading,
            deleting,
            dataSource,
            selectedRowKeys,
            total,
            pageNum,
            pageSize,
            id
        } = this.state;

        const { form } = this.props;
        const formProps = {
            form,
            width: 300,
            style: { paddingLeft: 16 }
        };
        const disabledDelete = !selectedRowKeys?.length;
        return (
            <PageContent>
                <QueryBar>
                    <Form onSubmit={this.handleSearch}>
                        <FormRow>
                            <FormElement
                                {...formProps}
                                label="名称"
                                field="name"
                            />
                            <FormElement
                                {...formProps}
                                type="select"
                                label="类别"
                                field="article_type"
                                options={[
                                    { value: 1, label: 1 },
                                    { value: 2, label: 2 }
                                ]}
                            />
                            <FormElement layout width="auto">
                                <Button type="primary" htmlType="submit">
                                    提交
                                </Button>
                                <Button onClick={() => form.resetFields()}>
                                    重置
                                </Button>
                            </FormElement>
                        </FormRow>
                    </Form>
                </QueryBar>

                <ToolBar
                    items={[
                        {
                            type: "primary",
                            icon: "plus",
                            text: "添加",
                            onClick: () => {
                                this.props.history.push("/article/_/edit/:id");
                            }
                        },
                        {
                            type: "danger",
                            icon: "delete",
                            text: "删除",
                            loading: deleting,
                            disabled: disabledDelete,
                            onClick: this.handleBatchDelete
                        }
                    ]}
                />

                <Table
                    rowSelection={{
                        selectedRowKeys,
                        onChange: selectedRowKeys =>
                            this.setState({ selectedRowKeys })
                    }}
                    loading={loading}
                    columns={this.columns}
                    dataSource={dataSource}
                    rowKey="id"
                    pagination={false}
                />

                <Pagination
                    total={total}
                    pageNum={pageNum}
                    pageSize={pageSize}
                    onPageNumChange={pageNum =>
                        this.setState({ pageNum }, this.handleSearch)
                    }
                    onPageSizeChange={pageSize =>
                        this.setState(
                            { pageSize, pageNum: 1 },
                            this.handleSearch
                        )
                    }
                />
            </PageContent>
        );
    }
}
