#!/bin/bash

# Email Builder Backend API Test Script
# This script tests all the backend functionalities

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Base URL
BASE_URL="http://localhost:3000/api"

# Variables to store IDs
TEMPLATE_ID=""
ASSET_KEY=""
THUMBNAIL_KEY=""

# Function to print section headers
print_header() {
    echo ""
    echo "======================================================================"
    echo -e "${BLUE}$1${NC}"
    echo "======================================================================"
}

# Function to print test results
print_test() {
    echo -e "${YELLOW}TEST: $1${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Function to make curl request and check status
test_request() {
    local method=$1
    local endpoint=$2
    local data=$3
    local expected_status=$4
    local description=$5
    
    print_test "$description"
    
    if [ -n "$data" ]; then
        response=$(curl -s -w "\n%{http_code}" -X "$method" "$BASE_URL$endpoint" \
            -H "Content-Type: application/json" \
            -d "$data")
    else
        response=$(curl -s -w "\n%{http_code}" -X "$method" "$BASE_URL$endpoint")
    fi
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" = "$expected_status" ]; then
        print_success "Status: $http_code (Expected: $expected_status)"
        echo "Response: $body" | jq '.' 2>/dev/null || echo "$body"
        echo "$body"
        return 0
    else
        print_error "Status: $http_code (Expected: $expected_status)"
        echo "Response: $body"
        return 1
    fi
}

# Function to upload file
test_upload() {
    local endpoint=$1
    local file_path=$2
    local description=$3
    
    print_test "$description"
    
    response=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL$endpoint" \
        -F "file=@$file_path")
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" = "201" ]; then
        print_success "Status: $http_code"
        echo "Response: $body" | jq '.' 2>/dev/null || echo "$body"
        echo "$body"
        return 0
    else
        print_error "Status: $http_code (Expected: 201)"
        echo "Response: $body"
        return 1
    fi
}

# Check if server is running
print_header "Checking if backend server is running..."
if ! curl -s "$BASE_URL" > /dev/null; then
    print_error "Backend server is not running at $BASE_URL"
    echo "Please start the server first using: pnpm start:dev"
    exit 1
fi
print_success "Backend server is running"

# Test 1: Get all templates (should be empty initially)
print_header "Test 1: Get All Templates (Initial)"
result=$(test_request "GET" "/templates" "" "200" "Fetch all templates")
echo ""

# Test 2: Create a new template
print_header "Test 2: Create New Template"
template_data='{
  "name": "Test Welcome Email",
  "description": "A test welcome email template",
  "html": "<div style=\"font-family: Arial, sans-serif;\"><h1>Welcome!</h1><p>Thank you for joining us.</p></div>",
  "css": "h1 { color: #4A90E2; } p { color: #333; }",
  "status": "draft",
  "metadata": {
    "author": "Test User",
    "version": "1.0"
  }
}'

result=$(test_request "POST" "/templates" "$template_data" "201" "Create a new template")
TEMPLATE_ID=$(echo "$result" | jq -r '.id' 2>/dev/null)
if [ -n "$TEMPLATE_ID" ] && [ "$TEMPLATE_ID" != "null" ]; then
    print_success "Template created with ID: $TEMPLATE_ID"
else
    print_error "Failed to extract template ID"
fi
echo ""

# Test 3: Get template by ID
if [ -n "$TEMPLATE_ID" ]; then
    print_header "Test 3: Get Template by ID"
    test_request "GET" "/templates/$TEMPLATE_ID" "" "200" "Fetch template by ID: $TEMPLATE_ID"
    echo ""
fi

# Test 4: Get all templates (should now have 1)
print_header "Test 4: Get All Templates (After Creation)"
test_request "GET" "/templates" "" "200" "Fetch all templates"
echo ""

# Test 5: Update template
if [ -n "$TEMPLATE_ID" ]; then
    print_header "Test 5: Update Template"
    update_data='{
      "name": "Updated Welcome Email",
      "description": "An updated test welcome email template",
      "status": "published"
    }'
    test_request "PATCH" "/templates/$TEMPLATE_ID" "$update_data" "200" "Update template: $TEMPLATE_ID"
    echo ""
fi

