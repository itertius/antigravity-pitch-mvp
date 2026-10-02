# Antigravity — Pitching Queue & Hard Timebox (MVP)

ระบบจัดการคิว Pitching และจับเวลาแบบเด็ดขาด (Hard Timeboxing) สำหรับงานแข่งขัน **"Antigravity"** พัฒนาด้วย **Next.js (App Router), TypeScript, Tailwind CSS** พร้อมเชื่อมต่อ **Supabase** และรองรับการ Deploy บน **Vercel**

---

## 🚀 ฟังก์ชันหลัก (Core MVP Features)

1. **Import & Review (Panel ซ้าย/ล่าง)**:
   - โหลดข้อมูล Mock Data เริ่มต้น (8 ทีม) ทันทีเพียงคลิกเดียว
   - รองรับการ Import ไฟล์ `.csv` จาก Google Form หรือวางข้อมูลตารางโดยตรง
   - แบ่งแท็บระหว่างทีมที่รอสุ่ม (`In Pool`) และทีมที่นำเสนอแล้ว (`Completed`)

2. **Visual Randomizer (จุดศูนย์กลาง)**:
   - แอนิเมชันสุ่มทีมแบบ Slot Machine Reel พร้อมเสียงสังเคราะห์ Web Audio API (Tick & Fanfare)
   - สุ่มได้อย่างโปร่งใส และย้ายทีมที่ถูกเลือกขึ้นเวที "Now Pitching" พร้อมเอฟเฟกต์ฉลอง Confetti

3. **Hard Timeboxing (Panel บน/ขวา)**:
   - แสดงข้อมูลทีมปัจจุบันที่กำลัง Pitching
   - นาฬิกาดิจิทัลนับถอยหลังขนาดใหญ่พิเศษ มองเห็นได้ชัดเจนจากระยะไกล
   - Preset เวลา 3 นาที, 5 นาที, +1 นาที, +30 วินาที
   - การเตือน 3 ระดับ: สีเขียว (ปกติ) $\rightarrow$ สีเหลือง (1 นาทีสุดท้าย) $\rightarrow$ สีแดงกระพริบ (10 วิสุดท้าย)
   - **เมื่อหมดเวลา (00:00)**: แสดง Visual Alert แถบสีแดงกระพริบเตือนเด็ดขาด พร้อมเสียง Buzzer ดังเตือน

---

## 🛠️ วิธีติดตั้งและรัน Local

```bash
cd pitch-timer-app

# ติดตั้ง dependencies (หากยังไม่ได้ติดตั้ง)
npm install

# รัน Development Server
npm run dev
# เปิดเบราว์เซอร์ที่ http://localhost:3000
```

> **หมายเหตุ**: ระบบมี **Offline / Local Mode** ในตัว หากยังไม่ได้เชื่อมต่อ Supabase ระบบจะบันทึกสถานะลงใน Browser LocalStorage ทำให้สามารถเปิดรันและทดสอบได้ทันที

---

## 🗄️ การเชื่อมต่อ Supabase

1. สร้างตารางบน Supabase โดยนำคำสั่ง SQL ใน [`supabase/migrations/001_create_teams.sql`](supabase/migrations/001_create_teams.sql) ไปรันใน **SQL Editor** ของ Supabase
2. สร้างไฟล์ `.env.local` ในโฟลเดอร์ `pitch-timer-app/`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://<your-project-id>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
```

3. เมื่อเชื่อมต่อแล้ว ระบบจะสลับเป็นโหมด `Supabase Online` และ Sync ข้อมูลแบบ Realtime โดยอัตโนมัติ

---

## ☁️ การ Deploy ขึ้น Vercel

1. Push โค้ดขึ้น GitHub Repository
2. เข้าสู่ Vercel Dashboard $\rightarrow$ **Add New Project** $\rightarrow$ เลือก Repository นี้
3. ตั้งค่า Root Directory เป็น `pitch-timer-app` (หากแยกโฟลเดอร์) หรือตั้งที่ Root
4. เพิ่ม Environment Variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. กด **Deploy** จะได้ Production URL ทันที
