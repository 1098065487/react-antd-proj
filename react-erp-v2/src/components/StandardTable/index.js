import React, { PureComponent } from 'react';
import { Table } from 'antd';
import styles from './index.less';

class StandardTable extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {};
  }

  handleTableChange = (pagination, filters, sorter) => {
    const { onChange } = this.props;
    if (onChange) {
      onChange(pagination, filters, sorter);
    }
  };

  showTotal = (total) => {
    return `总计：${total}条`;
  };

  render() {
    const { dataSource = {}, rowKey, simple = false, pagination = {}, ...rest } = this.props;

    // 数据
    const data = dataSource.data || [];
    const dataPagination = (dataSource.meta && dataSource.meta.pagination) || {};
    const { current = 1, total = 0, page_size = 20 } = dataPagination;

    const paginationProps = {
      size: 'small',
      showSizeChanger: true,
      showQuickJumper: true,
      showTotal: this.showTotal,
      pageSize: page_size,
      total,
      current,
      simple,
      ...pagination,
    };

    return (
      <div className={styles.standardTable}>
        <Table
          size="small"
          rowKey={rowKey || 'id'}
          dataSource={data}
          pagination={paginationProps}
          onChange={this.handleTableChange}
          {...rest}
        />
      </div>
    );
  }
}

export default StandardTable;
