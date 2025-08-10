// Заглушка для подключения к базе данных
const connectDatabase = async () => {
  try {
    // В реальном проекте здесь будет Prisma
    console.log('✅ Database connected successfully (mock)');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
};

module.exports = { connectDatabase };
