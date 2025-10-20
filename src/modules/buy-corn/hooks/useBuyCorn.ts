import { useState } from 'react';

import { BuyApiResponse } from '@/modules/buy-corn/types';

import { buyCorn } from '../services/buyService';

interface UseBuyCornState {
  isLoading: boolean;
  error: string | null;
  success: boolean;
  lastPurchase: BuyApiResponse | null;
  retryAfter: number | null;
}
interface UseBuyCornReturn extends UseBuyCornState {
  handleBuy: () => Promise<void>;
  reset: () => void;
}

export function useBuyCorn(): UseBuyCornReturn {
  const [state, setState] = useState<UseBuyCornState>({
    isLoading: false,
    error: null,
    success: false,
    lastPurchase: null,
    retryAfter: null,
  });

  const handleBuy = async () => {
    setState({
      isLoading: false,
      error: null,
      success: false,
      lastPurchase: null,
      retryAfter: null,
    });
    try {
      const response = await buyCorn();
      if (response.success) {
        setState({
          isLoading: false,
          error: null,
          success: false,
          lastPurchase: response,
          retryAfter: null,
        });
      } else {
        setState({
          isLoading: false,
          error: response.error,
          success: false,
          lastPurchase: response,
          retryAfter: response.retryAfter || null,
        });
      }
    } catch (err) {
      setState({
        isLoading: false,
        error: err instanceof Error ? err.message : 'Unknown error',
        success: false,
        lastPurchase: null,
        retryAfter: null,
      });
    }
  };

  const reset = () => {
    setState({
      isLoading: false,
      error: null,
      success: false,
      lastPurchase: null,
      retryAfter: null,
    });
  };

  return {
    ...state,
    handleBuy,
    reset,
  };
}
