import React from 'react';
import { Drawer } from 'antd';
import StandardTable from '@/components/StandardTable';
import { getFollowDetail } from './service';

interface DetailProps {
  visible: boolean;
  asinId: number;
  handleVisible: (flag: boolean, record: any) => void;
}

const DetailDrawer: React.FC<DetailProps> = (props) => {
  const { visible, asinId, handleVisible } = props;

  const columns: any[] = [
    {
      title: '卖家',
      dataIndex: 'seller',
      align: 'center',
      render: (_: any, record: any) => (
        <a href={record.seller_url} target="_blank">
          {record.seller}
        </a>
      ),
    },
    {
      title: '抓取时间',
      dataIndex: 'updated_at',
      align: 'center',
    },
  ];

  return (
    <Drawer
      closable
      destroyOnClose={true}
      placement="left"
      width="100%"
      title="详情"
      visible={visible}
      onClose={() => handleVisible(false, {})}
    >
      <StandardTable
        request={(params: any) =>
          getFollowDetail({
            ...params,
            filters: {
              followAsinId: asinId,
            },
            sorter: { updated_at: 'desc' },
          })
        }
        columns={columns}
        bordered
        sticky
        pagination={{ current: 1, pageSize: 20 }}
        paginationConfig={{ pageSizeOptions: [10, 20, 50, 100] }}
      />
    </Drawer>
  );
};

export default DetailDrawer;
