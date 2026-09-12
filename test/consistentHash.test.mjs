import { test, describe } from 'node:test';
import assert from 'node:assert';
import { ConsistentHashRing } from '../src/consistentHash.mjs';

describe('Distributed Cache Partitioner Suite', () => {
  const ring = new ConsistentHashRing(50);
  ring.addNode('cache-server-1');
  ring.addNode('cache-server-2');
  ring.addNode('cache-server-3');

  test('should deterministically route identical keys to the same cache node', () => {
    const nodeA = ring.getNode('user:session:99482');
    const nodeB = ring.getNode('user:session:99482');
    assert.strictEqual(nodeA, nodeB);
    assert.ok(['cache-server-1', 'cache-server-2', 'cache-server-3'].includes(nodeA));
  });

  test('should rebalance gracefully upon node removal', () => {
    ring.removeNode('cache-server-1');
    const node = ring.getNode('user:session:99482');
    assert.ok(node === 'cache-server-2' || node === 'cache-server-3');
  });
});
