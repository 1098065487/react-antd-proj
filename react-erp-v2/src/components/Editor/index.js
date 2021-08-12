import React, { Fragment } from 'react';
import { Upload, Icon } from 'antd';
import BraftEditor from 'braft-editor';
import { ContentUtils } from 'braft-utils';
import { baseUri } from '@/defaultSettings';
import { getAccessToken } from '@/utils/authority';
import 'braft-editor/dist/index.css';
import styles from './style.less';

export default class UploadDemo extends React.Component {
  static getDerivedStateFromProps(nextProps) {
    // 声明这是一个受控组件，否则不能修改
    if ('value' in nextProps) {
      return {
        ...(nextProps.value || {}),
      };
    }
    return null;
  }

  constructor(props) {
    super(props);
    const value = props.value || '';
    this.state = {
      editorState: BraftEditor.createEditorState(value),
    };
  }

  handleChange = editorState => {
    this.setState({
      editorState,
    }, () => this.triggerChange());
  };

  uploadHandler = info => {
    const { file } = info;
    const { editorState } = this.state;
    if (file.status === 'done') {
      const { response: { url } } = file;
      this.setState({
        editorState: ContentUtils.insertMedias(editorState, [{
          url,
          type: 'IMAGE',
        }]),
      }, () => this.triggerChange());
    }
  };

  // 上传后触发
  triggerChange = () => {
    const { onChange } = this.props;
    // 添加你要输出的值，这里输出了一个对象
    if (onChange) {
      const { editorState } = this.state;
      onChange(editorState.toHTML());
    }
  };

  handlePreview = () => {
    console.log('预览暂不支持');
  };

  render() {
    const { editorState } = this.state;
    const upProps = {
      name: 'file',
      action: `${baseUri}/api/upload`,
      headers: { Authorization: getAccessToken() },
      data: { type: 'editor', url: true },
    };
    const extendControls = [{
      key: 'uploader',
      type: 'component',
      component: (
        <Upload
          {...upProps}
          showUploadList={false}
          onChange={this.uploadHandler}
        >
          <button type="button" className="control-item button upload-button" data-title="插入图片">
            <Icon type="picture" theme="filled" />
          </button>
        </Upload>
      ),
    }, {
      key: 'preview',
      type: 'button',
      text: '预览',
      onClick: this.handlePreview,
    }];

    return (
      <Fragment>
        <div className={styles.editor}>
          <BraftEditor
            value={editorState}
            forceNewLine={false}
            onChange={this.handleChange}
            extendControls={extendControls}
          />
        </div>
      </Fragment>
    );
  }
}
