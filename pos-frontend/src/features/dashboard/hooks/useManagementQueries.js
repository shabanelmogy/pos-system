import { useQuery } from "@tanstack/react-query";
import { 
  getTables, getCategories, getItems, getBranches, getPOSPoints, getUsers 
} from "../api/dashboardApi";

export const useManagementQueries = () => {
  const { data: tables, isLoading: loadingTables, isError: errorTables, refetch: refetchTables } = useQuery({ 
    queryKey: ["tables"], 
    queryFn: async () => { const res = await getTables(); return res.data.data || res.data; } 
  });
  
  const { data: categories, isLoading: loadingCategories, isError: errorCategories, refetch: refetchCategories } = useQuery({ 
    queryKey: ["categories"], 
    queryFn: async () => { const res = await getCategories(); return res.data.data || res.data; } 
  });
  
  const { data: items, isLoading: loadingItems, isError: errorItems, refetch: refetchItems } = useQuery({ 
    queryKey: ["items"], 
    queryFn: async () => { const res = await getItems(); return res.data.data || res.data; } 
  });
  
  const { data: branches, isLoading: loadingBranches, isError: errorBranches, refetch: refetchBranches } = useQuery({ 
    queryKey: ["branches"], 
    queryFn: async () => { const res = await getBranches(); return res.data.data || res.data; } 
  });
  
  const { data: posPoints, isLoading: loadingPOSPoints, isError: errorPOSPoints, refetch: refetchPOSPoints } = useQuery({ 
    queryKey: ["posPoints"], 
    queryFn: async () => { const res = await getPOSPoints(); return res.data.data || res.data; } 
  });
  
  const { data: usersData, isLoading: loadingUsers, isError: errorUsers, refetch: refetchUsers } = useQuery({ 
    queryKey: ["users"], 
    queryFn: async () => { const res = await getUsers(); return res.data.data || res.data; } 
  });

  return {
    data: { tables, categories, items, branches, posPoints, usersData },
    status: { 
      loadingTables, loadingCategories, loadingItems, loadingBranches, loadingPOSPoints, loadingUsers,
      errorTables, errorCategories, errorItems, errorBranches, errorPOSPoints, errorUsers
    },
    refetch: { refetchTables, refetchCategories, refetchItems, refetchBranches, refetchPOSPoints, refetchUsers }
  };
};
