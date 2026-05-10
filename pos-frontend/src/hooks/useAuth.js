import { useSelector } from 'react-redux';

const useAuth = () => {
    const { role, isAuth, name, id, branchId, posPermissions } = useSelector((state) => state.user);

    return {
        isAuth,
        role,
        name,
        id,
        branchId,
        posPermissions,

        isAdmin: role === 'admin' || role === 'Admin',
        isManager: role === 'manager',
        isCashier: role === 'cashier' || role === 'Cashier',
        isWaiter: role === 'waiter' || role === 'Waiter',
        
        canManageOrders: ['admin', 'manager', 'cashier', 'waiter'].includes(role.toLowerCase()),
        canCompleteOrders: ['admin', 'manager', 'cashier'].includes(role.toLowerCase()),
        canAccessDashboard: ['admin', 'manager'].includes(role.toLowerCase()),
        canManageSettings: role.toLowerCase() === 'admin'
    };
};

export default useAuth;
