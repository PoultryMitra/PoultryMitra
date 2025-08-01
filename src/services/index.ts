// Re-export all functions from dealerService
export * from './dealerService';

// Explicit re-exports for the problematic functions
export {
  addProduct,
  updateProduct,
  getDealerProfile,
  createOrUpdateDealerProfile,
  getDealerFarmers,
  getDealerProducts,
  createInvitationCode,
  loadDemoData
} from './dealerService';
