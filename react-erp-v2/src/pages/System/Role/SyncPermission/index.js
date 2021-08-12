import { connect } from 'dva';
import React, { PureComponent } from 'react';
import { Button, Transfer } from 'antd';

@connect(({ rbac }) => ({ rbac }))
class SyncPermission extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      targets: [],
    };
  }

  componentDidMount() {
    // todo 后端计算
    const {
      dispatch,
      current: { id },
    } = this.props;
    dispatch({ type: 'rbac/fetchAllPermissions' });
    dispatch({
      type: 'rbac/fetchRolePermissions',
      payload: { roleId: id },
      callback: targets => {
        this.setState({ targets });
      },
    });
  }

  /**
   * 保存权限
   *
   * @param nextTargetKeys
   */
  handleChange = nextTargetKeys => {
    this.setState({ targets: nextTargetKeys });
    const {
      dispatch,
      current: { id },
    } = this.props;
    dispatch({
      type: 'rbac/assignPermissions',
      payload: { id, permissions: nextTargetKeys },
    });
  };

  renderFooter = () => (
    <Button size="small" style={{ float: 'right', margin: 5 }}>
      刷新
    </Button>
  );

  render() {
    const {
      rbac: { allPermissions },
    } = this.props;
    const { targets } = this.state;
    return (
      <Transfer
        lazy
        showSearch
        listStyle={{ width: 300, height: 400 }}
        operations={['分配', '移除']}
        dataSource={allPermissions}
        targetKeys={targets}
        onChange={this.handleChange}
        rowKey={item => item.id}
        render={item => `${item.name}-${item.description}`}
        footer={this.renderFooter}
      />
    );
  }
}

export default SyncPermission;
