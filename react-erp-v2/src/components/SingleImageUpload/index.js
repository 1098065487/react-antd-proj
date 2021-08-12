import React, { Component } from 'react';
import { Upload, Icon, message } from 'antd';
import { baseUri } from '@/defaultSettings';
import { getAccessToken } from '@/utils/authority';
import styles from './style.less';

class SingleImageUpload extends Component {
  static getDerivedStateFromProps(nextProps) {
    // 声明这是一个受控组件，否则不能修改
    if ('value' in nextProps) {
      const image = nextProps.value || '';
      return { image };
    }
    return null;
  }

  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      image: '',
    };
  }

  toBase64 = (img, callback) => {
    const reader = new FileReader();
    reader.addEventListener('load', () => callback(reader.result));
    reader.readAsDataURL(img);
  };

  // 图片格式和大小限制
  beforeUpload = file => {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
    if (!isJpgOrPng) {
      message.error('只能上传 JPG/PNG 文件!');
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error('图片不能超过 2MB!');
    }
    return isJpgOrPng && isLt2M;
  };

  handleChange = info => {
    const { file } = info;
    if (file.status === 'uploading') {
      this.setState({ loading: true });
      return;
    }
    if (file.status === 'done') {
      const { response: { url } } = file;
      this.toBase64(file.originFileObj, () =>
        this.setState({ loading: false }),
      );
      this.triggerChange(url);
    }
  };

  // 上传后触发
  triggerChange = changedValue => {
    const { onChange } = this.props;
    // 添加你要输出的值，这里输出了一个对象
    if (onChange) {
      onChange(changedValue);
    }
  };

  render() {
    const { params = {} } = this.props;
    const { loading, image } = this.state;
    const upProps = {
      name: 'file',
      action: `${baseUri}/api/upload`,
      headers: { Authorization: getAccessToken() },
      data: params,
    };
    const uploadButton = <Icon type={loading ? 'loading' : 'plus'} />;
    return (
      <div
        className={styles.uploader}
      >
        <Upload
          {...upProps}
          accept='image/*'
          listType="picture-card"
          showUploadList={false}
          onPreview={this.handlePreview}
          beforeUpload={this.beforeUpload}
          onChange={this.handleChange}
        >
          {image ? <img src={image} alt="img" style={{ width: '100%' }} /> : uploadButton}
        </Upload>
      </div>
    );
  }
}

export default SingleImageUpload;
