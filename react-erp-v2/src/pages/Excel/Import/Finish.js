import React, { Fragment } from 'react';
import { connect } from 'dva';
import { Result, Button } from 'antd';
import Link from 'umi/link';
import router from 'umi/router';
import { Pie } from '@/components/Charts';
import { baseUri } from '@/defaultSettings';
import styles from './style.less';

@connect(({ excel, loading }) => ({
  excel,
  loading: loading.effects['excel/fetchAnImport'],
}))
class Finish extends React.PureComponent {
  constructor(props) {
    super(props);
    const { location: { query } } = props;
    this.state = {
      query,
      result: {
        total: 0,
        success: 0,
        skip: 0,
        error: 0,
        error_file: null,
      },
    };
  }

  componentDidMount() {
    const { dispatch } = this.props;
    const { query: { id } } = this.state;
    dispatch({
      type: 'excel/fetchAnImport',
      payload: { id },
      callback: data => {
        const { status, result } = data;
        if (status !== 'finish') {
          if (status === 'create') {
            router.push(`/excel/imports/acknowledge?id=${id}`);
          } else {
            router.push(`/excel/imports/${status}?id=${id}`);
          }
        }
        this.setState({ result });
      },
    });
  }

  render() {
    const { location: { query: { type = 'product' } } } = this.props;
    const { result } = this.state;
    const colors = ['#00C853', '#FFAB00', '#F44336'];
    const salesData = [
      {
        x: 'success',
        y: result ? result.success : 0,
      },
      {
        x: 'skip',
        y: result ? result.skip : 0,
      },
      {
        x: 'error',
        y: result ? result.error : 0,
      },
    ];

    const actions = (
      <Fragment>
        <Button type="link">
          <Link to={`/excel/imports/create?type=${type}`}>再次导入</Link>
        </Button>
        <Button type="link">
          {result && result.error_file ?
            <a href={`${baseUri}/storage/${result.error_file}`} target='_blank'>下载错误数据</a> : '没有错误数据'}
        </Button>
      </Fragment>
    );

    return (
      <Result
        status='success'
        subTitle={actions}
        className={styles.finish}
      >
        <Pie
          hasLegend
          subTitle="导入结果"
          total={result ? result.total : 0}
          colors={colors}
          data={salesData}
          height={200}
          lineWidth={4}
        />
      </Result>
    );
  }
}

export default Finish;
