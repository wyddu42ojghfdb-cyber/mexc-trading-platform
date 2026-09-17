const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// تفعيل قراءة البيانات القادمة من الواجهات
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// تشغيل وخدمة الملفات الأصلية والتكوينات الخاصة بالسكربت (Assets, CSS, Images)
app.use(express.static(path.join(__dirname)));
app.use('/التكوين', express.static(path.join(__dirname, 'التكوين')));

// ==========================================================
// 📥 نضام المراسلة المدمج (تخزين طلبات الإيداع والسحب لملف المشرف)
// ==========================================================
let userRequests = []; 
let userBalances = {};

// 1. مسار استقبال طلبات الإيداع والسحب من واجهة المستخدم الأصلية
app.post('/api/submit-request', (req, res) => {
    const { userId, type, amount } = req.body;

    const newRequest = {
        id: Date.now(),
        userId: userId || "مستخدم تجريبي",
        type: type, // 'deposit' أو 'withdraw'
        amount: parseFloat(amount) || 0,
        status: "pending", // معلق في انتظارك
        date: new Date().toLocaleString('ar-EG')
    };

    userRequests.push(newRequest);
    console.log("📥 تم استقبال طلب جديد للمشرف:", newRequest);

    res.json({ success: true, message: "تم إرسال الطلب بنجاح، بانتظار موافقة المشرف." });
});

// 2. مسار جلب الطلبات لواجهة المشرف المستقلة (admin.html)
app.get('/api/admin/get-requests', (req, res) => {
    res.json(userRequests);
});

// 3. مسار اتخاذ القرار من واجهة المشرف (موافقة / رفض) وتحديث رصيد الصفقات
app.post('/api/admin/action', (req, res) => {
    const { requestId, action } = req.body;
    const requestIndex = userRequests.findIndex(r => r.id === parseInt(requestId));

    if (requestIndex !== -1) {
        userRequests[requestIndex].status = action === 'approve' ? "approved" : "rejected";
        
        if (action === 'approve') {
            const currentReq = userRequests[requestIndex];
            if (!userBalances[currentReq.userId]) userBalances[currentReq.userId] = 0;
            
            // زيادة أو خصم رصيد المستخدم بناءً على موافقتك
            if (currentReq.type === 'deposit') {
                userBalances[currentReq.userId] += currentReq.amount;
            } else {
                userBalances[currentReq.userId] -= currentReq.amount;
            }
        }
        return res.json({ success: true, message: "تم تحديث الطلب بنجاح في النظام." });
    }
    res.status(404).json({ success: false, message: "الطلب غير موجود." });
    
