import { connect } from 'dva';
import React, { PureComponent } from 'react';
import { Button, Transfer } from 'antd';

@connect(({ user, rbac, loading }) => ({
  user,
  rbac,
  loading: loading.effects['rbac/fetchAllRoles'],
}))
class AssignRole extends PureComponent {
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
    // 稍微有延迟
    dispatch({ type: 'rbac/fetchAllRoles' });
    dispatch({
      type: 'user/fetchRoles',
      payload: { id },
      callback: targets => {
        this.setState({ targets });
      },
    });
  }

  /**
   * 保存角色
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
      type: 'user/assignRoles',
      payload: { id, roles: nextTargetKeys },
    });
  };

  renderFooter = () => (
    <Button size="small" style={{ float: 'right', margin: 5 }}>
      刷新
    </Button>
  );

  render() {
    const {
      rbac: { allRoles },
    } = this.props;
    const { targets } = this.state;
    return (
      <Transfer
        lazy
        showSearch
        listStyle={{ width: 300, height: 400 }}
        operations={['分配', '移除']}
        dataSource={allRoles}
        targetKeys={targets}
        onChange={this.handleChange}
        rowKey={item => item.id}
        render={item => `${item.name}-${item.description}`}
        footer={this.renderFooter}
      />
    );
  }
}

export default AssignRole;
