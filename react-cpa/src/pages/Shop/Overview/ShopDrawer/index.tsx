import React, { useState, useEffect } from 'react';
// import { Drawer } from 'antd';
import { ShopDrawerProps } from './shopDrawer';
import Competitor from '../../../Competitor';

const ShopDrawer: React.FC<ShopDrawerProps> = ({ currentShop, setCurrentShop }) => {
  const [visible, setVisible] = useState(false);

  // const onClose = () => {
  //   setVisible(false);
  // };

  // const afterVisibleChange = (isVisible: boolean) => {
  //   if (!isVisible) {
  //     setCurrentShop({ asin: undefined, id: undefined, name: undefined });
  //   }
  // };

  useEffect(() => {
    if (currentShop.asin && currentShop.id) {
      setVisible(true);
    } else {
      setVisible(false)
    }
  }, [currentShop]);
  return (
    // <Drawer
    //   headerStyle={{ padding: 16 }}
    //   bodyStyle={{ padding: 0 }}
    //   width="100%"
    //   title={currentShop.asin}
    //   placement="right"
    //   onClose={onClose}
    //   visible={visible}
    //   afterVisibleChange={afterVisibleChange}
    // >
    <>
      {visible ? (
        <div style={{ position: 'fixed', width: 'calc(100% - 250px)', right: 0, top: 40, height: 'calc(100% - 40px)', zIndex: 1000 }}>
          <div style={{ padding: 16, height: 40, display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'white', borderBottom: '1px solid #ccc' }}>

            <span>
              <span style={{ marginRight: '15px' }}>{currentShop.name}</span>
              <a href={currentShop.link} target="blank">{currentShop.asin}</a>
            </span>
            <span style={{ cursor: 'pointer', padding: 5, fontSize: 16 }} onClick={() => setCurrentShop({ asin: '', id: undefined, name: '', link: '' })}>X</span>
          </div>
          <div style={{ height: 'calc(100% - 40px)', overflowY: 'scroll' }}>
            <Competitor currentShop={currentShop} />
          </div>
        </div>
      ) : null
      }
    </>

    // </Drawer >
  );
};

export default ShopDrawer;
