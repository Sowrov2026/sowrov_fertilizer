# SF AI V14 Benchmark Report
> Generated: 2026-08-02T16:43:35.012Z

## Summary

| Metric | Value |
|--------|-------|
| Total Test Cases | 4500 |
| Passed | 3458 |
| Failed | 1042 |
| Overall Accuracy | 76.84% |
| Avg Latency | 3.8ms |
| Hallucination Rate | 0.00% |
| Language Accuracy | 79.84% |

## Dataset Results

### BANGLA
- Total: 1000 | Passed: 858 | Failed: 142
- Accuracy: 85.80%
- Avg Latency: 5.0ms

| Category | Accuracy | Avg Score |
|----------|----------|-----------|
| crop_identification | 100.0% | 75.7% |
| disease_diagnosis | 100.0% | 89.4% |
| fertilizer_recommendation | 100.0% | 80.7% |
| organic_farming | 99.2% | 76.8% |
| soil_health | 100.0% | 77.7% |
| pest_control | 92.0% | 70.9% |
| weather_advice | 92.8% | 77.5% |
| product_recommendation | 2.4% | 47.0% |

| Language | Accuracy | Avg Score |
|----------|----------|-----------|
| bangla | 95.7% | 77.9% |
| mixed | 7.1% | 47.3% |

### ENGLISH
- Total: 1000 | Passed: 900 | Failed: 100
- Accuracy: 90.00%
- Avg Latency: 3.6ms

| Category | Accuracy | Avg Score |
|----------|----------|-----------|
| crop_identification | 89.1% | 70.8% |
| disease_diagnosis | 98.2% | 77.7% |
| fertilizer_recommendation | 98.0% | 76.2% |
| organic_farming | 99.0% | 74.5% |
| soil_health | 99.0% | 75.2% |
| pest_control | 96.6% | 72.3% |
| weather_advice | 81.4% | 67.3% |
| product_recommendation | 33.3% | 59.8% |
| general | 97.4% | 70.7% |

| Language | Accuracy | Avg Score |
|----------|----------|-----------|
| banglish | 87.0% | 68.4% |
| english | 90.2% | 72.0% |

### BANGLISH
- Total: 1000 | Passed: 333 | Failed: 667
- Accuracy: 33.30%
- Avg Latency: 2.9ms

| Category | Accuracy | Avg Score |
|----------|----------|-----------|
| organic_farming | 34.0% | 54.7% |
| soil_health | 9.0% | 51.1% |
| government | 99.0% | 66.5% |
| general | 74.0% | 66.8% |
| disease_diagnosis | 32.0% | 57.8% |
| pest_control | 10.0% | 50.7% |
| fertilizer_recommendation | 52.0% | 57.8% |
| product_recommendation | 3.0% | 46.5% |
| weather_advice | 17.0% | 53.7% |
| crop_identification | 3.0% | 50.0% |

| Language | Accuracy | Avg Score |
|----------|----------|-----------|
| banglish | 54.8% | 59.9% |
| mixed | 22.1% | 53.5% |
| english | 21.4% | 53.1% |

### CHATGAIYA
- Total: 1000 | Passed: 919 | Failed: 81
- Accuracy: 91.90%
- Avg Latency: 3.5ms

| Category | Accuracy | Avg Score |
|----------|----------|-----------|
| crop_identification | 88.0% | 65.1% |
| disease_diagnosis | 100.0% | 73.7% |
| fertilizer_recommendation | 100.0% | 77.2% |
| organic_farming | 98.9% | 71.3% |
| soil_health | 100.0% | 77.5% |
| pest_control | 99.1% | 73.7% |
| weather_advice | 100.0% | 72.7% |
| product_recommendation | 35.0% | 58.2% |
| government | 89.0% | 70.1% |
| general | 99.3% | 73.0% |

| Language | Accuracy | Avg Score |
|----------|----------|-----------|
| bangla | 92.0% | 71.4% |
| mixed | 50.0% | 68.5% |

### MAHESHKHALI
- Total: 500 | Passed: 448 | Failed: 52
- Accuracy: 89.60%
- Avg Latency: 3.8ms

| Category | Accuracy | Avg Score |
|----------|----------|-----------|
| crop_identification | 64.0% | 61.4% |
| disease_diagnosis | 92.0% | 78.7% |
| fertilizer_recommendation | 98.0% | 76.4% |
| weather_advice | 100.0% | 70.8% |
| soil_health | 100.0% | 73.8% |
| product_recommendation | 52.0% | 59.7% |
| pest_control | 90.0% | 66.0% |
| organic_farming | 100.0% | 76.5% |
| government | 100.0% | 87.3% |
| general | 100.0% | 67.6% |

| Language | Accuracy | Avg Score |
|----------|----------|-----------|
| bangla | 89.5% | 71.8% |
| mixed | 93.3% | 70.5% |

## Weak Areas

