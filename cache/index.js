class Cache {
    constructor(defaultTTL) {
        this.data = {};
        this.defaultTTL = defaultTTL;
    }

    get(key) {
        const entry = this.data[key];
        if (entry && entry.valid()) {
            return entry.val;
        } else {
            return null;
        }
    }

    set(key, val, ttl = this.defaultTTL) {
        this.data[key] = new CacheEntry(val, ttl);
    }
}

class CacheEntry {
    constructor(val, ttl) {
        this.val = val;
        this.timestamp = Date.now();
        this.ttl = ttl;
    }

    valid() {
        return Date.now() - this.timestamp < this.ttl;
    }
}

module.exports = Cache;