import { createContext, useContext, useEffect, useMemo, useState } from "react";

const CartContext = createContext(null);

const CART_STORAGE_KEY = "br30_kadaknath_cart";

const isProductAvailable = (product) => {
  return product?.isActive !== false && Number(product?.stock || 0) > 0;
};

const getMaxStock = (product) => {
  return Math.max(0, Number(product?.stock || 0));
};

const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);

      if (!savedCart) {
        return [];
      }

      const parsedCart = JSON.parse(savedCart);

      return Array.isArray(parsedCart) ? parsedCart : [];
    } catch (error) {
      console.error("Failed to load cart:", error);

      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
    } catch (error) {
      console.error("Failed to save cart:", error);
    }
  }, [cartItems]);

  const addToCart = (product, quantity = 1) => {
    if (!product) {
      return;
    }

    if (!isProductAvailable(product)) {
      return;
    }

    const productId = product.id || product.slug;

    if (!productId) {
      console.error("Product must have an id or slug.");
      return;
    }

    const maxStock = getMaxStock(product);
    const requestedQuantity = Math.max(1, Number(quantity) || 1);

    setCartItems((currentItems) => {
      const existingItem = currentItems.find((item) => item.id === productId || (item.slug && item.slug === product.slug));

      if (existingItem) {
        const currentQuantity = Number(existingItem.quantity || 0);
        const nextQuantity = Math.min(currentQuantity + requestedQuantity, maxStock);

        return currentItems.map((item) =>
          item.id === existingItem.id
            ? {
                ...item,
                ...product,
                id: productId,
                quantity: nextQuantity,
              }
            : item
        );
      }

      const nextQuantity = Math.min(requestedQuantity, maxStock);

      return [
        ...currentItems,
        {
          ...product,
          id: productId,
          quantity: nextQuantity,
        },
      ];
    });
  };

  const updateQuantity = (productId, quantity) => {
    const nextQuantity = Number(quantity);

    if (!Number.isFinite(nextQuantity)) {
      return;
    }

    if (nextQuantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCartItems((currentItems) =>
      currentItems.map((item) => {
        if (item.id !== productId) {
          return item;
        }

        const maxStock = getMaxStock(item);
        const safeQuantity = Math.min(nextQuantity, maxStock);

        return {
          ...item,
          quantity: safeQuantity,
        };
      })
    );
  };

  const increaseQuantity = (productId) => {
    setCartItems((currentItems) =>
      currentItems.map((item) => {
        if (item.id !== productId) {
          return item;
        }

        const maxStock = getMaxStock(item);
        const currentQuantity = Number(item.quantity || 0);

        if (currentQuantity >= maxStock) {
          return item;
        }

        return {
          ...item,
          quantity: Math.min(currentQuantity + 1, maxStock),
        };
      })
    );
  };

  const decreaseQuantity = (productId) => {
    setCartItems((currentItems) =>
      currentItems
        .map((item) =>
          item.id === productId
            ? {
                ...item,
                quantity: Number(item.quantity || 0) - 1,
              }
            : item
        )
        .filter((item) => Number(item.quantity || 0) > 0)
    );
  };

  const removeFromCart = (productId) => {
    setCartItems((currentItems) => currentItems.filter((item) => item.id !== productId));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const cartCount = useMemo(() => {
    return cartItems.reduce((total, item) => total + Number(item.quantity || 0), 0);
  }, [cartItems]);

  const subtotal = useMemo(() => {
    return cartItems.reduce((total, item) => total + Number(item.price || 0) * Number(item.quantity || 0), 0);
  }, [cartItems]);

  const deliveryCharge = subtotal > 0 ? 0 : 0;

  const total = subtotal + deliveryCharge;

  const value = {
    cartItems,
    cartCount,
    subtotal,
    deliveryCharge,
    total,

    addToCart,
    updateQuantity,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
    clearCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used inside CartProvider.");
  }

  return context;
};

export default CartProvider;
