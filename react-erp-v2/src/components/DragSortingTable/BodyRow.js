import React from 'react';

export default class BodyRow extends React.Component {

  render() {
    const { draggingIndex = -1, isOver, connectDragSource, connectDropTarget, moveRow, ...restProps } = this.props;
    const style = { ...restProps.style, cursor: 'move' };

    let { className } = restProps;
    if (isOver) {
      if (restProps.index > draggingIndex) {
        className += ' drop-over-downward';
      }
      if (restProps.index < draggingIndex) {
        className += ' drop-over-upward';
      }
    }

    return connectDragSource(
      connectDropTarget(<tr {...restProps} className={className} style={style} />),
    );
  }
}
