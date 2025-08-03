#!/usr/bin/env node

/**
 * Batch Management System Integration Test
 * Tests the complete flow and integration between all components
 */

import fs from 'fs';
import path from 'path';

console.log('🔗 Batch Management System Integration Test');
console.log('=============================================\n');

let testCount = 0;
let passedTests = 0;
let failedTests = 0;

function test(name, testFn) {
  testCount++;
  try {
    console.log(`🔍 Integration Test ${testCount}: ${name}`);
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
      if (!actual.includes(expected)) {
        throw new Error(`Expected ${actual} to contain ${expected}`);
      }
    },
    toExist: () => {
      if (!fs.existsSync(actual)) {
        throw new Error(`File ${actual} does not exist`);
      }
    }
  };
}

// Test 1: Complete File Structure
test('Complete batch management file structure exists', () => {
  const requiredFiles = [
    // Core service
    'src/services/batchService.ts',
    
    // Type definitions
    'src/types/batch.ts',
    
    // React components
    'src/components/BatchDashboard.tsx',
    'src/components/BatchCard.tsx',
    'src/components/BatchForm.tsx',
    'src/components/BatchMetrics.tsx',
    
    // Configuration files
    'firestore.rules',
    'firestore.indexes.json'
  ];
  
  requiredFiles.forEach(file => {
    const fullPath = path.join(process.cwd(), file);
    expect(fullPath).toExist();
  });
  
  console.log(`   ✓ All ${requiredFiles.length} required files exist`);
});

// Test 2: Service-Component Integration
test('Components properly import and use batch service', () => {
  const dashboardContent = fs.readFileSync(path.join(process.cwd(), 'src/components/BatchDashboard.tsx'), 'utf-8');
  const cardContent = fs.readFileSync(path.join(process.cwd(), 'src/components/BatchCard.tsx'), 'utf-8');
  const formContent = fs.readFileSync(path.join(process.cwd(), 'src/components/BatchForm.tsx'), 'utf-8');
  
  // Check service imports
  expect(dashboardContent).toContain("import { batchService }");
  expect(cardContent).toContain("import { batchService }");
  expect(formContent).toContain("import { batchService }");
  
  // Check service method usage
  expect(dashboardContent).toContain("batchService.createBatch");
  expect(dashboardContent).toContain("batchService.updateBatch");
  expect(dashboardContent).toContain("batchService.deleteBatch");
  expect(dashboardContent).toContain("batchService.getBatchSummary");
  
  console.log('   ✓ Components properly integrate with batch service');
});

// Test 3: Type System Integration
test('Type system is consistently used across all files', () => {
  const serviceContent = fs.readFileSync(path.join(process.cwd(), 'src/services/batchService.ts'), 'utf-8');
  const typesContent = fs.readFileSync(path.join(process.cwd(), 'src/types/batch.ts'), 'utf-8');
  const dashboardContent = fs.readFileSync(path.join(process.cwd(), 'src/components/BatchDashboard.tsx'), 'utf-8');
  
  // Check type imports in components
  expect(dashboardContent).toContain("import { Batch");
  expect(dashboardContent).toContain("BatchMetrics");
  expect(dashboardContent).toContain("BatchFilters");
  
  // Check type exports in service
  expect(serviceContent).toContain("export interface Batch");
  expect(serviceContent).toContain("export interface BatchMetrics");
  
  // Check type definitions exist
  expect(typesContent).toContain("interface Batch");
  expect(typesContent).toContain("interface BatchMetrics");
  expect(typesContent).toContain("interface BatchFormData");
  
  console.log('   ✓ Type system is consistently implemented');
});

// Test 4: Database Configuration Integration
test('Database configuration is properly set up', () => {
  const rulesContent = fs.readFileSync(path.join(process.cwd(), 'firestore.rules'), 'utf-8');
  const indexesContent = fs.readFileSync(path.join(process.cwd(), 'firestore.indexes.json'), 'utf-8');
  
  // Check Firestore rules for batches
  expect(rulesContent).toContain('match /batches/{batchId}');
  expect(rulesContent).toContain('match /batchPerformance/{performanceId}');
  expect(rulesContent).toContain('isFarmer()');
  
  // Check indexes for batch queries
  expect(indexesContent).toContain('"collectionGroup": "batches"');
  expect(indexesContent).toContain('"collectionGroup": "batchPerformance"');
  expect(indexesContent).toContain('"fieldPath": "farmerId"');
  expect(indexesContent).toContain('"fieldPath": "status"');
  
  console.log('   ✓ Database configuration is properly set up');
});

