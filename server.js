const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// قاعدة بيانات مؤقتة في الذاكرة للرسائل والأرصدة الافتراضية
let usersDatabase = {
    "user77": { username: "user77", balance: 50.00 }
};
let supportMessages = []; // مصفوفة لحفظ رسائل الأصدقاء

// مسار للمشترك لإرسال رسالة دعم افتراضية
app.post('/api/support/send', (req, res) => {
    const { username, message } = req.body;
    if (!message) return res.json({ success: false, message: "الرسالة فارغة" });
    
    supportMessages.push({ id: supportMessages.length + 1, username, message, time: new Date().toLocaleTimeString() });
    res.json({ success: true, message: "تم إرسال رسالتك إلى لوحة المشرف بنجاح!" });
});

// مسار للمشرف لجلب كافة الرسائل الواردة وقراءتها
app.get('/api/admin/messages', (req, res) => {
    res.json(supportMessages);
});

// مسارات واجهة المستخدم والمسؤول
app.get('/api/user/data', (req, res) => {
    res.json(usersDatabase["user77"]);
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Chat Simulation server active on port ${PORT}`);
});
