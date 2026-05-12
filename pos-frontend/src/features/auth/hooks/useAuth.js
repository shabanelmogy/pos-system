import useUserStore from '../store/useUserStore';

const useAuth = () => {
    const { role, isAuth, name, id, branchId, posPermissions } = useUserStore();

    const normalizedRole = role ? role.toLowerCase() : '';

    return {
        isAuth,
        role,
        name,
        id,
        branchId,
        posPermissions,

        isAdmin: normalizedRole === 'admin',
        isManager: normalizedRole === 'manager',
        isCashier: normalizedRole === 'cashier',
        isWaiter: normalizedRole === 'waiter',
        
        canManageOrders: ['admin', 'manager', 'cashier', 'waiter'].includes(normalizedRole),
        canCompleteOrders: ['admin', 'manager', 'cashier'].includes(normalizedRole),
        canAccessDashboard: ['admin', 'manager'].includes(normalizedRole),
        canManageSettings: normalizedRole === 'admin'
    };
};

export default useAuth;
