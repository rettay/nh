// engine/modules/phoneme/utils/cache.ts

export class LRUCache<K, V> {
    private capacity: number;
    private cache: Map<K, V>;
    private keys: K[];
    
    constructor(capacity: number) {
      this.capacity = capacity;
      this.cache = new Map<K, V>();
      this.keys = [];
    }
    
    get(key: K): V | undefined {
      if (!this.cache.has(key)) return undefined;
      
      // Move key to most recently used
      this.keys = this.keys.filter(k => k !== key);
      this.keys.push(key);
      
      return this.cache.get(key);
    }
    
    set(key: K, value: V): void {
      if (this.keys.length >= this.capacity && !this.cache.has(key)) {
        // Evict least recently used
        const lru = this.keys.shift();
        if (lru !== undefined) {
          this.cache.delete(lru);
        }
      }
      
      // Update key position
      this.keys = this.keys.filter(k => k !== key);
      this.keys.push(key);
      
      // Set new value
      this.cache.set(key, value);
    }
    
    has(key: K): boolean {
      return this.cache.has(key);
    }
    
    clear(): void {
      this.cache.clear();
      this.keys = [];
    }
  }