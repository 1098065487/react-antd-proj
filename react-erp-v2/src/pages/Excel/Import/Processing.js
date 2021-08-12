import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Result, Button, Icon } from 'antd';
import router from 'umi/router';

@connect(({ excel }) => ({ excel }))
class Processing extends PureComponent {
  constructor(props) {
    super(props);
    const { location: { query } } = props;
    this.state = {
      query,
      time: 0,
      stop: false,
    };
  }

  componentDidMount() {
    this.initImport();
  }

  componentWillUnmount() {
    this.destroyTimer();
  }

  initImport = () => {
    const { dispatch, location: { query: { type = 'product' } } } = this.props;
    const { query: { id }, time } = this.state;
    dispatch({
      type: 'excel/fetchAnImport',
      payload: { id },
      callback: current => {
        const { status } = current;
        if (status !== 'processing') {
          this.destroyTimer();
          if (status === 'create') {
            router.push(`/excel/imports/acknowledge?id=${id}`);
          } else {
            router.push(`/excel/imports/${status}?id=${id}&type=${type}`);
          }
        }
        // 初始化
        if (time === 0) {
          this.initTimer();
        }
      },
    });
  };

  // 初始化定时器
  initTimer = () => {
    this.timer = setInterval(() => {
      const { time } = this.state;
      if (time > 10) {
        this.destroyTimer();
        this.setState({ stop: true });
      } else {
        this.setState(
          { time: time + 1 },
          () => this.initImport(),
        );
      }
    }, 2000);
  };

  // 销毁定时器
  destroyTimer = () => {
    clearInterval(this.timer);
    this.timer = undefined;
  };

  // 刷新
  handleReload = () => {
    this.setState({
      time: 0,
      stop: false,
    }, () => this.initImport());
  };

  render() {
    const { stop } = this.state;

    return (
      <Result
        icon={<Icon type={stop ? 'stop' : 'loading'} style={{ color: '#52C41A' }} />}
        title="程序处理中..."
        subTitle="请耐心等待，数据量越大时间越久！如果页面停止刷新可点击刷新按钮！"
        extra={stop && <Button type="primary" onClick={this.handleReload}>刷新</Button>}
      />
    );
  }
}

export default Processing;
