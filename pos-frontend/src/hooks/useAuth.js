import { useSelector } from 'react-redux';

const useAuth = () => {
    const { role, isAuth, name, id } = useSelector((state) => state.user);

    return {
        isAuth,
        role,
        name,
        id,

        isAdmin: role === 'Admin',
        isCashier: role === 'Cashier',
        isWaiter: role === 'Waiter',
        // Combined roles
        canManageOrders: role === 'Admin' || role === 'Cashier' || role === 'Waiter',
        canCompleteOrders: role === 'Admin' || role === 'Cashier',
        canAccessDashboard: role === 'Admin' || role === 'Cashier',
        canManageSettings: role === 'Admin'
    };
};

export default useAuth;
