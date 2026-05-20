import { useQuery } from "@tanstack/react-query";
import { 
  getTables, getCategories, getItems, getBranches, getPOSPoints, getUsers,
  Table, Category, Item, Branch, POSPoint, User
} from "@/shared/api/services/dashboardApi";

export const useManagementQueries = () => {
  const { data: tables, isLoading: loadingTables, isError: errorTables, refetch: refetchTables } = useQuery({ 
    queryKey: ["tables"], 
    queryFn: async () => { const res = await getTables(); return res.data.data as Table[] || res.data as Table[]; } 
  });
  
  const { data: categories, isLoading: loadingCategories, isError: errorCategories, refetch: refetchCategories } = useQuery({ 
    queryKey: ["categories"], 
    queryFn: async () => { const res = await getCategories(); return res.data.data as Category[] || res.data as Category[]; } 
  });
  
  const { data: items, isLoading: loadingItems, isError: errorItems, refetch: refetchItems } = useQuery({ 
    queryKey: ["items"], 
    queryFn: async () => { const res = await getItems(); return res.data.data as Item[] || res.data as Item[]; } 
  });
  
  const { data: branches, isLoading: loadingBranches, isError: errorBranches, refetch: refetchBranches } = useQuery({ 
    queryKey: ["branches"], 
    queryFn: async () => { const res = await getBranches(); return res.data.data as Branch[] || res.data as Branch[]; } 
  });
  
  const { data: posPoints, isLoading: loadingPOSPoints, isError: errorPOSPoints, refetch: refetchPOSPoints } = useQuery({ 
    queryKey: ["posPoints"], 
    queryFn: async () => { const res = await getPOSPoints(); return res.data.data as POSPoint[] || res.data as POSPoint[]; } 
  });
  
  const { data: usersData, isLoading: loadingUsers, isError: errorUsers, refetch: refetchUsers } = useQuery({ 
    queryKey: ["users"], 
    queryFn: async () => { const res = await getUsers(); return res.data.data as User[] || res.data as User[]; } 
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
