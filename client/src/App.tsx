import React from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { SupermarketScene } from './components/3d/SupermarketScene';
import { CrosshairHUD } from './components/ui/CrosshairHUD';
import { TopNavigationHUD } from './components/ui/TopNavigationHUD';
import { Minimap } from './components/ui/Minimap';
import { CartDrawer } from './components/ui/CartDrawer';
import { ProductInspectModal } from './components/ui/ProductInspectModal';
import { SearchModal } from './components/ui/SearchModal';
import { ShoppingListModal } from './components/ui/ShoppingListModal';
import { CheckoutModal } from './components/ui/CheckoutModal';
import { PaymentModal } from './components/ui/PaymentModal';
import { OrderSuccessModal } from './components/ui/OrderSuccessModal';
import { SettingsModal } from './components/ui/SettingsModal';
import { MobileControls } from './components/ui/MobileControls';
import { ConvenienceCatalogModal } from './components/ui/ConvenienceCatalogModal';
import { OnboardingModal } from './components/ui/OnboardingModal';
import { ShoppingBag } from 'lucide-react';

const SupermarketApp: React.FC = () => {
  const { isLoading, products, isPaymentOpen, setIsPaymentOpen } = useStore();

  if (isLoading && products.length === 0) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-slate-950 text-white p-6">
        <div className="relative mb-6">
          <img
            src="/suprgo-logo-transparent.png"
            alt="SuprGo - Shop Smart Live Better"
            className="h-28 sm:h-36 w-auto object-contain animate-fade-in drop-shadow-2xl"
          />
        </div>
        <p className="text-xs text-cyan-400 mb-6 tracking-widest font-extrabold uppercase">
          Shop Smart • Live Better &bull; 3D Supermarket
        </p>
        <div className="w-56 h-2 rounded-full bg-slate-900 border border-white/10 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-emerald-500 via-cyan-400 to-blue-600 animate-pulse w-3/4 rounded-full" />
        </div>
      </div>
    );
  }

  return (
    <main className="relative w-full h-full overflow-hidden bg-slate-950">
      {/* 3D Supermarket Canvas */}
      <SupermarketScene />

      {/* Heads-up Displays & UI Overlays */}
      <TopNavigationHUD />
      <CrosshairHUD />
      <Minimap />
      <MobileControls />

      {/* Interactive Modals */}
      <CartDrawer />
      <ProductInspectModal />
      <SearchModal />
      <ShoppingListModal />
      <ConvenienceCatalogModal />
      <OnboardingModal />
      <CheckoutModal onOpenPayment={() => setIsPaymentOpen(true)} />
      <PaymentModal isOpen={isPaymentOpen} onClose={() => setIsPaymentOpen(false)} />
      <OrderSuccessModal />
      <SettingsModal />
    </main>
  );
};

export default function App() {
  return (
    <StoreProvider>
      <SupermarketApp />
    </StoreProvider>
  );
}
