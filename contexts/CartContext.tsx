// "use client"

// import { createContext, useContext, useState, type ReactNode } from "react"

// interface CartItem {
//   id: string,
//   name: string
//   price: number
//   quantity: number
//   chef: string
//   image: string
// }

// interface CartContextType {
//   items: CartItem[]
//   addItem: (item: Omit<CartItem, "quantity">) => void
//   removeItem: (id: string) => void
//   updateQuantity: (id: string, quantity: number) => void
//   clearCart: () => void
//   getTotalPrice: () => number
//   getItemCount: () => number
// }

// const CartContext = createContext<CartContextType | undefined>(undefined)

// export function CartProvider({ children }: { children: ReactNode }) {
//   const [items, setItems] = useState<CartItem[]>([])

//   const addItem = (newItem: Omit<CartItem, "quantity">) => {
//     setItems((prevItems) => {
//       const existingItem = prevItems.find((item) => item.id === newItem.id)
//       if (existingItem) {
//         return prevItems.map((item) => (item.id === newItem.id ? { ...item, quantity: item.quantity + 1 } : item))
//       }
//       return [...prevItems, { ...newItem, quantity: 1 }]
//     })
//   }

//   const removeItem = (id: string) => {
//     setItems((prevItems) => prevItems.filter((item) => item.id !== id))
//   }

//   const updateQuantity = (id: string, quantity: number) => {
//     if (quantity <= 0) {
//       removeItem(id)
//       return
//     }
//     setItems((prevItems) => prevItems.map((item) => (item.id === id ? { ...item, quantity } : item)))
//   }

//   const clearCart = () => {
//     setItems([])
//   }

//   const getTotalPrice = () => {
//     return items.reduce((total, item) => total + item.price * item.quantity, 0)
//   }

//   const getItemCount = () => {
//     return items.reduce((total, item) => total + item.quantity, 0)
//   }

//   return (
//     <CartContext.Provider
//       value={{
//         items,
//         addItem,
//         removeItem,
//         updateQuantity,
//         clearCart,
//         getTotalPrice,
//         getItemCount,
//       }}
//     >
//       {children}
//     </CartContext.Provider>
//   )
// }

// export function useCart() {
//   const context = useContext(CartContext)
//   if (context === undefined) {
//     throw new Error("useCart must be used within a CartProvider")
//   }
//   return context
// }


"use client"

import { createContext, useContext, useState, type ReactNode } from "react"
import { CartItem, CartGroup,  CartContextType } from "@/types/types"

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartGroup[]>([])
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  const setUserId = (id: string | null) => {
    setCurrentUserId(id)
    // Optionally load persisted cart here
  }

  const addItem = (newItem: Omit<CartItem, "quantity">, quantity: number = 1) => {
    setCart((prevCart) => {
      const chefGroupIndex = prevCart.findIndex(
        (group) =>
          group.chefId === newItem.chefId &&
          group.delivery_date === newItem.delivery_date &&
          group.delivery_slot === newItem.delivery_slot
      )

      if (chefGroupIndex !== -1) {
        const group = prevCart[chefGroupIndex]
        const itemIndex = group.menu.findIndex((item) => item.id === newItem.id)

        if (itemIndex !== -1) {
          // Update quantity
          group.menu[itemIndex].quantity += quantity
        } else {
          // Add new item
          group.menu.push({ ...newItem, quantity })
        }

        const updatedCart = [...prevCart]
        updatedCart[chefGroupIndex] = { ...group }
        return updatedCart
      } else {
        // Add new chef group
        return [
          ...prevCart,
          {
            chefId: newItem.chefId,
            delivery_date: newItem.delivery_date,
            delivery_slot: newItem.delivery_slot,
            menu: [{ ...newItem, quantity }],
          },
        ]
      }
    })
  }

  const removeItem = (
    chefId: string,
    delivery_date: string,
    delivery_slot: string,
    itemId: string
  ) => {
    setCart((prevCart) => {
      return prevCart
        .map((group) => {
          if (
            group.chefId === chefId &&
            group.delivery_date === delivery_date &&
            group.delivery_slot === delivery_slot
          ) {
            const updatedMenu = group.menu.filter((item) => item.id !== itemId)
            return updatedMenu.length > 0
              ? { ...group, menu: updatedMenu }
              : null // remove group if empty
          }
          return group
        })
        .filter((g): g is CartGroup => g !== null)
    })
  }

  const updateItem = (
    chefId: string,
    delivery_date: string,
    delivery_slot: string,
    itemId: string,
    changes: Partial<CartItem>
  ) => {
    setCart((prevCart) =>
      prevCart.map((group) => {
        if (
          group.chefId === chefId &&
          group.delivery_date === delivery_date &&
          group.delivery_slot === delivery_slot
        ) {
          const updatedMenu = group.menu.map((item) =>
            item.id === itemId ? { ...item, ...changes } : item
          )
          return { ...group, menu: updatedMenu }
        }
        return group
      })
    )
  }

  const onOrderSubmit = (chefId: string, delivery_date: string, delivery_slot: string) => {
    setCart((prevCart) =>
      prevCart.filter(
        (group) =>
          !(
            group.chefId === chefId &&
            group.delivery_date === delivery_date &&
            group.delivery_slot === delivery_slot
          )
      )
    )
  }

  const clearCart = () => {
    setCart([])
  }

  const getTotalPrice = () =>
    cart.reduce(
      (total, group) =>
        total +
        group.menu.reduce((sum, item) => sum + item.price * item.quantity, 0),
      0
    )

  const getItemCount = () =>
    cart.reduce(
      (count, group) => count + group.menu.reduce((sum, item) => sum + item.quantity, 0),
      0
    )

  return (
    <CartContext.Provider
      value={{
        cart,
        currentUserId,
        setUserId,
        addItem,
        removeItem,
        updateItem,
        onOrderSubmit,
        clearCart,
        getTotalPrice,
        getItemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
