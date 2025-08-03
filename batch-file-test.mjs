#!/usr/bin/env node

/**
 * Batch Management System - File Structure and Code Quality Test
 * Tests that all required files exist and contain proper implementations
 */

const fs = require('fs');
const path = require('path');

console.log('📁 Batch Management System - File Structure Test');
console.log('=================================================\n');

let testCount = 0;
let passedTests = 0;
let failedTests = 0;

function test(name, testFn) {
  testCount++;
  try {
    console.log(`🔍 Test ${testCount}: ${name}`);
    testFn();
    passedTests++;
    console.log(`✅ PASSED\n`);
  } catch (error) {
    failedTests++;
    console.log(`❌ FAILED: ${error.message}\n`);
  }
}

function expect(actual) {
  return {
    toBe: (expected) => {
      if (actual !== expected) {
        throw new Error(`Expected ${expected}, but got ${actual}`);
      }
    },
    toBeGreaterThan: (expected) => {
      if (actual <= expected) {
        throw new Error(`Expected ${actual} to be greater than ${expected}`);
      }
    },
    toContain: (expected) => {
      if (typeof actual === 'string' && !actual.includes(expected)) {
        throw new Error(`Expected content to contain "${expected}"`);
      }
    },
    toExist: () => {
      if (!fs.existsSync(actual)) {
        throw new Error(`File ${actual} does not exist`);
      }
    }
  };
}

// Test 1: Core Service File
test('Batch service file exists and contains core methods', () => {
  const servicePath = path.join(process.cwd(), 'src/services/batchService.ts');
  expect(servicePath).toExist();
  
  const content = fs.readFileSync(servicePath, 'utf-8');
  const requiredMethods = [
    'generateBatchNumber',
    'calculateFCR',
    'calculateMortalityRate',
    'calculateAge',
    'createBatch',
    'updateBatch',
    'deleteBatch',
    'getBatch',
    'getBatches',
    'getBatchMetrics',
    'getBatchSummary'
  ];
  
  requiredMethods.forEach(method => {
    expect(content).toContain(method);
  });
  
  console.log(`   ✓ Service file exists with ${requiredMethods.length} required methods`);
});

// Test 2: Type Definitions File
test('Batch types file exists and contains interfaces', () => {
  const typesPath = path.join(process.cwd(), 'src/types/batch.ts');
  expect(typesPath).toExist();
  
  const content = fs.readFileSync(typesPath, 'utf-8');
  const requiredTypes = [
    'interface Batch',
    'interface BatchMetrics',
    'interface BatchFormData',
    'interface BatchFilters',
    'BATCH_VALIDATION_RULES',
    'PERFORMANCE_BENCHMARKS',
    'getFCRRating',
    'getMortalityRating'
  ];
  
  requiredTypes.forEach(type => {
    expect(content).toContain(type);
  });
  
  console.log(`   ✓ Types file exists with ${requiredTypes.length} required definitions`);
});

// Test 3: Dashboard Component
test('BatchDashboard component exists and is properly implemented', () => {
  const dashboardPath = path.join(process.cwd(), 'src/components/BatchDashboard.tsx');
  expect(dashboardPath).toExist();
  
  const content = fs.readFileSync(dashboardPath, 'utf-8');
  const requiredFeatures = [
    'export default function BatchDashboard',
    'useState<Batch[]>',
    'batchService',
    'BatchMetricsComponent',
    'BatchCard',
    'BatchForm',
    'handleBatchSubmit',
    'handleEditBatch',
    'handleBatchDelete',
    'loadBatchData',
    'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    'searchTerm',
    'filters'
  ];
  
  requiredFeatures.forEach(feature => {
    expect(content).toContain(feature);
  });
  
  console.log(`   ✓ Dashboard component with ${requiredFeatures.length} required features`);
});

// Test 4: Batch Card Component
test('BatchCard component exists and contains proper functionality', () => {
  const cardPath = path.join(process.cwd(), 'src/components/BatchCard.tsx');
  expect(cardPath).toExist();
  
  const content = fs.readFileSync(cardPath, 'utf-8');
  const requiredFeatures = [
    'export default function BatchCard',
    'interface BatchCardProps',
    'onEdit',
    'onDelete',
    'onStatusUpdate',
    'batchService.calculateAge',
    'batchService.calculateMortalityRate',
    'DropdownMenu',
    'AlertDialog',
    'toast',
    'formatDistanceToNow',
    'grid-cols-1 sm:grid-cols-2'
  ];
  
  requiredFeatures.forEach(feature => {
    expect(content).toContain(feature);
  });
  
  console.log(`   ✓ BatchCard component with ${requiredFeatures.length} required features`);
});

// Test 5: Batch Form Component
test('BatchForm component exists with validation and calculations', () => {
  const formPath = path.join(process.cwd(), 'src/components/BatchForm.tsx');
  expect(formPath).toExist();
  
  const content = fs.readFileSync(formPath, 'utf-8');
  const requiredFeatures = [
    'export default function BatchForm',
    'interface BatchFormProps',
    'useForm',
    'zodResolver',
    'batchFormSchema',
    'onSubmit',
    'batchService.calculateFCR',
    'Dialog',
    'Form',
    'FormField',
    'Button',
    'isSubmitting',
    'grid-cols-1 md:grid-cols-2'
  ];
  
  requiredFeatures.forEach(feature => {
    expect(content).toContain(feature);
  });
  
  console.log(`   ✓ BatchForm component with ${requiredFeatures.length} required features`);
});

