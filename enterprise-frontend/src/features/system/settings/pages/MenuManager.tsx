import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { MdRestaurantMenu } from "react-icons/md";
import { getCategoryTree } from "@/shared/api/services/posApi";
import { CategoryTreeNode, MenuItem } from "@/shared/types";
import CategoryTreeView from "../components/CategoryTreeView";
import CategoryDetailsView from "../components/CategoryDetailsView";
import ItemDetailsView from "../components/ItemDetailsView";
import CategoryFormModal from "../components/CategoryFormModal";
import ItemFormModal from "../components/ItemFormModal";
import BackButton from "@/shared/components/BackButton";
import BottomNav from "@/shared/components/BottomNav";

interface MenuManagerProps {
  isEmbedded?: boolean;
}

const MenuManager: React.FC<MenuManagerProps> = ({ isEmbedded = false }) => {
  // Tree state
  const { data: tree = [], isLoading } = useQuery<CategoryTreeNode[]>({
    queryKey: ["category-tree"],
    queryFn: async () => {
      const res = await getCategoryTree();
      return res.data.data || res.data;
    },
  });

  const flattenTree = (nodes: CategoryTreeNode[]): CategoryTreeNode[] => {
    let result: CategoryTreeNode[] = [];
    for (const node of nodes) {
      result.push(node);
      result = result.concat(flattenTree(node.children));
    }
    return result;
  };
  const flatCategories = flattenTree(tree);
  const leafCategories = flatCategories.filter(c => c.children.length === 0);

  // Selected state
  const [selectedCategory, setSelectedCategory] = useState<CategoryTreeNode | null>(null);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);

  // Modal states
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);

  // Form states
  const [categoryToEdit, setCategoryToEdit] = useState<CategoryTreeNode | null>(null);
  const [parentForNewCategory, setParentForNewCategory] = useState<CategoryTreeNode | null>(null);
  const [itemToEdit, setItemToEdit] = useState<MenuItem | null>(null);

  // Handlers - Categories
  const handleAddRootCategory = () => {
    setCategoryToEdit(null);
    setParentForNewCategory(null);
    setIsCategoryModalOpen(true);
  };

  const handleAddSubcategory = (parent: CategoryTreeNode) => {
    setCategoryToEdit(null);
    setParentForNewCategory(parent);
    setIsCategoryModalOpen(true);
  };

  const handleEditCategory = (node: CategoryTreeNode) => {
    setCategoryToEdit(node);
    setParentForNewCategory(null);
    setIsCategoryModalOpen(true);
  };

  const handleSelectCategory = (node: CategoryTreeNode) => {
    setSelectedCategory(node);
    setSelectedItem(null); // Clear selected item to show category details view
  };

  const handleSelectItem = (item: MenuItem, categoryNode: CategoryTreeNode) => {
    setSelectedCategory(categoryNode);
    setSelectedItem(item);
  };

  // Handlers - Items
  const handleAddItem = () => {
    setItemToEdit(null);
    setIsItemModalOpen(true);
  };

  const handleEditItem = (item: MenuItem) => {
    setItemToEdit(item);
    setIsItemModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="bg-[var(--bg-main)] h-full flex items-center justify-center text-[var(--text-main)] font-black uppercase tracking-widest opacity-20">
        Loading Menu Structure...
      </div>
    );
  }

  const content = (
    <>
      <div className={`flex-1 overflow-hidden pb-10 flex flex-col lg:flex-row gap-6 md:gap-8 min-h-0 ${isEmbedded ? "" : "px-6 md:px-10"}`}>
        
        {/* Left: Tree View */}
        <div className="w-full lg:w-1/3 bg-[var(--bg-card)] rounded-3xl border border-[var(--border-main)] flex flex-col overflow-hidden max-h-[40vh] lg:max-h-full">
          <CategoryTreeView
            tree={tree}
            selectedCategoryId={selectedCategory?.id}
            selectedItemId={selectedItem?.id}
            onSelectCategory={handleSelectCategory}
            onSelectItem={handleSelectItem}
            onAddRoot={handleAddRootCategory}
            onAddChild={handleAddSubcategory}
            onEdit={handleEditCategory}
          />
        </div>

        {/* Right: Items List or Details View */}
        <div className="flex-1 bg-[var(--bg-card)] rounded-3xl border border-[var(--border-main)] overflow-hidden flex flex-col">
          {selectedItem && selectedCategory ? (
            <ItemDetailsView
              item={selectedItem}
              category={selectedCategory}
              onEdit={() => handleEditItem(selectedItem)}
              onClose={() => setSelectedItem(null)}
            />
          ) : selectedCategory ? (
            <CategoryDetailsView
              category={selectedCategory}
              allCategories={flatCategories}
              onEdit={() => handleEditCategory(selectedCategory)}
              onAddSubcategory={() => handleAddSubcategory(selectedCategory)}
              onAddItem={handleAddItem}
              onEditItem={handleEditItem}
              onSelectCategory={handleSelectCategory}
            />
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-10 opacity-40">
              <MdRestaurantMenu size={48} className="text-[var(--text-dim)] mb-4" />
              <h2 className="text-[var(--text-main)] text-xl font-black uppercase tracking-widest text-center">
                No Category Selected
              </h2>
              <p className="text-[var(--text-muted)] text-xs font-bold uppercase tracking-widest text-center mt-2">
                Select a category from the tree on the left
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <CategoryFormModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        editCategory={categoryToEdit}
        parentCategory={parentForNewCategory}
        allCategories={flatCategories}
      />

      <ItemFormModal
        isOpen={isItemModalOpen}
        onClose={() => setIsItemModalOpen(false)}
        editItem={itemToEdit}
        defaultCategoryId={selectedCategory?.id}
        leafCategories={leafCategories}
        onSuccess={(updatedItem) => {
          setSelectedItem(updatedItem);
        }}
      />
    </>
  );

  if (isEmbedded) {
    return (
      <div className="h-full flex flex-col overflow-hidden">
        {content}
      </div>
    );
  }

  return (
    <section className="bg-[var(--bg-main)] h-full overflow-hidden flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 md:px-10 py-6 md:py-8 flex-none">
        <div className="flex items-center gap-4">
          <BackButton />
          <div>
            <h1 className="text-[var(--text-main)] text-2xl font-black uppercase tracking-tighter">
              Menu Manager
            </h1>
            <p className="text-[var(--text-muted)] text-[10px] font-bold uppercase tracking-widest mt-1">
              Organize categories and items
            </p>
          </div>
        </div>
      </div>

      {content}

      <BottomNav />
    </section>
  );
};

export default MenuManager;
