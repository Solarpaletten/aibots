const connectRedis = async () => {
  try {
    // Заглушка для Redis подключения
    console.log('✅ Redis connection ready (mock)');
    return {
      get: async (key) => null,
      set: async (key, value) => true,
      del: async (key) => true
    };
  } catch (error) {
    console.warn('⚠️ Redis not available, using memory cache');
    return null;
  }
};

module.exports = { connectRedis };
