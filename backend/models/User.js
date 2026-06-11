const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['ADMIN', 'SUBJECT_OFFICER'], 
    default: 'SUBJECT_OFFICER' // 👈 Register වෙද්දී ඔටෝම සෙට් වෙන්නේ සබ්ජෙක්ට් ඔෆිසර් විදිහට
  },
  isAdminApproved: { 
    type: Boolean, 
    default: false // 👈 මෙන්න මේක අනිවාර්යයෙන්ම false වෙන්න ඕනේ!
  },
  resetOTP: { type: String },
  resetOTPExpires: { type: Date }
}, { timestamps: true });

// 🚨 'users' කියන නම නිවැරදිව ලබාදීම (Compass එකේ තියෙන නමමයි)
module.exports = mongoose.model('User', UserSchema, 'users');