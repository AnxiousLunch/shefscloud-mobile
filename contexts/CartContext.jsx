"use client"

import { createContext, useContext, useState } from "react"
import { CartItem, CartGroup,  CartContextType } from "@/types/types"

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }) {
  const [cart, setCart] = useState([])
  const [currentUserId, setCurrentUserId] = useState(null)

  const setUserId = (id) => {
    setCurrentUserId(id)
    // Optionally load persisted cart here
  }

  const addItem = (newItem, quantity = 1) => {
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
    chefId,
    delivery_date,
    delivery_slot,
    itemId
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
        .filter((g) => g !== null)
    })
  }

  const updateItem = (
    chefId,
    delivery_date,
    delivery_slot,
    itemId,
    changes
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

  const onOrderSubmit = (chefId, delivery_date, delivery_slot) => {
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
