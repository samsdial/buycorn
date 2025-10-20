import { BuyButton } from '@/components/buy-corn/BuyButton';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-gradient-to-b from-yellow-50 to-white">
      <div className="max-w-2xl w-full space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-6xl font-bold text-yellow-600">Buy Corn</h1>
          <p className="text-xl text-gray-600">Buy fresh corn quickly and easily.</p>
        </div>
        <div className="bg-white rounded-2xl p-8 space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-gray-800">How it works?</h2>
            <p className="text-gray-600">You can buy in seconds</p>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <p className="text-3xl font-bold text-yellow-600">1</p>
              <p className="text-sm text-gray-600">Buy</p>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <p className="text-3xl font-bold text-yellow-600">60s</p>
              <p className="text-sm text-gray-600">Wait</p>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <p className="text-3xl font-bold text-yellow-600">Corn</p>
              <p className="text-sm text-gray-600">Fresh</p>
            </div>
          </div>
          <div className="grid grid-cols-1">
            <div className="pt-4">
              <BuyButton />
            </div>
          </div>
          <div className="w-full">
            <p className="text-center text-sm text-gray-500">Corn Purchasing system</p>
          </div>
        </div>
      </div>
    </main>
  );
}
