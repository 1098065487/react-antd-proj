import React, { Fragment } from 'react';
import { Table, Button, Input } from 'antd';

let count = 1;

class ImageList extends React.Component {
  static getDerivedStateFromProps(nextProps) {
    // 声明这是一个受控组件，否则不能修改
    if ('value' in nextProps) {
      return {
        ...(nextProps.value || []),
      };
    }
    return null;
  }

  constructor(props) {
    super(props);
    const { value } = props;
    const list = [];
    value.forEach(e => {
      list.push({ ...e, key: count });
      count += 1;
    });
    this.state = {
      dataSource: list,
    };
  }

  handelChange = () => {
    const { onChange } = this.props;
    const { dataSource } = this.state;
    if (onChange) {
      onChange(dataSource);
    }
  };

  handleImageChange = (value, key) => {
    const { dataSource } = this.state;
    const list = [];
    dataSource.forEach(e => {
      if(e.key === key) {
        if(value.replace(/(^\s*)|(\s*$)/g,"")) {
          list.push({ ...e, url: value });
        }
      } else {
        list.push({ ...e });
      }
    });
    this.setState({
      dataSource: list,
    }, () => this.handelChange())
  };

  handleAdd = () => {
    const { dataSource } = this.state;
    const newData = {
      key: count,
      id: '',
      url: '',
    };
    count += 1;
    this.setState({
      dataSource: [ ...dataSource, newData ]
    })
  };

  handleDelete = (key) => {
    const { dataSource } = this.state;
    this.setState({ dataSource: dataSource.filter(item => item.key !== key) }, () => this.handelChange());
  };

  render() {
    const { dataSource } = this.state;

    const imageColumns = [
      {
        title: '预览',
        dataIndex: 'preview',
        render: (text, record) => {
          if(record.url) {
            return <img src={record.url} alt='' style={{ width: 40, height: 40 }} />
          }
          return null;
        }
      },
      {
        title: '图片链接',
        dataIndex: 'url',
        render: (text, record) => {
          if(text || text === '') {
            return <Input
              value={text}
              placeholder="请输入图片链接"
              onChange={e => this.handleImageChange(e.target.value, record.key)}
            />
          }
          return null
        }
      },
      {
        title: '操作',
        dataIndex: 'action',
        width: 160,
        render: (text, record) => (
          <Fragment>
            <Button
              type="danger"
              icon="delete"
              size="small"
              onClick={() => this.handleDelete(record.key)}
            />
          </Fragment>
        ),
      },
    ];

    return (
      <Fragment>
        <Table
          rowKey="key"
          dataSource={dataSource}
          columns={imageColumns}
          pagination={false}
          footer={() => {
            return <Button icon="plus" onClick={this.handleAdd}>添加图片链接</Button>;
          }}
        />
      </Fragment>
    );
  }
}

export default ImageList;
