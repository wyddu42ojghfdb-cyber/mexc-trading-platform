const express = require('express');
const app = express();
app.use(express.json());

// مخزن مؤقت لحفظ الرسائل المتبادلة بين الطرفين
let chatHistory = [];
let botActive = true; 

// مسار استقبال وإرسال الرسائل
app.post('/api/chat/send', (req, res) => {
    const { sender, message } = req.body;
    
    // حفظ الرسالة في السجل لكي يراها الطرف الآخر
    chatHistory.push({ sender, text: message, timestamp: Date.now(), read: false });

    let botReply = null;

    // إذا كان المجيب الآلي فعالاً وقام المستخدم بالكتابة
    if (sender === 'user' && botActive) {
        const msgLower = message.toLowerCase();
        
        if (msgLower.includes('أهلاً') || msgLower.includes('مرحبا')) {
            botReply = "أهلاً بك! كيف يمكنني مساعدتك في التداول اليوم؟";
        } else if (msgLower.includes('إيداع') || msgLower.includes('شحن')) {
            botReply = "يمكنك الإيداع عبر الانتقال لقسم الإيداع الفوري واختيار عملة USDT.";
        } else if (msgLower.includes('مشرف') || msgLower.includes('دعم') || msgLower.includes('إنسان')) {
            botReply = "جاري تحويلك الآن للمشرف الحقيقي... يرجى الانتظار وكتابة استفسارك.";
            botActive = false; // إيقاف البوت مؤقتاً ليتدخل المشرف يدوياً
        }
        
        if (botReply) {
            chatHistory.push({ sender: 'bot', text: botReply, timestamp: Date.now(), read: true });
        }
    }

    res.json({ status: !botActive ? 'forwarded' : 'ok', botReply });
});

// مسار جلب الرسائل الجديدة (تحديث مستمر للطرفين)
app.get('/api/chat/get-updates', (req, res) => {
    const role = req.query.role; // user أو admin
    let targetSender = role === 'admin' ? 'user' : 'admin';
    
    // جلب الرسائل غير المقروءة الموجهة لهذا الدور
    let unreadMessages = chatHistory.filter(msg => msg.sender === targetSender && !msg.read);
    
    // تحويل الرسائل المجلوبة إلى مقروءة
    unreadMessages.forEach(msg => msg.read = true);
    
    res.json(unreadMessages);
});
