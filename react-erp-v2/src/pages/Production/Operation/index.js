import React, { PureComponent } from 'react';
import { Card, Form, Icon, Steps } from 'antd';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import router from 'umi/router';
import styles from './style.less';

const { Step } = Steps;
const routers = [
  'demands',
  'orders',
  'production',
];

@Form.create()
class StepForm extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {};
  }

  getCurrentStep() {
    const { location } = this.props;
    const { pathname } = location;
    const pathList = pathname.split('/');
    switch (pathList[pathList.length - 1]) {
      case 'demands':
        return 0;
      case 'orders':
        return 1;
      case 'production':
        return 2;
      default:
        return 0;
    }
  }

  handleChange = current => {
    router.push(`/production/operation/${routers[current]}`);
  };

  render() {
    const { children } = this.props;
    const current = this.getCurrentStep();
    return (
      <PageHeaderWrapper
        title="生产管理（业务）"
      >
        <Card bordered={false}>
          <Steps current={current} className={styles.steps} onChange={this.handleChange}>
            <Step title="需求" icon={<Icon type='container' />} />
            <Step title="订单" icon={<Icon type='database' />} />
            <Step title="生产" icon={<Icon type='control' />} />
          </Steps>
          {children}
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default StepForm;
