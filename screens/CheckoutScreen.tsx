import { useState, useEffect } from "react"
import { useSelector } from "react-redux";
import { useCart } from "@/contexts/CartContext";
import { UserState } from "@/store/user";

export const Checkout = () => {
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // User Info - redux store
    const { userInfo, authToken } = useSelector((state: {user: UserState}) => state.user);
    // Cart Item from Redux
    const { items } = useCart();

}