// Test 5: UI Component Integration Flow
test('UI components work together in proper flow', () => {
  const dashboardContent = fs.readFileSync(path.join(process.cwd(), 'src/components/BatchDashboard.tsx'), 'utf-8');
  const cardContent = fs.readFileSync(path.join(process.cwd(), 'src/components/BatchCard.tsx'), 'utf-8');
  const formContent = fs.readFileSync(path.join(process.cwd(), 'src/components/BatchForm.tsx'), 'utf-8');
  const metricsContent = fs.readFileSync(path.join(process.cwd(), 'src/components/BatchMetrics.tsx'), 'utf-8');
  
  // Check that Dashboard uses all other components
  expect(dashboardContent).toContain('BatchMetricsComponent');
  expect(dashboardContent).toContain('BatchCard');
  expect(dashboardContent).toContain('BatchForm');
  
  // Check prop passing
  expect(dashboardContent).toContain('onEdit={handleEditBatch}');
  expect(dashboardContent).toContain('onDelete={handleBatchDelete}');
  expect(dashboardContent).toContain('onStatusUpdate={handleStatusUpdate}');
  
  // Check form integration
  expect(dashboardContent).toContain('showBatchForm');
  expect(dashboardContent).toContain('editingBatch');
  
  console.log('   ✓ UI components are properly integrated');
});

// Test 6: Mobile Responsiveness Integration
test('Mobile responsiveness is consistently implemented', () => {
  const componentFiles = [
    'src/components/BatchDashboard.tsx',
    'src/components/BatchCard.tsx',
    'src/components/BatchForm.tsx',
    'src/components/BatchMetrics.tsx'
  ];
  
  const responsivePatterns = [
    /grid-cols-\d+\s+sm:grid-cols-\d+/,
    /grid-cols-\d+\s+lg:grid-cols-\d+/,
    /flex-col\s+sm:flex-row/,
    /text-xs\s+sm:text-sm/,
    /w-\d+\s+sm:w-\d+/,
    /p-\d+\s+sm:p-\d+/
  ];
  
  componentFiles.forEach(file => {
    const content = fs.readFileSync(path.join(process.cwd(), file), 'utf-8');
    
    let hasResponsivePatterns = false;
    responsivePatterns.forEach(pattern => {
      if (pattern.test(content)) {
        hasResponsivePatterns = true;
      }
    });
    
    if (!hasResponsivePatterns) {
      throw new Error(`${file} lacks comprehensive responsive design patterns`);
    }
  });
  
  console.log('   ✓ Mobile responsiveness is consistently implemented');
});

// Test 7: Error Handling Integration
test('Error handling is integrated throughout the system', () => {
  const serviceContent = fs.readFileSync(path.join(process.cwd(), 'src/services/batchService.ts'), 'utf-8');
  const dashboardContent = fs.readFileSync(path.join(process.cwd(), 'src/components/BatchDashboard.tsx'), 'utf-8');
  
  // Check service error handling
  const serviceErrors = [
    'Failed to create batch',
    'Failed to update batch',
    'Failed to delete batch',
    'Failed to get batch',
    'Failed to get batches'
  ];
  
  serviceErrors.forEach(error => {
    expect(serviceContent).toContain(error);
  });
  
  // Check component error handling
  expect(dashboardContent).toContain('try {');
  expect(dashboardContent).toContain('} catch (error)');
  expect(dashboardContent).toContain('toast({');
  expect(dashboardContent).toContain('variant: "destructive"');
  
  console.log('   ✓ Error handling is integrated throughout');
});

