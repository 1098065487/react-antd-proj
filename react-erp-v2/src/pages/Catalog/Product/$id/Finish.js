import React from 'react';
import { router } from 'umi';
import { Button, Result } from 'antd';

class Finish extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {};
  }

  onFinish = () => {
    router.push('/products/product');
  };

  render() {
    return (
      <Result
        status="success"
        title="提交成功！"
        subTitle="还可以添加其他的描述信息"
        extra={
          <Button key="console" type="primary" onClick={this.onFinish}>
            返回产品库
          </Button>
        }
      />
    );
  }
}

export default Finish;
