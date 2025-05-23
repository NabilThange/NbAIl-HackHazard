# 📄 README for NbAIl

![github-submission-banner](https://github.com/user-attachments/assets/a1493b84-e4e2-456e-a791-ce35ee2bcf2f)

# 🚀 Project Title

> **NbAIl – The Next-Gen Multimodal AI Assistant**

---

## 📌 Problem Statement

**Problem Statement 1 – Building on Groq API**  
**Problem Statement 5 – Build Next-Gen Command Agents (Terminator)**

---

## 🎯 Objective

Today's AI assistants are *too slow*, *too basic*, or *too disconnected* from real user needs.  
**NbAIl** solves this by combining **super-fast text, smooth voice conversation, intelligent command execution, and planned augmented reality (AR) capabilities** — all in a **single multimodal powerhouse**.

One of NbAIl's proudest innovations: **Command Mode**.  
Simply type a command like `/open notepad and write hello world`, and our **Terminator Agent**, powered by **Groq** for understanding and **local Python automation**, will **open system apps, type messages, and perform actions** automatically.  
**Zero manual work. Full smart automation.**  
Built to behave like a *true futuristic assistant* — not just a chatbot.

---

## 🧠 Team & Approach

### Team Name:  
`NabilThange`

### Team Members:
- Nabil (Lead Developer / Designer / Researcher)

### Our Approach:
- Prioritized **multimodal interaction** — text, voice, and AR — from the start.
- Focused heavily on **ultra-fast response speed**, **natural voice support**, and **full command automation**.
- Treated **UI/UX design** as a first-class citizen — not an afterthought.
- Built a **modular** system ready for expansion into more complex real-world use cases.

---

## 🛠️ Tech Stack

### Core Technologies Used:
- **Frontend:** Next.js, Tailwind CSS, Framer Motion
- **Backend:** Groq LPU Cloud API
- **Voice:** Vapi Voice API
- **Command Execution:** Custom-built Terminator Python Agent
- **Hosting:** Vercel for Frontend, Ngrok for Local Tunneling

### Sponsor Technologies Used:
- ✅ **Groq:** Lightning-fast LLM for conversation + command parsing.
- ✅ **Screenpipe:** Planned for future AR mode integration.

---

## ✨ Key Features

- ✅ **Blazing Fast AI Chat** (text-based conversations powered by Groq)
- ✅ **Voice Assistant Mode** (ask, command, and get instant voice responses)
- ✅ **Command Mode (/open appname and act)** — **dynamic, real-time command execution inside apps**
- ✅ **Augmented Reality (AR) Mode** — screen-aware AI (prototype)
- ✅ **World-Class UI/UX** — smooth animations, intuitive layout, mobile-first responsive design
- ✅ **Multi-mode Switcher** — instantly switch between chat, voice, command, and AR
- ✅ **Error Handling & Fail-Safes** — graceful recovery when apps not found

🚀 **NbAIl doesn't just "chat." It "acts."**

---

## 📽️ Demo & Deliverables

- **Demo Video Link:**  https://youtu.be/oY1w7WNAXSA?si=9_MI7qxENo5M-_gT

---

## ✅ Tasks & Bonus Checklist

- ✅ **All members followed 2+ official social channels and filled the form**
- ✅ **Bonus Task 1 completed (Badge Sharing) — 2 Points**
- ✅ **Bonus Task 2 completed (Sprint.dev signup) — 3 Points**

---

## 🧪 How to Run the Project

### Requirements:
- Node.js (v18+ recommended)
- Python 3.10+ (for Terminator Agent)
- Groq API Key
- Vapi Voice API Key
- Ngrok Account (for tunneling local Terminator Agent)
- `.env` file setup for API keys

### Local Setup:
```bash
# Clone the repo
git clone https://github.com/your-team/nbail

# Install frontend dependencies
cd nbail
npm install

# Start the frontend
npm run dev

# ⚡ How to Run Terminator Agent

### Step 1: Open a New Terminal Window
- Navigate to the `terminator-agent` folder.

### Step 2: Install Python Dependencies
```bash
pip install -r requirements.txt

### Step 3: Run the Terminator Agent
```bash
python terminator_agent.py

### Step 4: Start an Ngrok Tunnel
```bash
ngrok http 8000

(Replace 5000 with your local port if it's different.)

```
—

###✅ 4. `important-notes`
# ⚠️ Important Notes About Command Feature

- **Terminator Agent runs locally** for full security and direct access to your apps.
- **Command Feature is not available to the public** because:
  - There are **no free Windows VM providers**.
  - Cloud VM providers like AWS, Azure require **credit/debit cards**, and I am **not old enough** to have one yet.
- **HTTPS is required** for using voice and AR modes — **Ngrok provides secure HTTPS tunnels** for your local server.
- **Terminator Agent only works on your machine** — making it faster, more private, and customizable!

---

> **Note:** Always make sure Terminator Agent and Ngrok are running before using command features inside NbAIl!

# 🔮 Future Scope of NbAIl

While NbAIl already delivers a futuristic multimodal experience, the journey has just begun!  
Here's what's planned for future versions:

---

## 🗣️ Voice Command Integration
- Execute system commands and app actions using **pure voice input**.
- Example:  
  "Hey NbAIl, open Word and write a letter."

## 🖥️ Full Screen-Aware Mode
- Using **Screenpipe** and **real-time OCR models**, NbAIl will understand your **live screen content**.
- Contextual actions based on what's visible — like suggesting to save a document if you're working in Word.

## 🧠 Multi-Tasking and Smart Workflows
- Chain multiple commands together intelligently.
- Example:  
  `/open Chrome -> search for HackHazards site -> take screenshot`

## 🌐 Multi-Language Voice Support
- Enable conversations and commands in **multiple languages**:  
  Hindi, Spanish, Japanese, French, and more!

## 🛒 Plugin Marketplace (Community Powered)
- Allow users to **build and share plugins** for new commands.
- Extend NbAIl with **custom actions** (e.g., open Photoshop and resize images automatically).

## 🔒 Full End-to-End Security
- **Encrypt all voice, text, and command data** using secure protocols.
- Offer **local-only processing** options for users who want maximum privacy.

## 🎯 Productivity Mode
- NbAIl can enter a special **Productivity Mode** where it blocks distractions (e.g., closes games, opens study apps) automatically.

## 📱 Mobile and AR Expansion
- Bring NbAIl to mobile devices and **wearable AR glasses** for **anywhere, anytime assistance**.

---

# 🚀 NbAIl: The future is bright, and we're just getting started!

# 📚 Resources / Credits

This project would not have been possible without the amazing technologies, APIs, and open-source tools available to the community.  
Here's what powered NbAIl:

---

## ✨ Core Technologies
- **Next.js** - Frontend framework
- **Tailwind CSS** - Beautiful, responsive UI styling
- **Three.js** - 3D visuals on website 
- **Groq AI** - Ultra-fast LLMs for real-time interaction
- **Screenpipe: Terminator** - For Doing System Level work on command
- **Vapi Voice API** - Stores Voice Cache
- **Ngrok** - Local development tunneling for HTTPS
-**Spline** - 3d Interactive Model

---

## 💻 Development Tools
- **Visual Studio Code** - Code editor
- **Figma** - UI/UX designing
- **Vercel** - Hosting frontend (for demos)
- **Cursor** - Backend and Bug Fixing and Final Touches

---

## 🎨 Inspiration and References
- J.A.R.V.I.S. from Iron Man (fictional AI assistant)
- Midjourney + DALL-E for creative UI references
- Hackathons like HackHazards25 for pushing limits!

---

# 🚀 Let's keep building the future together!
# 🏁 Final Words

Building NbAIl has been an incredible journey — full of challenges, learning, and excitement.

What started as just an idea quickly turned into a living, breathing system that combines  
the power of AI, system control, and futuristic user experience.

---

## 🌟 Key Takeaways:
- AI isn't just about answering questions — it's about understanding **context** and **acting** on it.
- A clean, fast, and intuitive **UI/UX** is just as important as powerful features.
- **Thinking big** and **executing small steps** every day brings even the craziest ideas to life.

---

## 💬 Personal Reflection
- NbAIl is not just a project; it's a **vision of the future** — where digital assistants truly understand and help users at every moment.
- Even with limitations like no access to cloud VMs (due to age restrictions), I found creative ways (local hosting + ngrok) to bring the vision alive.
- Every error, every crash, every late night spent debugging — it all made the final build even more special.

---

# 🚀 This is just the beginning.
Bigger, smarter, and even crazier updates are on the way.

> **Thank you for reading, testing, and believing. The future is ours to create.**

---

> **"The ones who are crazy enough to think they can change the world are the ones who do."**  
> — Apple, 1997

## Environment Variables

You'll need to set up the following environment variables in your `.env.local` file:

- `NEXT_PUBLIC_GROQ_API_KEY`: Your Groq API key for AI analysis
- `NEXT_PUBLIC_MISTRAL_API_KEY`: Your Mistral API key for alternative AI analysis (optional)

### Obtaining API Keys

1. **Groq API Key**:
   - Visit [Groq's website](https://console.groq.com/)
   - Create an account and generate an API key

2. **Mistral API Key**:
   - Visit [Mistral's website](https://mistral.ai/)
   - Create an account and generate an API key
   - Note: We're using the Pixtral 12B 2409 model for AR mode vision analysis

Example `.env.local` file:
```
NEXT_PUBLIC_GROQ_API_KEY=your_groq_api_key_here
NEXT_PUBLIC_MISTRAL_API_KEY=your_mistral_api_key_here
```

**Note**: Keep your API keys confidential and never commit them to version control.
