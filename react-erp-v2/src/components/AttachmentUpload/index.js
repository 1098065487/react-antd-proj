import React, { Component } from 'react';
import { Upload, Icon, Modal, message, Button } from 'antd';
import { baseUri } from '@/defaultSettings';
import { getAccessToken } from '@/utils/authority';
import styles from './style.less';

class AttachmentUpload extends Component {
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
    this.state = {
      loading: false,
      previewVisible: false,
      previewImage: '',
      fileList: [],
      images: [],
    };
  }

  componentDidMount() {
    const { value = [] } = this.props;
    const fileList = value.map(img => {
      return { uid: img.id, url: img.uri };
    });

    this.setState({ fileList, images: value });
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

  handleCancel = () => {
    this.setState({ previewVisible: false });
  };

  handleChange = info => {
    const { images } = this.state;
    const { file, fileList } = info;
    this.setState({ fileList: [...fileList] });
    if (file.status === 'uploading') {
      this.setState({ loading: true });
    } else if (file.status === 'done') {
      const { response: { id, uri } } = file;
      images[id] = uri;
      this.setState({ loading: false, images });
      this.triggerChange(fileList);
    } else if (file.status === 'removed') {
      this.triggerChange(fileList);
    }
  };

  // 上传后触发
  triggerChange = fileList => {
    const attachmentIds = [];
    // eslint-disable-next-line array-callback-return
    fileList.map(file => {
      let { uid } = file;
      // 判断url的值
      if (file.response) { // 新增图片
        const { id: aid } = file.response;
        uid = aid;
      }
      attachmentIds.push(uid);
    });
    const { onChange } = this.props;
    // 添加你要输出的值，这里输出了一个对象，将被表单接收
    if (onChange) {
      onChange(attachmentIds);
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
    const { params = {}, num = 99, listType = 'picture-card' } = this.props;
    const { loading, fileList, previewVisible, previewImage } = this.state;
    const uploadProps = {
      name: 'file',
      action: `${baseUri}/api/attachments/upload`,
      headers: { Authorization: getAccessToken() },
      data: params,
    };
    const uploadButton = (listType === 'picture-card') ? (
      <Icon type={loading ? 'loading' : 'plus'} />
      ) : (
        <Button>
          <Icon type="upload" /> 附件上传
        </Button>
    );
    return (
      <div
        className={styles.uploader}
      >
        <Upload
          {...uploadProps}
          listType={listType}
          accept={listType === 'picture-card' ? 'image/*' : ''}
          fileList={fileList}
          onPreview={this.handlePreview}
          beforeUpload={listType === 'picture-card' ? this.beforeImgUpload : null}
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

export default AttachmentUpload;