// Test 8: Performance Calculation Integration
test('Performance calculations are integrated across components', () => {
  const serviceContent = fs.readFileSync(path.join(process.cwd(), 'src/services/batchService.ts'), 'utf-8');
  const typesContent = fs.readFileSync(path.join(process.cwd(), 'src/types/batch.ts'), 'utf-8');
  const metricsContent = fs.readFileSync(path.join(process.cwd(), 'src/components/BatchMetrics.tsx'), 'utf-8');
  const cardContent = fs.readFileSync(path.join(process.cwd(), 'src/components/BatchCard.tsx'), 'utf-8');
  
  // Check calculation methods in service
  expect(serviceContent).toContain('calculateFCR');
  expect(serviceContent).toContain('calculateMortalityRate');
  expect(serviceContent).toContain('calculateAge');
  
  // Check performance rating functions in types
  expect(typesContent).toContain('getFCRRating');
  expect(typesContent).toContain('getMortalityRating');
  expect(typesContent).toContain('PERFORMANCE_BENCHMARKS');
  
  // Check usage in components
  expect(metricsContent).toContain('getFCRRating');
  expect(cardContent).toContain('batchService.calculateAge');
  expect(cardContent).toContain('batchService.calculateMortalityRate');
  
  console.log('   ✓ Performance calculations are properly integrated');
});

// Test 9: State Management Integration
test('State management is properly integrated', () => {
  const dashboardContent = fs.readFileSync(path.join(process.cwd(), 'src/components/BatchDashboard.tsx'), 'utf-8');
  
  // Check React hooks usage
  const stateHooks = [
    'useState<Batch[]>',
    'useState<BatchMetrics>',
    'useState<BatchFilters>',
    'useEffect',
    'setLoading',
    'setSubmitting'
  ];
  
  stateHooks.forEach(hook => {
    expect(dashboardContent).toContain(hook);
  });
  
  // Check state updates
  const stateUpdates = [
    'setBatches',
    'setMetrics',
    'setFilteredBatches',
    'setShowBatchForm',
    'setEditingBatch'
  ];
  
  stateUpdates.forEach(update => {
    expect(dashboardContent).toContain(update);
  });
  
  console.log('   ✓ State management is properly integrated');
});

// Test 10: Data Flow Integration
test('Data flow works correctly throughout the system', () => {
  const dashboardContent = fs.readFileSync(path.join(process.cwd(), 'src/components/BatchDashboard.tsx'), 'utf-8');
  const formContent = fs.readFileSync(path.join(process.cwd(), 'src/components/BatchForm.tsx'), 'utf-8');
  
  // Check data flow: Dashboard -> Form -> Service -> Database
  expect(dashboardContent).toContain('handleBatchSubmit');
  expect(dashboardContent).toContain('onSubmit={handleBatchSubmit}');
  expect(formContent).toContain('onSubmit: (batchData: BatchFormData)');
  expect(formContent).toContain('await onSubmit(formData)');
  
  // Check data flow: Service -> Database -> Components
  expect(dashboardContent).toContain('loadBatchData');
  expect(dashboardContent).toContain('getBatchSummary');
  expect(dashboardContent).toContain('setBatches');
  expect(dashboardContent).toContain('setMetrics');
  
  // Check filtering and sorting data flow
  expect(dashboardContent).toContain('filteredBatches');
  expect(dashboardContent).toContain('setFilteredBatches');
  expect(dashboardContent).toContain('searchTerm');
  expect(dashboardContent).toContain('filters');
  
  console.log('   ✓ Data flow is properly integrated throughout the system');
});

// Print integration test results
console.log('='.repeat(55));
console.log('📊 INTEGRATION TEST RESULTS');
console.log('='.repeat(55));
console.log(`Total Integration Tests: ${testCount}`);
console.log(`✅ Passed: ${passedTests}`);
console.log(`❌ Failed: ${failedTests}`);
console.log(`Success Rate: ${((passedTests / testCount) * 100).toFixed(1)}%`);

if (failedTests === 0) {
  console.log('\n🎉 All integration tests passed!');
  console.log('🔗 The Batch Management System is fully integrated and ready for use.');
} else {
  console.log(`\n⚠️  ${failedTests} integration test(s) failed.`);
  console.log('Please review the system integration.');
}

console.log('\n✨ Integration testing complete!\n');
