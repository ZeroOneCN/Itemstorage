// 离线存储工具

// 数据库名称和版本
const DB_NAME = 'StorageLogDB';
const DB_VERSION = 1;

// 存储对象
interface DBStore {
  name: string;
  keyPath: string;
  indexes?: {
    name: string;
    keyPath: string;
    unique?: boolean;
  }[];
}

// 存储列表
const STORES: DBStore[] = [
  {
    name: 'items',
    keyPath: 'id',
  },
  {
    name: 'locations',
    keyPath: 'id',
  },
  {
    name: 'rooms',
    keyPath: 'id',
  },
  {
    name: 'suitcases',
    keyPath: 'id',
  },
];

// 打开数据库
const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      reject(new Error('Failed to open database'));
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // 创建存储
      STORES.forEach(store => {
        if (!db.objectStoreNames.contains(store.name)) {
          const objectStore = db.createObjectStore(store.name, { keyPath: store.keyPath });
          
          // 创建索引
          if (store.indexes) {
            store.indexes.forEach(index => {
              objectStore.createIndex(index.name, index.keyPath, { unique: index.unique || false });
            });
          }
        }
      });
    };
  });
};

// 通用 CRUD 操作
class OfflineStorage {
  // 获取所有数据
  static async getAll<T>(storeName: string): Promise<T[]> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onerror = () => {
        reject(new Error('Failed to get all data'));
      };

      request.onsuccess = () => {
        resolve(request.result);
      };
    });
  }

  // 获取单个数据
  static async get<T>(storeName: string, id: string): Promise<T | null> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(id);

      request.onerror = () => {
        reject(new Error('Failed to get data'));
      };

      request.onsuccess = () => {
        resolve(request.result || null);
      };
    });
  }

  // 保存数组数据
  static async saveArray<T>(storeName: string, data: T[]): Promise<void> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      
      // 清空现有数据
      const clearRequest = store.clear();
      
      clearRequest.onerror = () => {
        reject(new Error('Failed to clear store'));
      };
      
      clearRequest.onsuccess = () => {
        // 批量添加新数据
        let count = 0;
        const total = data.length;
        
        if (total === 0) {
          resolve();
          return;
        }
        
        data.forEach(item => {
          const addRequest = store.add(item);
          
          addRequest.onerror = () => {
            reject(new Error('Failed to add data'));
          };
          
          addRequest.onsuccess = () => {
            count++;
            if (count === total) {
              resolve();
            }
          };
        });
      };
    });
  }

  // 添加单个数据
  static async add<T>(storeName: string, data: T): Promise<void> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.add(data);

      request.onerror = () => {
        reject(new Error('Failed to add data'));
      };

      request.onsuccess = () => {
        resolve();
      };
    });
  }

  // 更新单个数据
  static async put<T>(storeName: string, data: T): Promise<void> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(data);

      request.onerror = () => {
        reject(new Error('Failed to update data'));
      };

      request.onsuccess = () => {
        resolve();
      };
    });
  }

  // 删除数据
  static async delete(storeName: string, id: string): Promise<void> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(id);

      request.onerror = () => {
        reject(new Error('Failed to delete data'));
      };

      request.onsuccess = () => {
        resolve();
      };
    });
  }

  // 清空存储
  static async clear(storeName: string): Promise<void> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.clear();

      request.onerror = () => {
        reject(new Error('Failed to clear store'));
      };

      request.onsuccess = () => {
        resolve();
      };
    });
  }

  // 导出所有数据
  static async exportData(): Promise<Record<string, any[]>> {
    const result: Record<string, any[]> = {};

    for (const store of STORES) {
      result[store.name] = await this.getAll(store.name);
    }

    return result;
  }

  // 导入数据
  static async importData(data: Record<string, any[]>): Promise<void> {
    for (const [storeName, items] of Object.entries(data)) {
      await this.clear(storeName);
      for (const item of items) {
        await this.add(storeName, item);
      }
    }
  }
}

// 网络状态检测
const isOnline = (): boolean => {
  return navigator.onLine;
};

// 数据同步服务
class SyncService {
  // 同步数据到本地存储
  static async syncToLocal(data: Record<string, any[]>): Promise<void> {
    await OfflineStorage.importData(data);
  }

  // 从本地存储同步数据
  static async syncFromLocal(): Promise<Record<string, any[]>> {
    return await OfflineStorage.exportData();
  }

  // 检查并同步数据
  static async checkAndSync(onlineData: Record<string, any[]>): Promise<Record<string, any[]>> {
    if (isOnline()) {
      // 在线状态：同步本地数据到服务器（这里简化处理）
      await this.syncToLocal(onlineData);
      return onlineData;
    } else {
      // 离线状态：使用本地数据
      return await this.syncFromLocal();
    }
  }
}

export { OfflineStorage, SyncService, isOnline };
