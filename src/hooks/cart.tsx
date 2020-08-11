import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const productsStorage = await AsyncStorage.getItem('@GoMarketplace/cart');

      if (productsStorage) {
        setProducts(JSON.parse(productsStorage));
      }
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async product => {
      const newCart = [...products, { ...product, quantity: 1 }];

      setProducts(newCart);
      await AsyncStorage.setItem(
        '@GoMarketplace/cart',
        JSON.stringify(newCart),
      );
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      if (products) {
        const newProducts = [...products];
        const productIndex = newProducts.findIndex(
          product => product.id === id,
        );
        newProducts[productIndex].quantity += 1;

        setProducts([...newProducts]);

        return AsyncStorage.setItem(
          '@GoMarketplace/cart',
          JSON.stringify([...newProducts]),
        );
      }

      return null;
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      if (products) {
        const newProducts = [...products];
        const productIndex = newProducts.findIndex(
          product => product.id === id,
        );

        if (newProducts[productIndex].quantity === 1) {
          newProducts.splice(productIndex, 1);
        } else {
          newProducts[productIndex].quantity -= 1;
        }

        setProducts([...newProducts]);

        return AsyncStorage.setItem(
          '@GoMarketplace/cart',
          JSON.stringify([...newProducts]),
        );
      }

      return null;
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
