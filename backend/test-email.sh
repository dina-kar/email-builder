#!/bin/bash

echo "Testing email endpoints..."

echo ""
echo "1. Verifying email server connection..."
curl -X GET http://localhost:3000/api/email/verify

echo ""
echo ""
echo "2. Sending test email to default recipients (theoldmanofgod@gmail.com, dinakaranvijayakumar@outlook.com)..."
curl -X POST http://localhost:3000/api/email/send-test \
  -H "Content-Type: application/json" \
  -d '{}'

echo ""
echo ""
echo "3. Sending test email to custom recipients..."
curl -X POST http://localhost:3000/api/email/send-test \
  -H "Content-Type: application/json" \
  -d '{"recipients": ["theoldmanofgod@gmail.com"]}'

echo ""
echo ""
echo "Done!"
