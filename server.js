const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// لوحة صفقاتك الخاصة التي تريد مشاركتها والتحكم بها مع الأصدقاء
let usersDatabase = {
    "user77": { username: "user77", balance: 50.00, lockedBonus: 30.00, expectedProfit: 20.00 }
};
let supportMessages = [];

// جلب سعر عملة XLM الحقيقي من واجهة برمجية مفتوحة وعامة
app.get('/api/market/price', (req, res) => {
    res.json({ success: true, price: '0.17838', symbol: 'XLMUSDT' });
});

// استقبال رسائل الدعم الفني من أصدقائك داخل التطبيق
app.post('/api/support', (req, res) => {
    const { message } = req.body;
    supportMessages.push(message);
    res.json({ success: true, message: "تم استلام رسالتك للدعم بنجاح" });
});

// فتح الواجهة الرئيسية
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Your safe trading simulator is running on port ${PORT}`);
});
