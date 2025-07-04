import Orders from "feature/orders";
import Users from "feature/users";
import MainLayout from "feature/base/layout";
import { createBrowserRouter, Navigate } from "react-router-dom";
import Login from "feature/auth/login";
import Signup from "feature/auth/signup";
import { ROUTE } from "./constants";
import Products from "feature/products/components/Products";
import Onboard from "feature/onboard";
import Profile from "feature/profile";
import AddProduct from "feature/products/components/AddProduct";
import EditProduct from "feature/products/components/EditProduct";
import ProcuctsList from "feature/products/components/ProcuctsList";
import Categories from "feature/categories/components/Categories";

const router = createBrowserRouter([
    {
      path: '/',
      element:  <Navigate to={localStorage.getItem('token') ? '/console' : ROUTE.LOGIN}/> 
    },
    {
      path: ROUTE.CONSOLE,
      element: <MainLayout/>,
      children: [
        {
            path: ROUTE.USERS,
            element: <Users/>
        },
        {
          path: ROUTE.PROFILE,
          element: <Profile/>
        },
        {
          path: ROUTE.ORDERS,
          element: <Orders/>
        },
        {
          path: ROUTE.CATEGORIES,
          element: <Categories/>
        },
        {
          path: ROUTE.PRODUCTS,
          element: <Products/>,
          children:[
            {
              path: '',
              element: <ProcuctsList/>
            },
            {
              path: 'add',
              element: <AddProduct/>
            },
            {
              path: "edit/:id",
              element: <EditProduct/>
            }

          ]
        }
      ]
    },
    { path: ROUTE.LOGIN, element: <Login/>},
    { path: ROUTE.SIGNUP, element: <Signup/>},
    {
      path: ROUTE.ONBOARD,
      element: <Onboard/>
    },
    
]);

export default router;