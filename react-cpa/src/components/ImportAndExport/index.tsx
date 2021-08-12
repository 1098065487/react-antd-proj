import React, { useRef, useState } from 'react';
import { Drawer, Modal, Divider, Upload, message, Button, Radio, Spin } from 'antd';
import {
  DownloadOutlined,
  CloudUploadOutlined,
  PieChartOutlined,
  FileDoneOutlined,
  FileUnknownOutlined,
} from '@ant-design/icons';
import { getUploadProps, apiHost } from '@/utils/http';
import { IOType, IOProps, ImportTableItem } from './data.d';
import styles from './index.less';
import { upload, getUploadResult, queryImports, queryExports } from './service';
import Result from './component/Result';
import StandardTable from '@/components/StandardTable';

const { Dragger } = Upload;

const ImportAndExport: React.FC<IOProps> = (props) => {
  const { visible, type, importVisible, handleDrawerVisible, importType } = props;
  const actionRef = useRef<any>();

  // upload需要提供的两个参数
  const [name, setName] = useState('');
  const [path, setPath] = useState('');

  // 控制上传按钮可用
  const [disable, setDisable] = useState(true);
  // 控制上传按钮loading
  const [loading, setLoading] = useState(false);

  // 控制结果界面loading
  const [spinning, setSpinning] = useState(false);
  // 控制结果内容
  const [result, setResult] = useState<any>(undefined);

  // 控制列表页result展示
  const [resultVisible, setResultVisible] = useState(false);
  const [current, setCurrent] = useState<ImportTableItem>({} as ImportTableItem);

  const uploadProps = getUploadProps();

  // upload组件上传后回调
  const handleOnChange = (res: any) => {
    const { file } = res;
    if (file && file.status === 'done') {
      setDisable(false);
      setName(file.name);
      setPath(file.response.data.url);
    }
  };

  // 上传到服务器
  const handleUpload = async () => {
    setLoading(true);
    setSpinning(true);
    if (importType) {
      const res = await upload({
        type: importType,
        fileInfo: { name, path },
        params: { repetitive_rule: 'coverage', exceptional_rule: 'record' },
      });
      if (res.status === 'ok') {
        if (res.data.result) {
          setResult(res.data.result);
        } else {
          const { id } = res.data;
          let time = 1;
          const getResultInterval = setInterval(async () => {
            const response = await getUploadResult(id);
            time += 1;
            if (response.status === 'ok') {
              if (response.data.status === 'finish') {
                setResult(response.data.result);
                setLoading(false);
                setSpinning(false);
                clearInterval(getResultInterval);
              }
            }
            if (time > 10) {
              setLoading(false);
              setSpinning(false);
              message.warning('上传超时，请稍后列表查看结果！', 5000);
              clearInterval(getResultInterval);
            }
          }, 2000);
        }
      } else {
        message.error('上传失败！');
      }
    }
  };

  const handleTypeChange = (value: IOType) => {
    handleDrawerVisible(visible, value);
    if (actionRef.current) {
      actionRef.current.reset();
    }
  };

  const handleQueryImportOrExport = async (items: any) => {
    const { tableType } = items;
    if (tableType === 'import') {
      const res = await queryImports({ ...items, sorter: { updated_at: 'descend' } });
      if (res.status === 'ok') {
        return res;
      }
      message.error('列表数据请求失败！');
      return { data: [] };
    } else {
      const res = await queryExports({ ...items, sorter: { updated_at: 'descend' } });
      if (res.status === 'ok') {
        return res;
      }
      message.error('列表数据请求失败！');
      return { data: [] };
    }
  };

  const handleResultVisible = (flag: boolean, record: ImportTableItem) => {
    setResultVisible(flag);
    setCurrent(record);
  };

  const importColumns: any[] = [
    { title: 'ID', dataIndex: 'id' },
    { title: '类型', dataIndex: 'type' },
    { title: '上传文件', dataIndex: 'file_name' },
    { title: '状态', dataIndex: 'status' },
    {
      title: '结果',
      dataIndex: 'result',
      render: (_: any, record: any) => (
        <Button
          disabled={!record.result}
          size="small"
          type="primary"
          onClick={() => handleResultVisible(true, record)}
        >
          <PieChartOutlined />
        </Button>
      ),
    },
    {
      title: '上传时间',
      dataIndex: 'updated_at',
    },
  ];

  const exportColumns: any[] = [
    { title: 'ID', dataIndex: 'id' },
    { title: '类型', dataIndex: 'type' },
    { title: '状态', dataIndex: 'status' },
    {
      title: '结果',
      dataIndex: 'file_path',
      render: (_a: any, record: any) =>
        !!record.file_path ? (
          <a href={`${apiHost}/storage/${record.file_path}`} rel="noreferrer" target="_blank">
            <FileDoneOutlined />
            下载
          </a>
        ) : (
          <div className={styles.file_none}>
            <FileUnknownOutlined />
            未知
          </div>
        ),
    },
    {
      title: '上传时间',
      dataIndex: 'updated_at',
    },
  ];

  return (
    <>
      <Drawer
        destroyOnClose
        placement="left"
        width="100%"
        style={{ zIndex: 999 }} // 在这个项目的这个页面，会干扰导入弹框的展示，具体为遮盖
        title={
          <Radio.Group
            value={type}
            buttonStyle="solid"
            style={{ display: 'flex' }}
            onChange={(e) => handleTypeChange(e.target.value)}
          >
            <Radio.Button value="import">导入</Radio.Button>
            <Radio.Button value="export">导出</Radio.Button>
          </Radio.Group>
        }
        visible={visible}
        onClose={() => handleDrawerVisible(false, type)}
      >
        <StandardTable
          rowKey="id"
          request={(params: any) => handleQueryImportOrExport({ ...params, tableType: type })}
          cref={actionRef}
          bordered
          size="default"
          columns={type === 'import' ? importColumns : exportColumns}
        />

        {resultVisible ? (
          <Modal
            destroyOnClose
            width={550}
            visible={resultVisible}
            onCancel={() => handleResultVisible(false, {} as ImportTableItem)}
            footer={null}
          >
            <Result data={current.result} />
          </Modal>
        ) : null}

        {importVisible ? (
          <Modal
            destroyOnClose
            width={550}
            visible={importVisible}
            onCancel={() => {
              handleDrawerVisible(true, type, false);
              if (actionRef.current) {
                actionRef.current.reset();
              }
            }}
            footer={null}
          >
            <div className={styles.modal}>
              <div className={styles.title}>
                第一步：<span>下载模板</span>
              </div>
              <a
                href={`${apiHost}/templates/${importType}.xlsx`}
                target="_blank"
                rel="noreferrer"
                className={styles.file_download}
              >
                {`${importType}.xlsx`} <DownloadOutlined />
              </a>
              <Divider className={styles.modal_divider} />
              <div className={styles.title}>
                第二步：<span>回传</span>
              </div>
              <Dragger {...uploadProps} onChange={handleOnChange}>
                <p className="ant-upload-drag-icon">
                  <CloudUploadOutlined />
                </p>
                <p className="ant-upload-text">单击或拖动文件到此区域上传！</p>
              </Dragger>
              <Button
                type="primary"
                onClick={handleUpload}
                className={styles.button}
                disabled={disable}
                loading={loading}
              >
                上传
              </Button>
              <Divider className={styles.modal_divider} />
              <div className={styles.title}>导入结果：</div>
              {result ? (
                <Result data={result} />
              ) : (
                <Spin tip="处理中..." size="large" spinning={spinning}>
                  <div className={styles.result}>暂无结果</div>
                </Spin>
              )}
            </div>
          </Modal>
        ) : null}
      </Drawer>
    </>
  );
};

export default ImportAndExport;
