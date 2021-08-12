import React, { Component, Fragment } from 'react';
import { Icon, Popover } from 'antd';
import styles from './style.less';

class ErrorInfo extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const { errors } = this.props;

    const errorCount = Object.keys(errors).filter(key => errors[key]).length;
    if (!errors || errorCount === 0) {
      return null;
    }
    const scrollToField = fieldKey => {
      const labelNode = document.querySelector(`label[for="${fieldKey}"]`);
      if (labelNode) {
        labelNode.scrollIntoView(true);
      }
    };
    const errorList = Object.keys(errors).map(key => {
      if (!errors[key]) {
        return null;
      }
      return (
        <li key={key} className={styles.errorListItem} onClick={() => scrollToField(key)}>
          {errors[key].map((msg,idx) => <div key={idx} className={styles.errorField}>{msg}</div>)}
        </li>
      );
    });

    return (
      <Fragment>
        <span className={styles.errorIcon}>
          <Popover
            title="表单校验信息"
            content={errorList}
            overlayClassName={styles.errorPopover}
            trigger="click"
            getPopupContainer={trigger => trigger.parentNode}
          >
            <Icon type="exclamation-circle" />
          </Popover>
          {errorCount}
        </span>
      </Fragment>
    );
  }

}

export default ErrorInfo;
