import { Button, message, Typography } from "antd";
import React, { useEffect, useState } from "react";
import CategoriesList from "./CategoriesList";
import useFetch from "feature/base/hooks/useFetch";
import { Category } from "../types";
import { CATEGORIES_API } from "../constants";
import CategoryForm from "./CategoryForm";

function Categories() {
	const [getCategoriesRes, getCategoriesReq] = useFetch<{
		categories: Category[];
		total: number;
	}>();

  const [postCategoryRes, postCategoryReq] = useFetch<Category>();
  const [patchCategoryRes, patchCategoryReq] = useFetch<Category>();
  const [deleteCategoryRes, deleteCategoryReq] = useFetch();
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category|null>();
	const [currentPage, setCurrentPage] = useState(1);
	const fetchCategories = () => {
		getCategoriesReq({
			url: CATEGORIES_API,
			method: "GET",
			params: {
				page_no: currentPage,
				page_size: 5,
			},
		});
	};

	useEffect(() => {
		fetchCategories();
	}, []);

	const onDelete = async(data: Category) => {
    const res = await deleteCategoryReq({
      url: `${CATEGORIES_API}/${data.id}`,
      method: 'DELETE'
    });

    if(res.isSuccess) handleSuccess('Category deleted sucessfully');
  }
	const onEdit = () => {};

	const onAddClick = () => setOpenDialog(true);

  const onClose = ()=> {
    setOpenDialog(false);
    setSelectedCategory(null);
  }

   const handleSuccess = (msg: string) => {
    message.success(msg);
    onClose();
    fetchCategories();
  }


  const onSubmit = async (data: Partial<Category>) => {
      if(selectedCategory) {
        const res = await patchCategoryReq({
          url: `${CATEGORIES_API}/${selectedCategory.id}`,
          method: 'PATCH',
          data: data
        });
        if(res.isSuccess) handleSuccess('Category updated sucessfully');
      } else {
        const res = await postCategoryReq({
          url: CATEGORIES_API,
          method: 'POST',
          data: data
        });
        if(res.isSuccess) handleSuccess('Category added sucessfully');
      }
  
      
    }
  

	return (
		<div>
			<div className="header flex justify-between items-center">
				<Typography.Title level={3}>Categories</Typography.Title>
				<Button type={"primary"} onClick={onAddClick}>
					Add Category
				</Button>
			</div>
			<CategoriesList
				loading={getCategoriesRes.isLoading}
				categories={getCategoriesRes.data.categories}
				total={getCategoriesRes.data.total}
				currentPage={currentPage}
				setCurrentPage={setCurrentPage}
				onDelete={onDelete}
				onEdit={onEdit}
			/>

      {openDialog &&
          <CategoryForm
            userId={selectedCategory?.id}
            submitResponse={selectedCategory?.id ? patchCategoryRes : postCategoryRes }
            onSubmit={onSubmit}
            onClose={onClose} />}
		</div>
	);
}

export default Categories;
