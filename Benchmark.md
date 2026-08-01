# SF AI Benchmark System

## Overview
Automated testing system with 4500 test cases across 5 languages.

## Datasets
| Dataset | Cases | Language |
|---------|-------|----------|
| Bangla | 1000 | বাংলা |
| English | 1000 | English |
| Banglish | 1000 | Romanized Bangla |
| Chatgaiya | 1000 | চাটগাইয়া |
| Maheshkhali | 500 | মহেশখালী |

## Metrics
- Accuracy %
- Hallucination %
- Response Time
- Source Correctness
- Language Detection
- Intent Detection
- RAG Retrieval

## Running Benchmarks
```bash
node netlify/functions/evaluation/run-benchmark.js all
```

## Reports
- benchmark-report.json
- benchmark-report.md
- dashboard-summary.json
