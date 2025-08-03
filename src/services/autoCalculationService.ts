import { 
  collection, 
  getDocs, 
  query, 
  where, 
  doc, 
  getDoc 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Product } from './dealerService';

// Auto-calculation service for order pricing
export interface ProductPriceInfo {
  productId: string;
  productName: string;
  pricePerUnit: number;
  unit: string;
  currentStock: number;
  category: string;
  dealerId: string;
}

export interface CalculatedOrderCost {
  baseAmount: number;
  taxAmount?: number;
  deliveryCharges?: number;
  totalAmount: number;
  breakdown: {
    unitPrice: number;
    quantity: number;
    subtotal: number;
  };
  productInfo: ProductPriceInfo;
}

/**
 * Get product price information for auto-calculation
 */
export const getProductPriceInfo = async (
  dealerId: string,
  productCategory: 'Feed' | 'Medicine' | 'Chicks',
  productName?: string
): Promise<ProductPriceInfo[]> => {
  try {
    let q = query(
      collection(db, 'dealerProducts'),
      where('dealerId', '==', dealerId),
      where('category', '==', productCategory)
    );

    // If specific product name is provided, try to match it
    if (productName) {
      q = query(
        collection(db, 'dealerProducts'),
        where('dealerId', '==', dealerId),
        where('category', '==', productCategory),
        where('productName', '>=', productName),
        where('productName', '<=', productName + '\uf8ff')
      );
    }

    const snapshot = await getDocs(q);
    const products: ProductPriceInfo[] = [];

    snapshot.forEach((doc) => {
      const data = doc.data() as Product;
      products.push({
        productId: doc.id,
        productName: data.productName,
        pricePerUnit: data.pricePerUnit,
        unit: data.unit,
        currentStock: data.currentStock,
        category: data.category,
        dealerId: data.dealerId
      });
    });

    // Sort by relevance (exact match first, then alphabetical)
    if (productName) {
      products.sort((a, b) => {
        const aExact = a.productName.toLowerCase() === productName.toLowerCase();
        const bExact = b.productName.toLowerCase() === productName.toLowerCase();
        if (aExact && !bExact) return -1;
        if (!aExact && bExact) return 1;
        return a.productName.localeCompare(b.productName);
      });
    }

    return products;
  } catch (error) {
    console.error('Error getting product price info:', error);
    throw error;
  }
};

/**
 * Auto-calculate order cost based on product prices and quantity
 */
export const calculateOrderCost = async (
  dealerId: string,
  orderType: 'Feed' | 'Medicine' | 'Chicks',
  quantity: number,
  unit: string,
  productName?: string
): Promise<CalculatedOrderCost | null> => {
  try {
    // Get available products for this category
    const products = await getProductPriceInfo(dealerId, orderType, productName);
    
    if (products.length === 0) {
      console.warn('No products found for auto-calculation');
      return null;
    }

    // Use the first/best matching product for calculation
    const selectedProduct = products[0];

    // Check if units match (basic validation)
    const unitsMatch = selectedProduct.unit.toLowerCase() === unit.toLowerCase() || 
                      (selectedProduct.unit === 'bags' && unit === 'bag') ||
                      (selectedProduct.unit === 'pieces' && unit === 'piece') ||
                      (selectedProduct.unit === 'bottles' && unit === 'bottle');

    if (!unitsMatch) {
      console.warn(`Unit mismatch: requested ${unit}, available ${selectedProduct.unit}`);
    }

    // Calculate costs
    const unitPrice = selectedProduct.pricePerUnit;
    const baseAmount = unitPrice * quantity;
    
    // Add delivery charges for bulk orders
    let deliveryCharges = 0;
    if (orderType === 'Feed' && quantity >= 10) {
      deliveryCharges = Math.min(baseAmount * 0.02, 500); // 2% or max ₹500
    } else if (quantity >= 5) {
      deliveryCharges = Math.min(baseAmount * 0.01, 200); // 1% or max ₹200
    }

    // Calculate tax (if applicable)
    const taxRate = orderType === 'Medicine' ? 0.12 : 0.05; // 12% for medicine, 5% for others
    const taxAmount = baseAmount * taxRate;

    const totalAmount = Math.round(baseAmount + taxAmount + deliveryCharges);

    return {
      baseAmount: Math.round(baseAmount),
      taxAmount: Math.round(taxAmount),
      deliveryCharges: Math.round(deliveryCharges),
      totalAmount,
      breakdown: {
        unitPrice,
        quantity,
        subtotal: Math.round(baseAmount)
      },
      productInfo: selectedProduct
    };

  } catch (error) {
    console.error('Error calculating order cost:', error);
    return null;
  }
};

