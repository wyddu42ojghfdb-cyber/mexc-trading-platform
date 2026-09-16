const express = require('express');
const path = require('path');
const axios = require('axios');
const cors = require('cors');
const mongoose = require('mongoose'); // إضافة مكتبة mongoose للاتصال بقاعدة البيانات السحابية

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// 1. الاتصال الآمن بقاعدة بيانات MongoDB Atlas السحابية عبر المتغير البيئي الآمن
const dbURI = process.env.MONGO_URI || 'mongodb://localhost:27017/mexc';
mongoose.connect(dbURI)
  .then(() => console.log('تم الاتصال بنجاح بقاعدة البيانات السحابية MongoDB!'))
  .catch((err) => console.error('خطأ في الاتصال بقاعدة البيانات:', err));

// البيانات الافتراضية للمستخدمين
let usersDatabase = {
    "user77": { username: "user77", balance: 50.00, lockedBonus: 30.00, expectedProfit: 20.00 }
};
let withdrawsDatabase = [];
let supportMessages = [];

// مسارات الـ API الخاصة بالتطبيق
app.get('/api/market/price', async (req, res) => {
    try {
        const response = await axios.get('https://mexc.com');
        res.json({ success: true, price: parseFloat(response.data.price) });
    } catch (error) {
        res.json({ success: true, price: '0.17838' }); // السعر الافتراضي في حال فشل جلب البيانات
    }
});

app.get('/api/user/data', (req, res) => {
    const username = req.query.username || 'user77';
    if (!usersDatabase[username]) {
        usersDatabase[username] = { username, balance: 0, lockedBonus: 0, expectedProfit: 0 };
    }
    res.json(usersDatabase[username]);
});

app.post('/api/user/auto-deposit', (req, res) => {
    res.json({ success: true, message: "تم استلام طلب الإيداع" });
});


// =======================================================
// 2. مسارات توجيه واجهات الويب (HTML) لكي تفتح للناس أونلاين
// =======================================================

// أ) مسار واجهة المشتركين الرئيسية (عند فتح الرابط العالمي مباشرة)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// ب) مسار واجهة المشرف (عند كتابة الرابط العالمي ومعه /admin)
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html'));
});


// تشغيل السيرفر على المنفذ المتاح سحابياً أو 3000 محلياً
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running dynamically on port ${PORT}`);
});
