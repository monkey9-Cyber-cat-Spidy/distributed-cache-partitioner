import crypto from 'crypto';

export class ConsistentHashRing {
  constructor(virtualNodes = 100) {
    this.virtualNodes = virtualNodes;
    this.ring = new Map();
    this.sortedKeys = [];
    this.physicalNodes = new Set();
  }

  hash(key) {
    return parseInt(crypto.createHash('md5').update(key).digest('hex').substring(0, 8), 16);
  }

  addNode(node) {
    this.physicalNodes.add(node);
    for (let i = 0; i < this.virtualNodes; i++) {
      const vKey = `${node}#${i}`;
      const hashVal = this.hash(vKey);
      this.ring.set(hashVal, node);
      this.sortedKeys.push(hashVal);
    }
    this.sortedKeys.sort((a, b) => a - b);
  }

  removeNode(node) {
    this.physicalNodes.delete(node);
    for (let i = 0; i < this.virtualNodes; i++) {
      const vKey = `${node}#${i}`;
      const hashVal = this.hash(vKey);
      this.ring.delete(hashVal);
    }
    this.sortedKeys = Array.from(this.ring.keys()).sort((a, b) => a - b);
  }

  getNode(key) {
    if (this.sortedKeys.length === 0) return null;
    const keyHash = this.hash(key);
    for (const h of this.sortedKeys) {
      if (keyHash <= h) return this.ring.get(h);
    }
    return this.ring.get(this.sortedKeys[0]); // Wrap-around
  }
}