/**
 * Get intelligent cost suggestion based on historical data and current prices
 */
export const getIntelligentCostSuggestion = async (
  dealerId: string,
  orderType: 'Feed' | 'Medicine' | 'Chicks',
  quantity: number,
  unit: string,
  farmerHistory?: any[]
): Promise<{
  suggestedCost: number;
  confidence: 'high' | 'medium' | 'low';
  reasoning: string;
  alternatives?: CalculatedOrderCost[];
}> => {
  try {
    // Get current market calculation
    const calculation = await calculateOrderCost(dealerId, orderType, quantity, unit);
    
    if (!calculation) {
      return {
        suggestedCost: quantity * getDefaultUnitPrice(orderType),
        confidence: 'low',
        reasoning: 'No product data found, using default pricing',
      };
    }

    // Check stock availability
    const stockAvailable = calculation.productInfo.currentStock >= quantity;
    let confidence: 'high' | 'medium' | 'low' = stockAvailable ? 'high' : 'medium';
    
    let reasoning = `Based on current price of ₹${calculation.breakdown.unitPrice}/${calculation.productInfo.unit}`;
    
    if (!stockAvailable) {
      reasoning += `. Limited stock (${calculation.productInfo.currentStock} available)`;
      confidence = 'medium';
    }

    // Get alternative products for comparison
    const allProducts = await getProductPriceInfo(dealerId, orderType);
    const alternatives: CalculatedOrderCost[] = [];
    
    for (const product of allProducts.slice(0, 3)) {
      if (product.productId !== calculation.productInfo.productId) {
        const altCalc = await calculateOrderCost(dealerId, orderType, quantity, unit, product.productName);
        if (altCalc) alternatives.push(altCalc);
      }
    }

    return {
      suggestedCost: calculation.totalAmount,
      confidence,
      reasoning,
      alternatives: alternatives.length > 0 ? alternatives : undefined
    };

  } catch (error) {
    console.error('Error getting intelligent cost suggestion:', error);
    return {
      suggestedCost: quantity * getDefaultUnitPrice(orderType),
      confidence: 'low',
      reasoning: 'Error calculating cost, using fallback pricing',
    };
  }
};

/**
 * Default unit prices for fallback calculation
 */
const getDefaultUnitPrice = (orderType: 'Feed' | 'Medicine' | 'Chicks'): number => {
  switch (orderType) {
    case 'Feed': return 1200; // ₹1200 per bag
    case 'Medicine': return 450; // ₹450 per bottle
    case 'Chicks': return 45; // ₹45 per piece
    default: return 1000;
  }
};

/**
 * Validate if calculated cost is reasonable
 */
export const validateCalculatedCost = (
  orderType: 'Feed' | 'Medicine' | 'Chicks',
  quantity: number,
  calculatedCost: number
): {
  isValid: boolean;
  warnings: string[];
  suggestions: string[];
} => {
  const warnings: string[] = [];
  const suggestions: string[] = [];
  
  const avgUnitPrice = calculatedCost / quantity;
  const defaultPrice = getDefaultUnitPrice(orderType);
  
  // Price validation
  if (avgUnitPrice < defaultPrice * 0.5) {
    warnings.push('Price seems unusually low');
    suggestions.push('Double-check product pricing');
  } else if (avgUnitPrice > defaultPrice * 2) {
    warnings.push('Price seems high compared to market average');
    suggestions.push('Consider bulk pricing or alternative products');
  }
  
  // Quantity validation
  if (quantity > 100 && orderType === 'Feed') {
    suggestions.push('Large order - consider delivery scheduling');
  }
  
  if (quantity > 1000 && orderType === 'Chicks') {
    suggestions.push('Large chick order - ensure proper handling arrangements');
  }
  
  return {
    isValid: warnings.length === 0,
    warnings,
    suggestions
  };
};

// Export the service object
export const autoCalculationService = {
  getProductPriceInfo,
  calculateOrderCost,
  getIntelligentCostSuggestion,
  validateCalculatedCost
};
