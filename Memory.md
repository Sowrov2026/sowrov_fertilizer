# SF AI Memory System

## Overview
The memory system persists user data across sessions using localStorage. It automatically extracts information from conversations to personalize responses.

## Storage
Key: `sf_ai_memory`
Format: JSON object with profile, preferences, history, context sections.

## Auto-Extraction
- Name: Detects "আমি [name]" patterns
- Location: Matches 64 Bangladesh districts
- Crops: Maps 100+ crop names (Bangla/English/Banglish)
- Farm Size: Parses "X বিঘা", "X শতক", "X একর"
- Land Type: Matches 9 soil types

## Privacy
- All data stored locally (localStorage)
- Never sent to third parties
- User can clear all data anytime
- No tracking without consent
