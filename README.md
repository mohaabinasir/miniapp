# Telegram MiniApp Tester 

A **modern, super-fast Telegram MiniApp testing tool** that lets you experiment with MiniApps directly—no HTTPS hosting or tunneling required. Perfect for developers who want to quickly test MiniApp functionality and UI.

---

## Features

- **Universal MiniApp Support**  
  Test URLs with most Telegram MiniApp features including:
  - Back Button  
  - Main Button & Secondary Button  
  - Settings Button  
  - Popups & Alerts  
  - Biometrics authentication  
  - Valid Init Data handling  
  - And many more features  

- **Generate Valid Init Data**  
  - Provide a **bot token** to generate HMAC SHA-256 signed init data.  
  - Test authentication and user initialization flows securely.

- **Customizable Themes**  
  - Change colors and styles to match your MiniApp or personal preference.

- **Zero Hosting Required**  
  - Test MiniApps **locally** without HTTPS or tools like Ngrok.  
  - Ultra-fast and modern interface for instant testing.

---

## Usage

1. **Enter URL** of your Telegram MiniApp in the input field.  
2. **Optional:** Provide your bot token to generate valid init data.  
3. **Customize theme** and settings to your preference.  
4. **Start testing** your MiniApp with full Telegram features.  

---

## Installation

You can run the project locally:

```bash
git clone https://github.com/mohaabinasir/miniapp.git
cd miniapp
npm install
npm run dev
```