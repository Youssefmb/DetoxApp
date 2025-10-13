# ⏰ Detoxy – Manage Your App Usage Smartly

**Detoxy** is a mobile application that helps users manage their phone time effectively by setting usage restrictions on installed apps.  
Stay focused, avoid distractions, and take control of your digital habits — all in one place.

---

## 🌟 Features

- 🔍 **View Installed Apps** – Automatically lists all apps on your device.
- 🕒 **Set Time Restrictions** – Choose specific time ranges when selected apps should be locked (e.g., 9 AM – 5 PM).
- 🚫 **Block Access Automatically** – When you try to open a restricted app, a friendly notification reminds you it’s currently unavailable.
- 🔔 **Custom Notifications** – Get notified when restrictions start or end.
- ⚙️ **Fully Customizable** – Modify or remove restrictions anytime.
- 💡 **Lightweight & Intuitive UI** – Simple, modern design focused on productivity.

---

## 🧭 Use Case Example

1. Open **Detoxy**  
2. Browse your installed apps  
3. Select “Facebook”  
4. Set a restriction from **09:00 AM to 05:00 PM**  
5. During this period, Facebook will be **blocked**  
6. When you try to open it, you’ll see a **notification**:  
   > "You can’t open this app right now — stay focused!"

---

## 🛠️ Tech Stack

- **React Native** (Expo / CLI)
- **JavaScript / TypeScript**
- **AsyncStorage** (to store restriction data)
- **Push Notifications** (via `react-native-push-notification`)
- **Native Modules** (for app listing & blocking)
- **DateTime Picker** (for time range selection)

---

## 🚀 Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/DetoxApp.git
   cd DetoxApp
