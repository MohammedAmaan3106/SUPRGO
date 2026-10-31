import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { CheckSquare, Square, X, Plus, MapPin, CheckCircle2 } from 'lucide-react';

export const ShoppingListModal: React.FC = () => {
  const {
    isShoppingListOpen,
    setIsShoppingListOpen,
    shoppingList,
    toggleShoppingListItem,
    addShoppingListItem,
    products,
    setNavigationTarget
  } = useStore();

  const [newItemName, setNewItemName] = useState<string>('');

  if (!isShoppingListOpen) return null;

  const completedCount = shoppingList.filter((it) => it.checked).length;
  const progressPercent = shoppingList.length > 0 ? (completedCount / shoppingList.length) * 100 : 0;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newItemName.trim()) {
      addShoppingListItem(newItemName.trim());
      setNewItemName('');
    }
  };

  const handleLocate = (targetProdId?: string) => {
    if (!targetProdId) return;
    const prod = products.find((p) => p.id === targetProdId);
    if (prod) {
      setNavigationTarget({
        name: prod.name,
        position: prod.shelfPosition,
        aisle: prod.aisle
      });
      setIsShoppingListOpen(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in pointer-events-auto">
      <div className="w-full max-w-md glass-panel rounded-3xl border border-white/20 shadow-2xl overflow-hidden bg-slate-950/95 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <CheckSquare className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Smart Shopping List</h2>
              <p className="text-xs text-slate-400">
                {completedCount} of {shoppingList.length} items collected
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsShoppingListOpen(false)}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-5 pt-3 pb-1">
          <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-400 to-emerald-400 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Add item form */}
        <form onSubmit={handleAdd} className="p-4 border-b border-white/10 flex gap-2">
          <input
            type="text"
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            placeholder="Add grocery item (e.g. Olive Oil)..."
            className="flex-1 bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-cyan-400"
          />
          <button
            type="submit"
            className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add</span>
          </button>
        </form>

        {/* Item list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {shoppingList.map((item) => (
            <div
              key={item.id}
              className={`p-3 rounded-2xl flex items-center justify-between border transition-all ${
                item.checked
                  ? 'bg-slate-900/40 border-emerald-500/20 text-slate-400'
                  : 'bg-slate-900/80 border-white/10 text-white'
              }`}
            >
              <div
                onClick={() => toggleShoppingListItem(item.id)}
                className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer"
              >
                {item.checked ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                ) : (
                  <Square className="w-5 h-5 text-slate-400 shrink-0" />
                )}
                <div className="truncate">
                  <div
                    className={`text-xs font-semibold truncate ${
                      item.checked ? 'line-through text-slate-400' : 'text-white'
                    }`}
                  >
                    {item.name}
                  </div>
                  <div className="text-[10px] text-slate-500">{item.category}</div>
                </div>
              </div>

              {item.targetProductId && !item.checked && (
                <button
                  onClick={() => handleLocate(item.targetProductId)}
                  title="Guide me to this shelf on the floor"
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-400 transition-colors cursor-pointer shrink-0 ml-2"
                >
                  <MapPin className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

