class _Node {
  constructor(value, next, prev) {
    this.value = value;
    this.next = next;
  }
}

class LinkedList {
  constructor() {
    this.head = null;
  }

  insertFirst(item) {
    this.head = new _Node(item, null);
  }

  insertLast(item) {
    if (this.head === null) this.insertFirst(item);
    else {
      let tempNode = this.head;
      while (tempNode.next !== null) tempNode = tempNode.next;
      tempNode.next = new _Node(item, null);
    }
  }

  remove(item) {
    if (!this.head) return null;
    if (this.head.value === item) {
      this.head = this.head.next;
      return;
    }
    let currNode = this.head;
    let previousNode = this.head;
    while (currNode !== null && currNode.value !== item) {
      previousNode = currNode;
      currNode = currNode.next;
    }
    if (currNode === null) {
      console.log('Item not found');
      return;
    }
    previousNode.next = currNode.next;
  }

  find(item) {
    let currNode = this.head;
    if (!this.head) {
      return null;
    }
    while (currNode.value !== item) {
      if (currNode.next === null) {
        return null;
      } else {
        currNode = currNode.next;
      }
    }
    return currNode;
  }

  insertBefore(item, key) {
    if (this.head === null) {
      console.log('Key does not exist');
      return null;
    }
    let currNode = this.head;
    let prevNode = this.head;
    while (currNode.value !== key && currNode !== null) {
      prevNode = currNode;
      currNode = currNode.next;
    }
    if (currNode === null) {
      console.log('key not found');
      return;
    }
    prevNode.next = new _Node(item, currNode);
  }

  insertAfter(item, key) {
    if (this.head === null) {
      console.log('Key does not exist');
      return null;
    }
    let currNode = this.head;
    while (currNode.value !== key && currNode !== null) {
      currNode = currNode.next;
    }
    if (currNode === null) {
      console.log('key not found');
      return;
    }
    let tempNode = currNode.next;
    currNode.next = new _Node(item, tempNode);
  }
  
  insertAt(list, item, position) {
    if (position < 0) {
      throw new Error('Position error');
    }
    if (position === 0) {
      this.insertFirst(item);
    }
    if (position > size(list)) {
      this.insertLast(item);
    } else {
      // Find the node which we want to insert after
      const node = this._findNthElement(position - 1);
      const newNode = new _Node(item, null);
      newNode.next = node.next; 
      node.next = newNode;
    }
  }
  
  _findNthElement(position) {
    let node = this.head;
    for (let i=0; i<position; i++) {
      node = node.next;
    }
    return node;
  }
}

function display(list) {
  const arr = [];
  let currNode = list.head;

  while (currNode !== null) {
    arr.push(currNode.value);
    currNode = currNode.next;
  }
  
  return arr;
}

function size(list){
  let counter = 0;
  let currNode = list.head;
  if(!currNode){
    return counter;
  }
  else
    counter++;
  while (!(currNode.next == null)) {
    counter++;
    currNode = currNode.next;
  }
  return counter;
}

module.exports = { 
  LinkedList, 
  display,
  size
};