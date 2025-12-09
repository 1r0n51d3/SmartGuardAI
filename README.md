# SiteGuard AI 🏗️🛡️

**Track:** AI in Construction  
**Hackathon:** Thinkathon 2025

## 📖 Short Description
Construction site safety is often reactive, manual, and prone to human error. Site managers struggle to monitor hazardous conditions and track progress simultaneously across vast project sites.

**SiteGuard AI** is an intelligent "Digital Safety Twin" that uses **Google's Gemini 2.5 Vision Multimodal API** to automate site inspections. 

This Proof of Concept demonstrates:
1.  **Instant Hazard Detection:** Uploading or streaming a site photo instantly identifies OSHA violations (e.g., missing PPE, exposed wiring).
2.  **Multimodal Reasoning:** Users can "chat" with the site image to ask specific context questions (e.g., "Is the scaffolding braced correctly?").
3.  **Synthetic Simulation:** Uses Generative AI to create realistic hazard scenarios for testing without needing dangerous real-world photos.
4.  **Automated Compliance:** Generates PDF-ready audit reports, reducing paperwork by 90%.

---

## 🚀 Key Features
*   **Real-time Analysis:** Safety Scores (0-100), Hazard Lists, and Progress Estimates.
*   **Generative Test Mode:** Generate synthetic construction sites with hazards to test the system on the fly.
*   **Interactive Site Chat:** Ask follow-up questions about the analyzed image.
*   **Live Dashboard:** Visual trends for safety compliance and hazard categories.
*   **Professional Reporting:** Export detailed safety audits to PDF.

## 🛠️ Tech Stack
*   **Frontend:** React, TypeScript, Vite
*   **Styling:** Tailwind CSS, Lucide Icons
*   **AI Model:** Google Gemini 2.5 Flash (Vision & Text), Gemini 2.5 Flash Image (Generation)
*   **Visualization:** Recharts

## ⚙️ How to Run
1.  Clone the repository.
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Set your API Key:
    *   Create a `.env` file in the root.
    *   Add: `API_KEY=your_gemini_api_key_here`
4.  Run the application:
    ```bash
    npm run dev
    ```

---
*Built for Thinkathon 2025 by Muhammad Danjuma/Graintox