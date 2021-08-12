import React, { PureComponent } from 'react';
import { Input, Modal, Form, message, Button } from 'antd';
import { Chart, Geom, Axis, Tooltip } from 'bizcharts';
import { connect } from 'dva';
import noteImg from '@/assets/note.png';

const formLayout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 18 },
};
const { TextArea } = Input;

@Form.create()
@connect(({ platform }) => ({
  platform,
}))
class Rating extends PureComponent {
  static getDerivedStateFromProps(props, state) {
    const {
      dataSource: { data },
    } = props;
    if (data !== state.prevData) {
      // 当外面父组件默认值变化时，里面初始props的值需要变化改变state
      return {
        prevData: data,
        data,
      };
    }
    return null;
  }

  constructor(props) {
    super(props);
    const {
      dataSource: { data },
    } = props;
    this.state = {
      data,
      eVisible: false,
      content: '',
      date: '',
      g2Inst: {}, // 不可以在外部定义，外部定义则只有一个，click取值时会取最后一个的值
      loading: false,
    };
  }

  getG2Instance = i => {
    this.setState({
      g2Inst: i,
    });
  };

  handleChartClick = e => {
    const { g2Inst } = this.state;
    const data = g2Inst.getSnapRecords({ x: e.x, y: e.y });
    if (data && data.length !== 0) {
      const {
        _origin: { note, date },
      } = data[0];
      this.setState({
        eVisible: true,
        content: note,
        date,
      });
    }
  };

  doEventCancel = () => {
    this.setState({
      eVisible: false,
      content: '',
    });
  };

  handleFormSubmit = () => {
    const { dispatch, form, id, refresh } = this.props;
    const { date } = this.state;
    form.validateFieldsAndScroll((err, fieldValues) => {
      if (err) {
        return;
      }
      this.setState({ loading: true });
      dispatch({
        type: 'platform/createDailyNote',
        payload: { id, params: { date, ...fieldValues } },
        callback: res => {
          if (res.status === 'ok') {
            message.success('保存成功！', 5);
            this.setState(
              {
                eVisible: false,
                content: '',
                date: '',
                loading: false,
              },
              refresh
            );
          }
        },
      });
    });
  };

  render() {
    const {
      form: { getFieldDecorator },
    } = this.props;
    const { eVisible, data, content, loading } = this.state;
    const axisInterval = () => {
      if (data.length) {
        const scoreList = data.map(item => item.rating);
        const min = Math.floor(Math.min(...scoreList));
        const max = Math.ceil(Math.max(...scoreList));
        return { min, max };
      }
      return { min: 0, max: 5 };
    };
    const { min, max } = axisInterval();
    const scale = {
      rating: {
        alias: '星评',
        min,
        max,
      },
      amount: {
        alias: '销售额',
        min: 0,
      },
      second_rank: {
        alias: '排名',
        min: 0,
      },
      date: {
        alias: '日期',
        type: 'time',
      },
      note: {
        alias: '备注',
      },
    };

    return (
      <div>
        <Chart
          height={200}
          data={data}
          scale={scale}
          padding={[5, 0, 5, 0]}
          onPlotClick={this.handleChartClick}
          onGetG2Instance={this.getG2Instance}
          forceFit
        >
          <Tooltip />
          <Axis name="date" />
          <Geom type="line" position="date*rating" color="#196F3D" size={1} />
          <Geom type="line" position="date*amount" color="#F91F18" size={1} shape="smooth" />
          <Geom
            type="point"
            position="date*amount"
            color="#F91F18"
            tooltip={false}
            shape={[
              'note',
              note => {
                if (!note || note === '') {
                  return 'circle';
                }
                return ['image', noteImg];
              },
            ]}
            size={['note', note => (!note || note === '' ? 0 : 15)]}
          />
          <Geom
            type="line"
            position="date*second_rank"
            // color="#184FF9"
            size={1}
          />
        </Chart>
        {eVisible && (
          <Modal
            title="添加备注"
            destroyOnClose
            visible={eVisible}
            onCancel={this.doEventCancel}
            onOk={this.handleFormSubmit}
            footer={[
              <Button key="cancel" onClick={this.doEventCancel}>
                取消
              </Button>,
              <Button key="submit" type="primary" loading={loading} onClick={this.handleFormSubmit}>
                提交
              </Button>,
            ]}
          >
            <Form.Item label="备注" {...formLayout}>
              {getFieldDecorator('note', {
                rules: [{ required: true, message: '备注信息不能为空' }],
                initialValue: content,
              })(<TextArea rows={4} placeholder="备注信息" />)}
            </Form.Item>
          </Modal>
        )}
      </div>
    );
  }
}

export default Rating;