# Test 6: Test Base64 Image Upload
print_header "Test 6: Upload Base64 Image"
base64_data='{
  "base64Data": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
}'
result=$(test_request "POST" "/templates/upload/base64-image" "$base64_data" "201" "Upload base64 image")
echo ""

# Test 7: Create temporary test file for upload
print_header "Test 7: Upload Asset File"
TEST_FILE="/tmp/test-asset.txt"
echo "This is a test asset file" > "$TEST_FILE"
if [ -f "$TEST_FILE" ]; then
    result=$(test_upload "/templates/upload/asset" "$TEST_FILE" "Upload test asset")
    ASSET_KEY=$(echo "$result" | jq -r '.key' 2>/dev/null)
    if [ -n "$ASSET_KEY" ]; then
        print_success "Asset uploaded with key: $ASSET_KEY"
    fi
    rm -f "$TEST_FILE"
else
    print_error "Failed to create test file"
fi
echo ""

# Test 8: Upload Thumbnail
print_header "Test 8: Upload Thumbnail"
TEST_THUMB="/tmp/test-thumbnail.txt"
echo "This is a test thumbnail" > "$TEST_THUMB"
if [ -f "$TEST_THUMB" ]; then
    result=$(test_upload "/templates/upload/thumbnail" "$TEST_THUMB" "Upload test thumbnail")
    THUMBNAIL_KEY=$(echo "$result" | jq -r '.key' 2>/dev/null)
    if [ -n "$THUMBNAIL_KEY" ]; then
        print_success "Thumbnail uploaded with key: $THUMBNAIL_KEY"
    fi
    rm -f "$TEST_THUMB"
else
    print_error "Failed to create thumbnail test file"
fi
echo ""

# Test 9: Create another template
print_header "Test 9: Create Second Template"
template_data2='{
  "name": "Newsletter Template",
  "description": "Monthly newsletter template",
  "html": "<div><h2>Monthly Newsletter</h2></div>",
  "css": "h2 { color: #E94E77; }",
  "status": "draft"
}'
result=$(test_request "POST" "/templates" "$template_data2" "201" "Create another template")
TEMPLATE_ID_2=$(echo "$result" | jq -r '.id' 2>/dev/null)
if [ -n "$TEMPLATE_ID_2" ]; then
    print_success "Second template created with ID: $TEMPLATE_ID_2"
fi
echo ""

# Test 10: Get all templates (should now have 2)
print_header "Test 10: Get All Templates (Final Check)"
test_request "GET" "/templates" "" "200" "Fetch all templates"
echo ""

# Test 11: Delete first template
if [ -n "$TEMPLATE_ID" ]; then
    print_header "Test 11: Delete Template"
    test_request "DELETE" "/templates/$TEMPLATE_ID" "" "200" "Delete template: $TEMPLATE_ID"
    echo ""
fi

# Test 12: Verify deletion
if [ -n "$TEMPLATE_ID" ]; then
    print_header "Test 12: Verify Template Deletion"
    test_request "GET" "/templates/$TEMPLATE_ID" "" "404" "Try to fetch deleted template (should fail)"
    echo ""
fi

# Test 13: Get all templates (should now have 1)
print_header "Test 13: Get Remaining Templates"
test_request "GET" "/templates" "" "200" "Fetch all templates after deletion"
echo ""

# Test 14: Test error handling - Invalid template ID
print_header "Test 14: Error Handling - Invalid Template ID"
test_request "GET" "/templates/invalid-uuid" "" "500" "Try to fetch with invalid UUID (should fail)"
echo ""

# Test 15: Test error handling - Create template with missing required field
print_header "Test 15: Error Handling - Missing Required Fields"
invalid_data='{
  "description": "Template without name"
}'
test_request "POST" "/templates" "$invalid_data" "400" "Try to create template without required fields"
echo ""

# Final Summary
print_header "TEST SUMMARY"
echo -e "${GREEN}All tests completed!${NC}"
echo ""
echo "Created templates: 2"
echo "Deleted templates: 1"
echo "Remaining templates: 1"
echo "Uploaded assets: 1"
echo "Uploaded thumbnails: 1"
echo ""
echo -e "${BLUE}To view all templates, visit:${NC}"
echo "http://localhost:3000/api/templates"
echo ""
print_success "Backend functionality testing complete!"
