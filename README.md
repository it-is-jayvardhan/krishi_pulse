# KrishiPulse 🌱

KrishiPulse is a modern, high-performance web application designed to help Indian farmers and agricultural traders make data-driven decisions. By tracking historical and current mandi (market) prices across India, KrishiPulse provides actionable insights into market trends, allowing users to determine the optimal time and place to sell their crops.

![KrishiPulse Dashboard Preview](https://github.com/it-is-jayvardhan/krishi_pulse/assets/your-image-url-here.png) _(Note: Add a screenshot of your dashboard here later!)_

## 🚀 Live Demo

**[krishi-pulse.vercel.app](https://krishi-pulse.vercel.app/)**

## ✨ Key Features

- **Multi-Month Market Tracking:** View daily modal, minimum, and maximum prices alongside arrival quantities for up to 12 months at a glance.
- **Intelligent Comparison:** Compare the performance of specific markets side-by-side across different months or years to spot seasonal trends.
- **Relative Price Tiering:** Prices are color-coded (🟩 Good, 🟨 Average, 🟥 Poor) relative to that specific month's data, providing instant visual context without needing to read the numbers.
- **Offline-Resilient Caching:** Utilizes multi-tier `localStorage` caching to minimize API calls, ensuring lightning-fast load times and protection against rate limits.
- **Dark Mode Support:** Fully integrated light/dark themes that adapt to system preferences.
- **Fully Responsive:** Designed with a mobile-first approach to ensure usability on any device, from field to office.

## 🛠️ Technology Stack

- **Framework:** [Next.js 15 (App Router)](https://nextjs.org/)
- **Language:** TypeScript
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **UI Components:** Built from scratch utilizing [Framer Motion](https://www.framer.com/motion/) for fluid animations and `lucide-react` for icons.
- **Data Source:** [CEDA Agmarknet API](https://api.ceda.ashoka.edu.in/)
- **Deployment & Analytics:** [Vercel](https://vercel.com/) (Web Analytics & Speed Insights integrated)

## 🏗️ Architecture & Optimizations

- **Secure API Proxy:** All external CEDA API requests are routed through Next.js serverless functions (`/api/agmarknet/[...path]`). This completely hides the authorization token from the client and bypasses strict CORS policies.
- **Batch Fetching:** The `usePrices` hook is optimized to fetch an entire date range in a single POST request, rather than looping month-by-month, drastically reducing function invocations.
- **Graceful Rate Limit Handling:** Built-in error boundaries immediately catch `429 Too Many Requests` errors from the CEDA API and display a user-friendly fallback UI.

## 💻 Running Locally

### Prerequisites

- Node.js (v18 or higher)
- A CEDA API Token

### Installation Steps

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/it-is-jayvardhan/krishi_pulse.git](https://github.com/it-is-jayvardhan/krishi_pulse.git)
   cd krishi_pulse
   ```
