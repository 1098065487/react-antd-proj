import React, { useState } from 'react';
import { Form, Input, Modal, Select, Row, Col, message, Button } from 'antd';
import _ from "lodash";
import { queryBrands } from '@/pages/Parameter/Brand/service';
import { queryTags } from '@/pages/Parameter/Tag/service';
import ErrorInfo from '@/components/ErrorInfo';
import { CelebrityFormProps } from '../data.d';
import { createCelebrity, updateCelebrity } from '../service';
import Channel from './Channel';
import styles from '../index.less';

const FormItem = Form.Item;
const { Option } = Select;
const { TextArea } = Input;

const CelebrityFrom: React.FC<CelebrityFormProps> = props => {
  const [form] = Form.useForm();
  const { current, visible, handleVisible, actionRef, refreshStatistic } = props;
  const hasCurrent = current && Object.keys(current).length !== 0;
  const [errors, setErrors] = useState({});

  // 品牌下拉list
  const [brand, setBrand] = useState([]);
  // tag下拉list
  const [firstTag, setFirstTag] = useState([]);
  const [secondTag, setSecondTag] = useState([]);
  const [otherTag, setOtherTag] = useState([]);

  const handleSubmit = async (value: any) => {
    const { brand_ids, one_tag_ids, two_tag_ids, other_tag_ids } = value;
    const brands = brand_ids.map((e: any) => e.value);
    const firstTags = one_tag_ids.map((e: any) => e.value);
    const secondTags = two_tag_ids.map((e: any) => e.value);
    const otherTags = other_tag_ids.map((e: any) => e.value);
    if (hasCurrent) {
      const res = await updateCelebrity(
        current.id,
        {
          ...value,
          brand_ids: brands,
          one_tag_ids: firstTags,
          two_tag_ids: secondTags,
          other_tag_ids: otherTags,
        }
      );
      if (res.status === 'ok') {
        handleVisible(false, {});
        message.success('更新成功！');
        if (actionRef) {
          actionRef.current.reload();
        }
      } else {
        message.error('保存失败！详情见弹窗底部栏');
        setErrors(res.body.errors);
      }
    } else {
      const res = await createCelebrity({
        ...value,
        brand_ids: brands,
        one_tag_ids: firstTags,
        two_tag_ids: secondTags,
        other_tag_ids: otherTags,
      });
      if (res.status === 'ok') {
        handleVisible(false, {});
        message.success('保存成功！');
        if (actionRef) {
          actionRef.current.reload();
          refreshStatistic();
        }
      } else {
        message.error('保存失败！详情见弹窗底部栏');
        setErrors(res.body.errors);
      }
    }
  };

  const handleBrandSearch = async (name: string) => {
    const res = await queryBrands({ filters: { name } })
    if (res.status === 'ok') {
      setBrand(res.body.data);
    } else {
      message.warning('品牌列表请求失败');
    }
  };

  const handleTagSearch = async (name: string, level: number) => {
    const res = await queryTags({ filters: { tag: name, level } });
    if (res.status === 'ok') {
      if (level === 1) {
        setFirstTag(res.body.data);
      }
      if (level === 2) {
        setSecondTag(res.body.data);
      }
      if (level === 3) {
        setOtherTag(res.body.data);
      }
    } else {
      message.warning('tag列表请求失败')
    }
  };

  const renderFormatChannels = (list: any[] | undefined) => {
    if (list && list.length !== 0) {
      return list.map((e: any) => ({ ...e, path: e?.pivot?.path }));
    }
    return list;
  };

  const renderFirstBrands = (list: any[] | undefined) => {
    const firstBrandList: any[] = [];
    if (list && list.length !== 0) {
      list.forEach(e => {
        firstBrandList.push({ label: e.name, value: e.id });
      })
    }
    return firstBrandList;
  };

  const renderFirstTags = (list: any[] | undefined, level: number) => {
    const renderTagList: any[] = [];
    if (list && list.length !== 0) {
      const filterTagsByLevel = list.filter(o => o.level === level);
      filterTagsByLevel.forEach(e => {
        renderTagList.push({ label: e.tag, value: e.id });
      })
    }
    return renderTagList;
  };

  return (
    <Modal
      destroyOnClose
      title={hasCurrent ? '编辑红人' : '新建红人'}
      width={600}
      visible={visible}
      onOk={() => form.submit()}
      onCancel={() => handleVisible(false, {})}
      footer={Object.keys(errors).length !== 0 ? [
        <ErrorInfo key='errors' errors={errors} />,
        <Button key="cancel" onClick={() => handleVisible(false, {})}>
          取消
        </Button>,
        <Button key="submit" type="primary" onClick={() => form.submit()}>
          保存
        </Button>,
      ] : [
        <Button key="cancel" onClick={() => handleVisible(false, {})}>
          取消
        </Button>,
        <Button key="submit" type="primary" onClick={() => form.submit()}>
          保存
        </Button>,
      ]}
    >
      <Form
        scrollToFirstError
        onFinish={handleSubmit}
        initialValues={{
          name: current?.name,
          email: current?.email,
          brand_ids: renderFirstBrands(current?.brands),
          one_tag_ids: renderFirstTags(current?.tags, 1),
          two_tag_ids: renderFirstTags(current?.tags, 2),
          other_tag_ids: renderFirstTags(current?.tags, 3),
          detail: current?.detail,
          channels: renderFormatChannels(current?.platforms),
        }}
        form={form}
        layout='vertical'
      >
        <FormItem
          label="红人名称"
          name='name'
          rules={[
            { required: true, message: '请输入红人名称' }
          ]}
          className={styles.celebrity_form}
        >
          <Input placeholder="请输入" disabled={hasCurrent} />
        </FormItem>
        <FormItem
          label="邮箱"
          name='email'
          rules={[
            { type: 'email', message: '请输入有效的邮箱格式' }
          ]}
          className={styles.celebrity_form}
        >
          <Input placeholder="请输入" />
        </FormItem>
        <FormItem
          label="品牌线"
          name='brand_ids'
          className={styles.celebrity_form}
        >
          <Select
            mode='multiple'
            labelInValue
            allowClear
            showSearch
            placeholder="请查询选择"
            filterOption={false}
            onSearch={_.debounce(handleBrandSearch, 500)}
          >
            {brand.map((e: any) => (
              <Option key={e.id} value={e.id}>{e.name}</Option>
            ))}
          </Select>
        </FormItem>
        <Row>
          <Col span={7}>
            <FormItem
              label="一级Tag"
              name='one_tag_ids'
              className={styles.celebrity_form}
              rules={[
                { required: true, message: '请选择Tag' }
              ]}
            >
              <Select
                mode='multiple'
                labelInValue
                allowClear
                showSearch
                placeholder="请查询选择"
                filterOption={false}
                onSearch={_.debounce(value => handleTagSearch(value, 1), 500)}
              >
                {firstTag.map((e: any) => (
                  <Option key={e.id} value={e.id}>{e.tag}</Option>
                ))}
              </Select>
            </FormItem>
          </Col>
          <Col span={7} offset={1}>
            <FormItem
              label="二级Tag"
              name='two_tag_ids'
              className={styles.celebrity_form}
              rules={[
                { required: true, message: '请选择Tag' }
              ]}
            >
              <Select
                mode='multiple'
                labelInValue
                allowClear
                showSearch
                placeholder="请查询选择"
                filterOption={false}
                onSearch={_.debounce(value => handleTagSearch(value, 2), 500)}
              >
                {secondTag.map((e: any) => (
                  <Option key={e.id} value={e.id}>{e.tag}</Option>
                ))}
              </Select>
            </FormItem>
          </Col>
          <Col span={7} offset={1}>
            <FormItem
              label="其他Tag"
              name='other_tag_ids'
              className={styles.celebrity_form}
            >
              <Select
                mode='multiple'
                labelInValue
                allowClear
                showSearch
                placeholder="请查询选择"
                filterOption={false}
                onSearch={_.debounce(value => handleTagSearch(value, 3), 500)}
              >
                {otherTag.map((e: any) => (
                  <Option key={e.id} value={e.id}>{e.tag}</Option>
                ))}
              </Select>
            </FormItem>
          </Col>
        </Row>
        <FormItem
          label="红人详情"
          name='detail'
          className={styles.celebrity_form}
        >
          <TextArea placeholder='请输入' />
        </FormItem>
        <FormItem
          label="频道"
          name='channels'
          rules={[
            { required: true, message: '请填写渠道！' }
          ]}
          className={styles.celebrity_form}
        >
          <Channel form={form} />
        </FormItem>
      </Form>
    </Modal>
  );
};

export default CelebrityFrom;
