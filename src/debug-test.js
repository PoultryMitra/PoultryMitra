// Debug test to check dealerService exports
import * as dealerService from './services/dealerService.ts';

console.log('dealerService object:', dealerService);
console.log('Available functions:', Object.keys(dealerService));
console.log('getDealerRates function:', dealerService.getDealerRates);
console.log('Type of getDealerRates:', typeof dealerService.getDealerRates);
