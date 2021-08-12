/*
 * @Author: wjw
 * @Date: 2020-07-20 10:40:50
 * @LastEditTime: 2020-07-29 14:54:07
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \antd-demod:\work\erp\react-erp-v2\src\pages\Production\_Factory\index.js
 */
import React, { PureComponent } from 'react';
import { Form, Radio } from 'antd';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import router from 'umi/router';

@Form.create()
class StepForm extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {};
  }

  getCurrentRadio() {
    const { location } = this.props;
    const { pathname } = location;
    const pathList = pathname.split('/');
    return pathList[pathList.length - 1];
  }

  handleChange = e => {
    router.push(`/production/factory/${e.target.value}`);
  };

  renderContent = () => {
    const current = this.getCurrentRadio();
    return (
      <Radio.Group value={current} onChange={this.handleChange} buttonStyle="solid">
        <Radio.Button value="workbench">工作台</Radio.Button>
        <Radio.Button value="dataanalysis">数据分析</Radio.Button>
      </Radio.Group>
    );
  };

  render() {
    const { children } = this.props;
    return (
      <PageHeaderWrapper 
        title="生产管理（工厂）" 
        content={this.renderContent()}
      >
        {children}
      </PageHeaderWrapper>
    );
  }
}

export default StepForm;
