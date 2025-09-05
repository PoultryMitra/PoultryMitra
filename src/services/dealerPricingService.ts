import {
  collection,
  doc,
  setDoc,
  getDoc,
  onSnapshot,
  getDocs,
  query,
  where,
  Timestamp,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../lib/firebase';

export interface DealerProductPrice {
  id?: string;
  dealerId: string;
  productId: string;
  purchasePrice: number; // cost to dealer
  markupPercent?: number; // optional markup percent
  sellPrice: number; // computed or explicit
  margin?: number; // sellPrice - purchasePrice
  marginPercent?: number; // margin / purchasePrice * 100
  updatedAt?: Timestamp;
}

export function computeMargin(purchasePrice: number, sellPrice: number) {
  const margin = +(sellPrice - purchasePrice);
  const marginPercent = purchasePrice > 0 ? +((margin / purchasePrice) * 100).toFixed(2) : 0;
  return { margin, marginPercent };
}

export function computeSellFromMarkup(purchasePrice: number, markupPercent: number) {
  const sell = +(purchasePrice * (1 + markupPercent / 100));
  // Round to nearest rupee by default
  return Math.round(sell);
}

const COLLECTION = 'dealerProductPrices';

export async function setDealerProductPrice(dealerId: string, productId: string, data: {
  purchasePrice: number;
  markupPercent?: number;
  sellPrice?: number;
}) {
  try {
    const id = `${dealerId}_${productId}`;
    const docRef = doc(db, COLLECTION, id);

    const purchasePrice = data.purchasePrice;
    let sellPrice = data.sellPrice ?? null;

    if (sellPrice == null) {
      if (typeof data.markupPercent === 'number') {
        sellPrice = computeSellFromMarkup(purchasePrice, data.markupPercent);
      } else {
        throw new Error('Either sellPrice or markupPercent must be provided');
      }
    }

    const { margin, marginPercent } = computeMargin(purchasePrice, sellPrice);

    await setDoc(docRef, {
      dealerId,
      productId,
      purchasePrice,
      markupPercent: data.markupPercent ?? null,
      sellPrice,
      margin,
      marginPercent,
      updatedAt: serverTimestamp()
    }, { merge: true });
  } catch (err) {
    console.error('Error setting dealer product price:', err);
    throw err;
  }
}

export async function getDealerProductPriceOnce(dealerId: string, productId: string): Promise<DealerProductPrice | null> {
  try {
    const id = `${dealerId}_${productId}`;
    const docRef = doc(db, COLLECTION, id);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return null;
    return { id: snap.id, ...(snap.data() as any) } as DealerProductPrice;
  } catch (err) {
    console.error('Error fetching dealer product price:', err);
    throw err;
  }
}

export function subscribeDealerPrices(dealerId: string, callback: (prices: DealerProductPrice[]) => void) {
  const q = query(collection(db, COLLECTION), where('dealerId', '==', dealerId));
  const unsub = onSnapshot(q, (snap) => {
    const out: DealerProductPrice[] = [];
    snap.forEach(d => out.push({ id: d.id, ...(d.data() as any) } as DealerProductPrice));
    callback(out);
  });
  return unsub;
}

export async function listDealerPrices(dealerId: string): Promise<DealerProductPrice[]> {
  const q = query(collection(db, COLLECTION), where('dealerId', '==', dealerId));
  const snap = await getDocs(q);
  const out: DealerProductPrice[] = [];
  snap.forEach(d => out.push({ id: d.id, ...(d.data() as any) } as DealerProductPrice));
  return out;
}
