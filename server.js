const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// قاعدة بيانات مؤقتة وآمنة في الذاكرة لتجربة الأرصدة
let usersDatabase = {
    "user77": { username: "user77", balance: 50.00 }
};

// مسارات واجهة برمجة التطبيقات (API) الخاصة بالمحاكاة
app.get('/api/user/data', (req, res) => {
    const username = req.query.username || 'user77';
    if (!usersDatabase[username]) {
        usersDatabase[username] = { username, balance: 0 };
    }
    res.json(usersDatabase[username]);
});

// فتح الواجهات البرمجية
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Simulation server active on port ${PORT}`);
});
