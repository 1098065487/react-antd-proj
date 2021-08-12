/*
 * @Author: wjw
 * @Date: 2020-12-03 16:36:27
 * @LastEditTime: 2020-12-04 15:38:46
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \react-punkd:\work\react-competitor\src\utils\eventBus.ts
 */

class EventEmitter {
  constructor() {
    this.event = new Map();
  }

  // 事件触发
  emit(type, params) {
    // 获取对应事件的处理函数
    const handlerList = this.event.get(type);
    if (handlerList) {
      handlerList.forEach((handler) => {
        // forEach的this默认指向window
        handler(params);
      });
    }
  }

  // 事件监听
  addListener(type, fn) {
    // 获取对应事件的处理函数
    const handlerList = this.event.get(type);
    if (handlerList) {
      // 如果handlerList存在，则往事件队列中加入一个事件
      handlerList.push(fn);
    } else {
      // 不存在，则创建一个事件队列
      this.event.set(type, [fn]);
    }
    return this.event;
  }

  // 事件移除
  removeListener(type, fn) {
    // 获取对应事件的处理函数
    const handlerList = this.event.get(type);
    if (handlerList) {
      // 如果handlerList存在，则往事件队列中加入一个事件
      if (fn) {
        // 如果传递了要移除的事件，则移除事件队列中对应的事件
        handlerList.filter((handler) => handler !== fn);
        if (handlerList.length === 0) {
          // 如果事件队列已经没有事件了，则删除队列
          this.event.delete(type);
        }
      } else {
        // 如果没传递要移除的事件，则删除整个队列
        this.event.delete(type);
      }
    }
    return this.event;
  }

  // 返回监听器上的事件队列
  listeners(type) {
    if (type) {
      // 如果传递了要获取的对应的事件队列
      return this.event.get(type);
    }
    // 如果没传则获取整个监听器
    const events = {};
    this.event.forEach((v, k) => {
      events[k] = v;
    });
    return events;
  }
}

export default EventEmitter;
