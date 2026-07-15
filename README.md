# KrishiPulse 🌱

KrishiPulse is a lightning-fast, mobile-first dashboard built to give Indian farmers and agricultural traders instant access to **live daily mandi prices**. By connecting directly to government datasets, KrishiPulse helps users track daily market fluctuations and make informed, data-driven decisions on where and when to sell their crops.

<!-- ![KrishiPulse Dashboard Preview](https://github.com/it-is-jayvardhan/krishi_pulse/assets/your-image-url-here.png)
*(Note: Add a screenshot of your new card dashboard here!)* -->

## 🚀 Live Demo

**[krishi-pulse.vercel.app](https://krishi-pulse.vercel.app/)**

## ✨ What's Inside

- **Live Daily Prices:** Get real-time modal, minimum, and maximum prices directly from the `data.gov.in` API, complete with specific commodity varieties and agricultural grades.
- **Set It and Forget It:** The app remembers your preferred State and Commodity (saving them securely in your browser), so you get exactly what you need the second you open the app.
- **Smart Trend Indicators:** KrishiPulse silently saves today's data to your device. When you check prices tomorrow, it automatically compares them to show if the market is trending UP 🟩, DOWN 🟥, or FLAT ➖.
- **Lightning Fast on Mobile:** Instead of freezing your phone with hundreds of results, the app uses client-side pagination (loading 10 markets at a time) for a buttery-smooth scrolling experience.
- **Accessible UI:** Fully responsive design that looks great in the field on a budget smartphone, or in the office on a desktop monitor. Includes full Dark Mode support.

## 🛠️ Technology Stack

- **Framework:** [Next.js 15 (App Router)](https://nextjs.org/)
- **Language:** TypeScript
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons & UI:** `lucide-react` for crisp icons, with a custom-built, accessible component library.
- **Data Source:** Official [data.gov.in Mandi API](https://data.gov.in/)

## 🏗️ Architecture

- **Secure API Proxy:** All requests to `data.gov.in` are routed through a Next.js server route (`/api/agmarknet/current`). This completely hides your API key from the public and prevents CORS errors.
- **Strict Data Mapping:** Uses exact government-approved string arrays for States and Commodities to ensure queries never silently fail due to typos.

## 💻 Running Locally

### Prerequisites

- Node.js (v18 or higher)
- A free API Key from [data.gov.in](https://data.gov.in/)

### Installation Steps

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/it-is-jayvardhan/krishi_pulse.git](https://github.com/it-is-jayvardhan/krishi_pulse.git)
   cd krishi_pulse
   ```
