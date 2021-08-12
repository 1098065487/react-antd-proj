import React from 'react';
import { Space, Popover } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';

const ErrorInfo: React.FC<{ errors: any }> = props => {
  const { errors } = props;
  const errorList: string[] = [];

  if (errors && Object.keys(errors).length !== 0) {
    Object.values(errors).forEach((e: any) => {
      e.forEach((o: any) => {
        errorList.push(o);
      })
    })
  }

  const renderErrors = () => {
    if (errorList.length !== 0) {
      return errorList.map((e: string, index: number) => {
        return (
          <li key={index}>{e}</li>
        )
      })
    }
    return null;
  };

  return (
    <Space style={{ color: 'red', marginRight: 12 }}>
      <Popover
        title="表单校验错误信息"
        content={renderErrors()}
        trigger="click"
      >
        <ExclamationCircleOutlined />
      </Popover>
      {errorList.length}
    </Space>
  );
};

export default ErrorInfo;