| Type | Name | Accuracy | Status |
|------|------|----------|--------|
| category | product_recommendation | 2.4% | CRITICAL |
| language | mixed | 7.1% | CRITICAL |
| category | product_recommendation | 33.3% | CRITICAL |
| category | product_recommendation | 3.0% | CRITICAL |
| category | crop_identification | 3.0% | CRITICAL |
| category | soil_health | 9.0% | CRITICAL |
| category | pest_control | 10.0% | CRITICAL |
| category | weather_advice | 17.0% | CRITICAL |
| language | english | 21.4% | CRITICAL |
| language | mixed | 22.1% | CRITICAL |
| difficulty | easy | 31.9% | CRITICAL |
| category | disease_diagnosis | 32.0% | CRITICAL |
| difficulty | medium | 33.7% | CRITICAL |
| category | organic_farming | 34.0% | CRITICAL |
| difficulty | hard | 35.0% | CRITICAL |
| category | fertilizer_recommendation | 52.0% | NEEDS IMPROVEMENT |
| language | banglish | 54.8% | NEEDS IMPROVEMENT |
| category | product_recommendation | 35.0% | CRITICAL |
| language | mixed | 50.0% | NEEDS IMPROVEMENT |
| category | product_recommendation | 52.0% | NEEDS IMPROVEMENT |

## Improvement Suggestions

### [HIGH] product_recommendation
- **Issue:** Accuracy 2.4% on product recommendation
- **Suggestion:** Improve product-crop matching in product agent. Add more product metadata.

### [HIGH] product_recommendation
- **Issue:** Accuracy 33.3% on product recommendation
- **Suggestion:** Improve product-crop matching in product agent. Add more product metadata.

### [HIGH] product_recommendation
- **Issue:** Accuracy 3.0% on product recommendation
- **Suggestion:** Improve product-crop matching in product agent. Add more product metadata.

### [HIGH] difficulty_hard
- **Issue:** Accuracy 35.0% on hard questions
- **Suggestion:** Add more knowledge entries for hard-level questions.

### [HIGH] fertilizer_recommendation
- **Issue:** Accuracy 52.0% on fertilizer recommendation
- **Suggestion:** Add more fertilizer-crop mapping data. Include seasonal fertilizer schedules.

### [HIGH] banglish_detection
- **Issue:** Accuracy 54.8% on Banglish detection
- **Suggestion:** Improve Banglish word list in language.js. Add more romanized Bangla words.

### [HIGH] product_recommendation
- **Issue:** Accuracy 35.0% on product recommendation
- **Suggestion:** Improve product-crop matching in product agent. Add more product metadata.

### [HIGH] product_recommendation
- **Issue:** Accuracy 52.0% on product recommendation
- **Suggestion:** Improve product-crop matching in product agent. Add more product metadata.

### [MEDIUM] mixed_language
- **Issue:** Accuracy 7.1% on mixed language handling
- **Suggestion:** Improve mixed language detection logic. Handle code-switching better.

### [MEDIUM] soil_health
- **Issue:** Accuracy 9.0% on soil health
- **Suggestion:** Add regional soil data for Chattogram/Maheshkhali coastal areas.

### [MEDIUM] weather_advice
- **Issue:** Accuracy 17.0% on weather advice
- **Suggestion:** Add seasonal weather-crop mapping. Include Kharif/Rabi season data.

### [MEDIUM] mixed_language
- **Issue:** Accuracy 22.1% on mixed language handling
- **Suggestion:** Improve mixed language detection logic. Handle code-switching better.

### [MEDIUM] difficulty_easy
- **Issue:** Accuracy 31.9% on easy questions
- **Suggestion:** Add more knowledge entries for easy-level questions.

### [MEDIUM] difficulty_medium
- **Issue:** Accuracy 33.7% on medium questions
- **Suggestion:** Add more knowledge entries for medium-level questions.

### [MEDIUM] organic_farming
- **Issue:** Accuracy 34.0% on organic farming
- **Suggestion:** Expand organic farming knowledge base. Add more organic method entries.

### [MEDIUM] mixed_language
- **Issue:** Accuracy 50.0% on mixed language handling
- **Suggestion:** Improve mixed language detection logic. Handle code-switching better.

### [CRITICAL] crop_identification
- **Issue:** Accuracy 3.0% on crop identification
- **Suggestion:** Improve crop alias mapping in intent.js. Add more Chatgaiya/Banglish crop name aliases.

### [CRITICAL] pest_control
- **Issue:** Accuracy 10.0% on pest control
- **Suggestion:** Expand pest identification data. Add seasonal pest patterns.

### [CRITICAL] disease_diagnosis
- **Issue:** Accuracy 32.0% on disease diagnosis
- **Suggestion:** Expand disease symptom keywords in knowledge base. Add more Bangla disease terminology.

## Approval Sources Used
- BARI: https://bari.gov.bd
- BRRI: https://brri.gov.bd
- DAE: https://dae.gov.bd
- BARC: https://barc.gov.bd
- FAO Bangladesh: https://www.fao.org/bangladesh

---
*Report generated by SF AI V14 Evaluation System*