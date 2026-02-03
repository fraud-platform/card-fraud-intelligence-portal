#!/bin/bash

# Test script for Field Registry components
# Tests: FieldVersionsList, SubmitApprovalButton, StatusWidget

echo "=========================================="
echo "Testing Field Registry Components"
echo "=========================================="
echo ""

echo "1. Testing FieldVersionsList..."
pnpm test -- src/resources/ruleFields/components/__tests__/FieldVersionsList.test.tsx --run --reporter=basic
FIELD_VERSIONS_RESULT=$?

echo ""
echo "2. Testing SubmitApprovalButton..."
pnpm test -- src/resources/ruleFields/components/__tests__/SubmitApprovalButton.test.tsx --run --reporter=basic
SUBMIT_RESULT=$?

echo ""
echo "3. Testing StatusWidget..."
pnpm test -- src/components/fieldRegistry/__tests__/StatusWidget.test.tsx --run --reporter=basic
STATUS_WIDGET_RESULT=$?

echo ""
echo "=========================================="
echo "Test Results Summary"
echo "=========================================="
echo "FieldVersionsList: $([ $FIELD_VERSIONS_RESULT -eq 0 ] && echo 'PASSED ✅' || echo 'FAILED ❌')"
echo "SubmitApprovalButton: $([ $SUBMIT_RESULT -eq 0 ] && echo 'PASSED ✅' || echo 'FAILED ❌')"
echo "StatusWidget: $([ $STATUS_WIDGET_RESULT -eq 0 ] && echo 'PASSED ✅' || echo 'FAILED ❌')"
echo ""

if [ $FIELD_VERSIONS_RESULT -eq 0 ] && [ $SUBMIT_RESULT -eq 0 ] && [ $STATUS_WIDGET_RESULT -eq 0 ]; then
  echo "All tests PASSED! ✅"
  exit 0
else
  echo "Some tests FAILED! ❌"
  exit 1
fi