// Test 6: Batch Metrics Component
test('BatchMetrics component exists with performance indicators', () => {
  const metricsPath = path.join(process.cwd(), 'src/components/BatchMetrics.tsx');
  expect(metricsPath).toExist();
  
  const content = fs.readFileSync(metricsPath, 'utf-8');
  const requiredFeatures = [
    'export default function BatchMetrics',
    'interface BatchMetricsProps',
    'getFCRRating',
    'getMortalityRating',
    'Badge',
    'Card',
    'CardContent',
    'TrendingUp',
    'TrendingDown',
    'Target',
    'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
  ];
  
  requiredFeatures.forEach(feature => {
    expect(content).toContain(feature);
  });
  
  console.log(`   ✓ BatchMetrics component with ${requiredFeatures.length} required features`);
});

// Test 7: Database Configuration
test('Database configuration files exist and are properly configured', () => {
  // Check Firestore rules
  const rulesPath = path.join(process.cwd(), 'firestore.rules');
  expect(rulesPath).toExist();
  
  const rulesContent = fs.readFileSync(rulesPath, 'utf-8');
  expect(rulesContent).toContain('match /batches/{batchId}');
  expect(rulesContent).toContain('match /batchPerformance/{performanceId}');
  
  // Check Firestore indexes
  const indexesPath = path.join(process.cwd(), 'firestore.indexes.json');
  expect(indexesPath).toExist();
  
  const indexesContent = fs.readFileSync(indexesPath, 'utf-8');
  expect(indexesContent).toContain('"collectionGroup": "batches"');
  expect(indexesContent).toContain('"collectionGroup": "batchPerformance"');
  
  console.log('   ✓ Database configuration files properly set up');
});

// Test 8: Code Quality - TypeScript Implementation
test('All components use proper TypeScript patterns', () => {
  const componentFiles = [
    'src/components/BatchDashboard.tsx',
    'src/components/BatchCard.tsx',
    'src/components/BatchForm.tsx',
    'src/components/BatchMetrics.tsx'
  ];
  
  componentFiles.forEach(file => {
    const content = fs.readFileSync(path.join(process.cwd(), file), 'utf-8');
    
    // Check TypeScript patterns
    expect(content).toContain('interface');
    expect(content).toContain('React.FC');
    expect(content).toContain('useState');
    expect(content).toContain('export default function');
  });
  
  console.log(`   ✓ All ${componentFiles.length} components use proper TypeScript patterns`);
});

// Test 9: Mobile Responsiveness
test('All components implement mobile-responsive design', () => {
  const componentFiles = [
    'src/components/BatchDashboard.tsx',
    'src/components/BatchCard.tsx',
    'src/components/BatchForm.tsx',
    'src/components/BatchMetrics.tsx'
  ];
  
  componentFiles.forEach(file => {
    const content = fs.readFileSync(path.join(process.cwd(), file), 'utf-8');
    
    // Check for responsive classes
    const hasResponsiveClasses = content.includes('sm:') || content.includes('md:') || content.includes('lg:');
    if (!hasResponsiveClasses) {
      throw new Error(`${file} lacks responsive design classes`);
    }
  });
  
  console.log(`   ✓ All ${componentFiles.length} components implement responsive design`);
});

// Test 10: Service Integration
test('Components properly integrate with batch service', () => {
  const componentFiles = [
    'src/components/BatchDashboard.tsx',
    'src/components/BatchCard.tsx',
    'src/components/BatchForm.tsx'
  ];
  
  componentFiles.forEach(file => {
    const content = fs.readFileSync(path.join(process.cwd(), file), 'utf-8');
    expect(content).toContain('batchService');
  });
  
  // Check service methods usage
  const dashboardContent = fs.readFileSync(path.join(process.cwd(), 'src/components/BatchDashboard.tsx'), 'utf-8');
  const serviceMethods = [
    'createBatch',
    'updateBatch',
    'deleteBatch',
    'getBatchSummary'
  ];
  
  serviceMethods.forEach(method => {
    expect(dashboardContent).toContain(`batchService.${method}`);
  });
  
  console.log(`   ✓ Components properly integrate with ${serviceMethods.length} service methods`);
});

// Print final results
console.log('='.repeat(55));
console.log('📊 FILE STRUCTURE TEST RESULTS');
console.log('='.repeat(55));
console.log(`Total Tests: ${testCount}`);
console.log(`✅ Passed: ${passedTests}`);
console.log(`❌ Failed: ${failedTests}`);
console.log(`Success Rate: ${((passedTests / testCount) * 100).toFixed(1)}%`);

if (failedTests === 0) {
  console.log('\n🎉 All file structure tests passed!');
  console.log('📁 The Batch Management System has all required files and implementations.');
  console.log('✨ Ready for integration testing!');
} else {
  console.log(`\n⚠️  ${failedTests} test(s) failed.`);
  console.log('Please review the implementation.');
}

console.log('\n✅ File structure testing complete!\n');
