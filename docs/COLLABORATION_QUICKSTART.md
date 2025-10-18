# 🚀 Collaborative Learning - 5-Minute Quick Start

## ⚡ Super Fast Setup

### 1. Install Dependencies (2 minutes)

```bash
# Root directory - Install frontend dependencies
npm install

# Backend - Install server dependencies
cd backend
npm install
cd ..
```

### 2. Start Services (1 minute)

Open 3 terminals:

**Terminal 1 - Backend with Socket.IO:**
```bash
cd backend
npm run dev
```
✅ Should see: `Backend listening on http://0.0.0.0:3001`

**Terminal 2 - AI Service:**
```bash
cd ai-service
python app.py
```
✅ Should see: `Uvicorn running on http://0.0.0.0:8001`

**Terminal 3 - Frontend:**
```bash
npm run dev
```
✅ Should see: `Local: http://localhost:5173`

### 3. Test Collaborative Features (2 minutes)

#### Step 1: Create a Room
1. Open http://localhost:5173
2. Click "Collaborative Learning" in navigation
3. Enter your name: **"Alice"**
4. Enter room name: **"Python Study"**
5. Click **"Create Room"**
6. 🎉 You're in! Copy the room ID from the URL

#### Step 2: Join from Another Browser
1. Open **incognito/private window** or **different browser**
2. Go to http://localhost:5173
3. Click "Collaborative Learning"
4. Enter name: **"Bob"**
5. Paste the room ID
6. Click **"Join Room"**
7. ✨ Both users now see each other!

#### Step 3: Test Features (30 seconds each)

**✅ Real-Time Chat:**
- Type in one browser → instantly appears in other
- Both users see the message

**✅ Collaborative Editor:**
- Click "Collaborative Editor" tab
- Type code in one browser
- Watch it sync in the other browser in real-time!

**✅ AI Facilitator:**
- Click "Generate Group Quiz" button
- Wait 2 seconds
- 🎯 See adaptive quiz appear with personalized questions

**✅ Group Mastery:**
- Check left sidebar
- See "Group Mastery" chart updating

**✅ Role Assignment:**
- Click "Assign Roles" button
- Watch AI assign Driver, Navigator, etc.
- Roles appear next to member names

---

## 🎬 3-Minute Demo Script

### Minute 1: Room Creation
> "Let's create a collaborative learning session. I'll create a room called 'Python Functions Study'..."
- Show room creation
- Show room ID generation
- Show member joining

### Minute 2: Real-Time Features
> "Everything syncs in real-time. Watch as Alice types a message..."
- Demo chat (sub-second sync)
- Demo collaborative editor
- Show cursor positions

### Minute 3: AI Magic
> "The AI Facilitator provides intelligent guidance..."
- Generate group quiz
- Show AI facilitation panel
- Show group mastery analytics
- Assign roles

**Final Flourish:**
> "And it all works together seamlessly - real-time collaboration with AI-powered learning!"

---

## 🐛 Quick Fixes

### Problem: "Socket not connected"
**Fix:** 
```bash
# Check backend is running
curl http://localhost:3001
```

### Problem: Quiz generation fails
**Fix:**
```bash
# Check AI service is running
curl http://localhost:8001/health
```

### Problem: Can't join room
**Fix:**
- Make sure room ID is exact (copy-paste)
- Check both browsers are using same backend
- Refresh both pages

---

## 📱 Test on Mobile

1. Find your computer's IP: `ipconfig` (Windows) or `ifconfig` (Mac/Linux)
2. Update VITE_SOCKET_URL in `.env`: `VITE_SOCKET_URL=http://YOUR_IP:3001`
3. Restart frontend: `npm run dev`
4. Open `http://YOUR_IP:5173` on phone
5. Join the same room as your desktop

---

## 🎯 Feature Checklist

Test each feature:

- [ ] Create study room
- [ ] Join existing room
- [ ] Send/receive chat messages
- [ ] See real-time presence (online indicators)
- [ ] Edit code collaboratively
- [ ] Edit notes collaboratively
- [ ] Generate group quiz
- [ ] Request AI facilitator guidance
- [ ] Assign team roles
- [ ] View group mastery chart
- [ ] Leave room

---

## 💡 Pro Tips

1. **Open DevTools** - Watch Socket.IO events in console
2. **Use Incognito** - Easy way to test with multiple users
3. **Share Room ID** - Use QR code or short URL for easy sharing
4. **Test Latency** - Try over WiFi vs wired for different experiences

---

## 🚀 Next Steps

Once basics work:

1. **Customize**: Edit room names, concepts, quiz questions
2. **Extend**: Add more AI actions in `collaboration_service.py`
3. **Deploy**: Follow `COLLABORATIVE_LEARNING_GUIDE.md` for production
4. **Polish**: Adjust UI colors, add animations

---

## ✅ You're Ready!

If you can:
- ✅ Create a room
- ✅ Join from another browser
- ✅ Send messages that sync
- ✅ Generate an AI quiz

**You're ready to demo! 🎉**

---

## 📚 Full Documentation

See `COLLABORATIVE_LEARNING_GUIDE.md` for:
- Complete API reference
- Architecture details
- Production deployment
- Advanced customization
- Troubleshooting guide

---

**Have fun collaborating! 🤝✨**

