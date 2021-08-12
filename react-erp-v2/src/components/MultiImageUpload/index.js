import React, { Component } from 'react';
import { Upload, Icon, Modal, message } from 'antd';
import { baseUri } from '@/defaultSettings';
import { getAccessToken } from '@/utils/authority';
import styles from './style.less';

class MultiImageUpload extends Component {
  static getDerivedStateFromProps(nextProps, prevState) {
    // 声明这是一个受控组件，否则不能修改,表单的reset存在BUG
    if ('value' in nextProps) {
      const images = nextProps.value || [];
      const { hasChanged } = prevState;
      // 没有变化
      if (!hasChanged) {
        const fileList = images.map(img => {
          return { uid: img.id, url: img.url };
        });
        return { fileList };
      }
    }
    return null;
  }

  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      hasChanged: false,
      previewVisible: false,
      previewImage: '',
      fileList: [],
    };
  }

  toBase64 = file => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  };

  // 图片格式和大小限制
  beforeImgUpload = file => {
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error('图片不能超过 2MB!');
    }
    return isLt2M;
  };

  handleCancel = () => {
    this.setState({ previewVisible: false });
  };

  // 图片发生了变化
  handleChange = ({ file, fileList }) => {
    this.setState({
      hasChanged: true,
      fileList: [...fileList],
    }, () => {
      if (file.status === 'uploading') {
        this.setState({ loading: true });
      } else if (file.status === 'done') {
        this.triggerChange(fileList);
        this.setState({ loading: false });
      } else if (file.status === 'removed') {
        this.triggerChange(fileList);
      }
    });
  };

  // 上传后触发
  triggerChange = fileList => {
    const images = fileList.map(file => {
      // 判断url的值
      let { uid: id, url } = file;
      if (file.response) { // 新增图片
        const { url: newUrl } = file.response;
        id = null;
        url = newUrl;
      }

      return { id, url };
    });
    const { onChange } = this.props;
    // 添加你要输出的值，这里输出了一个对象，将被表单接收
    if (onChange) {
      onChange(images);
    }
  };

  handlePreview = async file => {
    if (!file.url && !file.preview) {
      // eslint-disable-next-line no-param-reassign
      file.preview = await this.toBase64(file.originFileObj);
    }

    this.setState({
      previewImage: file.url || file.preview,
      previewVisible: true,
    });
  };

  render() {
    const { params = {}, num = 99 } = this.props;
    const { loading, fileList, previewVisible, previewImage } = this.state;
    const uploadProps = {
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
          {...uploadProps}
          accept='image/*'
          listType="picture-card"
          fileList={fileList}
          onPreview={this.handlePreview}
          beforeUpload={this.beforeImgUpload}
          onChange={this.handleChange}
        >
          {fileList.length >= num ? null : uploadButton}
        </Upload>
        <Modal
          destroyOnClose
          visible={previewVisible}
          footer={null}
          onCancel={this.handleCancel}
        >
          <img alt="example" style={{ width: '100%' }} src={previewImage} />
        </Modal>
      </div>
    );
  }
}

export default MultiImageUpload;
