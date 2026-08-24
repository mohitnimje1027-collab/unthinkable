require('dotenv').config();
const app = require('./src/app');
const initDatabase = require('./src/config/initDb');

const PORT = process.env.PORT || 5000;

// Auto-initialize DB tables, then start server
initDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
  });
});
