'use client';
import { useEffect, useState } from 'react';

import { Loader2 } from 'lucide-react';

import { useBuyCorn } from '@/modules/buy-corn/hooks/useBuyCorn';

import { Button } from '../ui/button';

export function BuyButton() {
  const { isLoading, error, success, retryAfter, handleBuy, reset } = useBuyCorn();
  const [countdown, setCountdown] = useState<number>(retryAfter || 0);
  const [isCountingDown, setIsCountingDown] = useState<boolean>(false);

  useEffect(() => {
    if (!retryAfter || retryAfter <= 0) {
      return;
    }
    setIsCountingDown(true);
    setCountdown(retryAfter);
  }, [retryAfter]);

  useEffect(() => {
    if (!isCountingDown || countdown <= 0) {
      if (countdown === 0 && isCountingDown) {
        setIsCountingDown(false);
      }
      return;
    }

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setIsCountingDown(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isCountingDown, countdown]);

  const handleReset = () => {
    reset();
    setCountdown(0);
    setIsCountingDown(false);
  };

  const isDisabled = isLoading || countdown > 0;
  const isBlocked = countdown > 0 && !isLoading;

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-md mx-auto">
      <Button
        onClick={handleBuy}
        disabled={isDisabled}
        size="lg"
        className="w-full text-lg font-semibold cursor-pointer"
        aria-busy={isLoading}
        aria-disabled={isDisabled}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" /> shopping ...
          </>
        ) : countdown > 0 ? (
          `Wait ${countdown} to buy again`
        ) : (
          `Buy Corn`
        )}
      </Button>
      {success && (
        <div className="w-full p-4 bg-green-50 border border-green-200 rounded-lg animate-in fade-in duration-300">
          <p className="text-green-800 font-medium text-center">¡Successful purchase!</p>
          <p className="text-green-600 text-sm text-center mt-1">
            Your corn has been processed correctly.
          </p>
          <Button
            variant="outline"
            onClick={handleReset}
            className="w-full cursor-pointer mt-2 text-sm text-green-700 underline hover:text-green-900"
          >
            Dimiss
          </Button>
        </div>
      )}
      {error && (
        <div className="w-full p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800 font-medium text-center">{error}</p>
          <p className="text-red-600 text-sm text-center mt-1">
            You can try again in {countdown} seconds.
          </p>
        </div>
      )}
      {error && !isBlocked && countdown === 0 && (
        <div className="w-full p-4 bg-red-50 border border-red-200 rounded-lg animate-in fade-in duration-300">
          <p className="text-red-800 font-medium text-center">{error}</p>
          <p className="text-red-600 text-sm text-center mt-1">
            You can try again in {countdown} seconds.
          </p>
          <Button
            variant="outline"
            onClick={handleReset}
            className="w-full cursor-pointer mt-2 text-sm text-red-700 underline hover:text-red-900"
          >
            Dimiss
          </Button>
        </div>
      )}
    </div>
  );
}
