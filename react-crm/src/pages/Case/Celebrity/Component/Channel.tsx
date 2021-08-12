import React, { useEffect, useState } from 'react';
import { List, Form, Row, Col, Select, Input, Space, message } from 'antd';
import { queryPlatforms } from '@/pages/Parameter/Platform/service';
import { ChannelProps } from '../data.d';
import styles from '../index.less';

let index = 1;
const { Option } = Select;

const Channel: React.FC<ChannelProps> = (props: ChannelProps) => {
  // 受控组件，value和onChange必须有
  const { value = [], onChange, form } = props;

  // 处理value为可使用的list格式（添加index）
  const getFirstValue = () => {
    if (value && value.length !== 0) {
      const firstValue: any[] = [];
      value.forEach((e: any) => {
        firstValue.push({ ...e, 'index': index, path: e?.pivot?.path });
        index += 1;
      });
      return firstValue;
    }
    return [{ index: 1 }] as any[];
  };

  const getFirstChecked = () => {
    if (value && value.length !== 0) {
      const firstChecked: any[] = [];
      value.forEach((e: any) => {
        firstChecked.push(e.id);
      });
      return firstChecked;
    }
    return [];
  };

  // 此受控组件的值
  const [list, setList] = useState<any[]>(getFirstValue());

  // 平台下拉选
  const [platforms, setPlatforms] = useState([]);
  // 已选中的平台下拉选（控制下拉选disabled）
  const [checkedOptions, setCheckedOptions] = useState<number[]>(getFirstChecked());

  // 请求平台下拉选
  useEffect(() => {
    (
      async () => {
        const res = await queryPlatforms({});
        if (res.status === 'ok') {
          setPlatforms(res.body.data);
        } else {
          message.warning('渠道列表请求失败');
        }
      }
    )();
  }, []);

  // path变化处理
  const handlePathChange = (base: string | undefined, idx: number) => {
    // form.setFieldsValue({ [`path_${idx}`]: base });
    const newList = list.map(item => {
      if (item.index === idx) {
        return { ...item, path: base };
      }
      return item;
    });
    setList(newList);
    if (onChange) {
      onChange(newList);
    }
  };

  /**
   * 平台下拉change时，清空本行关联的path，并将change结果值返回本组件和父组件form
   * @param pid
   * @param idx
   */
  const handlePlatformChange = (pid: any, idx: number) => {
    // 清空path，由于path的Form.Item不在同一层，使用resetFields不会立即生效，存在问题
    form.setFieldsValue({ [`path_${idx}`]: undefined }); // 对应path表单值清空
    handlePathChange(undefined, idx); // 对应path实际值清空
    // 处理结果
    const filterPlatform = platforms.filter((e: any) => e.id === pid) as any;
    if (filterPlatform.length !== 0) {
      const newList = list.map(item => {
        if (item.index === idx) {
          return { ...item, id: pid, channel: filterPlatform[0].channel, path: undefined };
        }
        return item;
      });
      // 根据结果判断已选中的option
      const checkedOptionList = newList.map(e => e?.id);
      const filterCheckedOption = checkedOptionList.filter(e => e !== undefined);
      setCheckedOptions(filterCheckedOption);
      // 结果值回传
      setList(newList);
      if (onChange) {
        onChange(newList);
      }
    }
  };

  // 添加行直接在末尾添加
  const handleAdd = () => {
    index += 1;
    const newList = list.concat([{ 'index': index }]);
    setList(newList);
    if (onChange) {
      onChange(newList);
    }
  };

  // 按index删除行，当最后一行删除后，自动添加空行，保证组件值必不为空
  const handleDelete = (idx: number) => {
    // 每次删除，选中的平台恢复未选中状态
    const toRemoveItem = list.filter(e => e.index === idx)[0];
    const newOptions = checkedOptions.filter(e => e !== toRemoveItem.id);
    setCheckedOptions(newOptions);

    const newList = list.filter(e => e.index !== idx);
    if (newList.length === 0) {
      index += 1;
      setList([{ 'index': index }]);
      if (onChange) {
        onChange([{ 'index': index }]);
      }
    } else {
      setList(newList);
      if (onChange) {
        onChange(newList);
      }
    }
  };

  return (
    <List
      style={{ padding: 0 }}
      dataSource={list}
      renderItem={e => (
        <List.Item key={e.index}>
          <Row style={{ width: '100%' }} align='middle'>
            <Col span={18}>
              <Form.Item
                name={`platform_${e.index}`}
                style={{ marginBottom: 10 }}
                rules={[
                  { required: true, message: '请选择平台' }
                ]}
                initialValue={e?.id}
              >
                <Select
                  placeholder='请选择平台'
                  onChange={id => handlePlatformChange(id, e.index)}
                >
                  {platforms.map((o: any) => (
                    <Option key={o.id} value={o.id} disabled={checkedOptions.includes(o.id)}>{o.name}</Option>
                  ))}
                </Select>
              </Form.Item>
              <Space>
                {e.channel ? (
                  <div style={{ marginRight: 20 }}>{e.channel}</div>
                ) : null}
                <Form.Item
                  name={`path_${e.index}`}
                  style={{ marginBottom: 0 }}
                  rules={[
                    { required: true, message: '请填写' }
                  ]}
                  initialValue={e?.path}
                >
                  <Input style={e.channel ? undefined : { width: 360 }} placeholder='请输入'
                         onChange={ele => handlePathChange(ele.target.value, e.index)} />
                </Form.Item>
              </Space>
            </Col>
            <Col span={5} offset={1}>
              <Space>
                <div className={styles.channel_button} onClick={handleAdd}>+</div>
                <div className={styles.channel_button} onClick={() => handleDelete(e.index)}>-</div>
              </Space>
            </Col>
          </Row>
        </List.Item>
      )}
    />
  )
};

export default Channel;
