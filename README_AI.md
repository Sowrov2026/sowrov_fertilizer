# SF AI — Bangladesh's Smartest Agriculture AI

## Overview
SF AI is a multi-language agriculture intelligence platform for Bangladeshi farmers. It provides expert advice on crop management, disease diagnosis, fertilizer recommendations, soil analysis, weather intelligence, and product recommendations.

## Version History
- V11: Enterprise Architecture (Multi-Agent System)
- V12: Knowledge Base Upgrade (999 documents)
- V14: AI Evaluation & Benchmark System (4500 test cases)
- V15: Smart Agriculture Super AI (12 modules)
- V16: Enterprise Intelligence (15 modules)

## Features

### Core AI
- Multi-language support (Bangla, English, Banglish, Chatgaiya, Maheshkhali)
- Intent-based routing (crop, disease, fertilizer, weather, soil, product)
- RAG (Retrieval Augmented Generation) with 999 verified documents
- Knowledge sources: BARI, BRRI, DAE, BARC, FAO
- Product recommendations from Firebase

### V15 Modules
- AI Vision: Image-based disease identification
- Soil Advisor: 9 soil types, pH analysis
- Weather Intelligence: 64 districts, Open-Meteo API
- Fertilizer Calculator: 16 crops, area-based calculations
- Crop Calendar: Seasonal planning
- Yield Prediction: Cost/profit estimation
- Smart Reminder: Browser notifications
- Disease Timeline: Progression tracking
- Product Recommendation: Firebase integration
- Confidence Score: Response quality
- Security: XSS prevention, rate limiting

### V16 Modules
- Voice AI: Speech-to-Text, Text-to-Speech
- AI Memory: Persistent user profiles
- OCR: Fertilizer packet reading
- PDF Reader: Document analysis
- Semantic Search: Intent-based retrieval
- Farmer Profile: Personalized advice
- AI Analytics: Usage tracking
- Self Learning: Unknown question tracking
- Offline AI: Offline capability
- Error Handling: Graceful fallbacks
- Performance: Caching, lazy loading

## Architecture
[See Architecture.md]

## API Endpoints
- POST /.netlify/functions/chat — Main chat endpoint
- POST /.netlify/functions/benchmark — Benchmark runner

## Technology Stack
- Frontend: Vanilla JS (ES Modules), HTML5, CSS3
- Backend: Netlify Functions (Node.js)
- Database: Firebase Firestore
- Storage: Firebase Storage
- AI: Groq API (llama-3.3-70b-versatile)
- Weather: Open-Meteo API (free)
- OCR: Tesseract.js
- PDF: PDF.js
