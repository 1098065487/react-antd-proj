import React, { PureComponent, Fragment } from 'react';
import { Card, Steps } from 'antd';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import styles from './style.less';

const { Step } = Steps;

export default class StepForm extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {};
  }

  getCurrentStep() {
    const { location } = this.props;
    const { pathname } = location;
    const pathList = pathname.split('/');
    switch (pathList[pathList.length - 1]) {
      case 'create':
        return 0;
      case 'acknowledge':
        return 1;
      case 'processing':
        return 2;
      case 'finish':
        return 3;
      default:
        return 0;
    }
  }

  render() {
    const { location, children } = this.props;
    return (
      <PageHeaderWrapper
        title="导入数据"
        tabActiveKey={location.pathname}
        content="导入数据被分为四个步骤，对于历史数据可点击这里查看"
      >
        <Card bordered={false}>
          <Fragment>
            <Steps current={this.getCurrentStep()} className={styles.steps}>
              <Step title="上传数据" />
              <Step title="确认导入" />
              <Step title="数据处理中" />
              <Step title="结束" />
            </Steps>
            {children}
          </Fragment>
        </Card>
      </PageHeaderWrapper>
    );
  }
}
