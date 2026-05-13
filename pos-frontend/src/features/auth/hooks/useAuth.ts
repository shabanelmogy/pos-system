import useUserStore from '../store/useUserStore';
import { UserRole } from '../../../shared/types';

const useAuth = () => {
    const { role, isAuth, name, id, branchId, posPermissions } = useUserStore();

    // Force role to lowercase to ensure consistency with our UserRole type
    const normalizedRole = (role ? role.toLowerCase() : '') as UserRole | '';

    return {
        isAuth,
        role: normalizedRole,
        name,
        id,
        branchId,
        posPermissions,

        isAdmin: normalizedRole === 'admin',
        isManager: normalizedRole === 'manager',
        isCashier: normalizedRole === 'cashier',
        isWaiter: normalizedRole === 'waiter',
        
        canManageOrders: (['admin', 'manager', 'cashier', 'waiter'] as UserRole[]).includes(normalizedRole as any),
        canCompleteOrders: (['admin', 'manager', 'cashier'] as UserRole[]).includes(normalizedRole as any),
        canAccessDashboard: (['admin', 'manager'] as UserRole[]).includes(normalizedRole as any),
        canManageSettings: normalizedRole === 'admin'
    };
};

export default useAuth;
