import React, { PureComponent } from 'react';
import { Card, Form, message, Steps } from 'antd';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import router from 'umi/router';
import styles from './style.less';

const { Step } = Steps;
const routers = [
  'info',
  'items',
  'detail',
];

@Form.create()
class StepForm extends PureComponent {
  constructor(props) {
    super(props);
    const { match: { params } } = this.props;
    this.state = { params };
  }

  getCurrentStep() {
    const { location } = this.props;
    const { pathname } = location;
    const pathList = pathname.split('/');
    switch (pathList[pathList.length - 1]) {
      case 'info':
        return 0;
      case 'items':
        return 1;
      case 'detail':
        return 2;
      default:
        return 0;
    }
  }

  handleChange = current => {
    const { params: { id } } = this.state;
    if (id && id === 'create') {
      message.warning('新建状态下，不能直接跳转！');
    } else {
      router.push(`/products/product/${id}/${routers[current]}`);
    }
  };

  render() {
    const { children } = this.props;
    const current = this.getCurrentStep();
    return (
      <PageHeaderWrapper
        title="产品编辑/新建"
        content="我们将用三个步骤来完成对单品的维护！"
      >
        <Card bordered={false}>
          <Steps current={current} className={styles.steps} onChange={this.handleChange}>
            <Step title="货号信息" />
            <Step title="单品信息" />
            <Step title="信息汇总" />
          </Steps>
          {children}
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default StepForm;
