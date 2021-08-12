import React from 'react';
import { DndProvider, DragSource, DropTarget } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import update from 'immutability-helper';
import StandardTable from '@/components/StandardTable';
import BodyRow from './BodyRow';


const rowSource = {
  beginDrag(props) {
    // const draggingIndex = props.index;
    return {
      index: props.index,
    };
  },
};

const rowTarget = {
  drop(props, monitor) {
    const dragIndex = monitor.getItem().index;
    const hoverIndex = props.index;

    // Don't replace items with themselves
    if (dragIndex === hoverIndex) {
      return;
    }
    // Time to actually perform the action
    props.moveRow(dragIndex, hoverIndex);
    // eslint-disable-next-line no-param-reassign
    monitor.getItem().index = hoverIndex;
  },
};

const DraggableBodyRow = DropTarget('row', rowTarget, (connect, monitor) => ({
  connectDropTarget: connect.dropTarget(),
  isOver: monitor.isOver(),
}))(
  DragSource('row', rowSource, connect => ({
    connectDragSource: connect.dragSource(),
  }))(BodyRow),
);

class DragSortingTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  // 索引移动
  moveRow = (dragIndex, hoverIndex) => {
    const { onMoveRow, dataSource: { data, meta } } = this.props;
    const pagination = (meta && meta.pagination) || {};
    const { current = 1, page_size = 20 } = pagination;
    const dragRow = data[dragIndex];
    const newData = update(data, { $splice: [[dragIndex, 1], [hoverIndex, 0, dragRow]] });
    const rank = newData.map((v, i) => {
      const position = i + (current - 1) * page_size;
      return { id: v.id, position };
    });

    if (onMoveRow) {
      onMoveRow(rank);
    }
  };

  render() {
    const { ...rest } = this.props;
    const components = {
      body: {
        row: DraggableBodyRow,
      },
    };

    return (
      <DndProvider backend={HTML5Backend}>
        <StandardTable
          components={components}
          onRow={(record, index) => ({
            index,
            moveRow: this.moveRow,
          })}
          {...rest}
        />
      </DndProvider>
    );
  }
}

export default DragSortingTable;
