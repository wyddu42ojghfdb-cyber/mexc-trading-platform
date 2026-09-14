const express = require('express');
const mongoose = require('mongoose');
const axios = require('axios');

const app = express();
app.use(express.json());

// 1. الاتصال بقاعدة البيانات الافتراضية
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/trading_sim')
  .then(() => console.log('✅ متصل بقاعدة البيانات بنجاح'))
  .catch(err => console.error('❌ خطأ في الاتصال بقاعدة البيانات:', err));

// 2. نماذج بيانات المستخدمين والعمليات
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  balance: { type: Number, default: 0 },         
  lockedBonus: { type: Number, default: 0 },    
  referredBy: { type: String, default: null },   
  referralCode: { type: String, unique: true }   
});
const User = mongoose.model('User', userSchema);

const txSchema = new mongoose.Schema({
  username: { type: String, required: true },
  type: { type: String, enum: ['deposit', 'withdrawal'] },
  amount: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});
const Transaction = mongoose.model('Transaction', txSchema);

// 3. جلب الأسعار الحية مباشرة من منصة MEXC
app.get('/api/market/price', async (req, res) => {
  const symbol = req.query.symbol || 'XLMUSDT';
  try {
    const response = await axios.get(`https://mexc.com{symbol.toUpperCase()}`);
    res.json({ success: true, symbol: response.data.symbol, price: parseFloat(response.data.price).toFixed(5) });
  } catch (error) {
    res.status(500).json({ success: false, error: 'فشل جلب السعر من منصة MEXC' });
  }
});

// 4. محرك تدوير الصفقات الثلاثية الوهمية (زيادة 25%)
app.post('/api/admin/execute-simulated-trade', async (req, res) => {
  try {
    const users = await User.find({});
    for (let user of users) {
      const totalCapital = user.balance + user.lockedBonus;
      if (totalCapital > 0) {
        const profit = totalCapital * 0.25; // نسبة الـ 25% المطلوبة من قبلك
        user.balance += profit;
        await user.save();
      }
    }
    res.json({ message: 'تم تدوير الصفقات بنجاح وزيادة الحسابات بنسبة 25%' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// تشغيل السيرفر
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 السيرفر جاهز ويعمل على المنفذ ${PORT}`));
