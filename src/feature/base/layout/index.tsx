import { useEffect, useState } from 'react';
import type { MenuProps } from 'antd';
import { Layout, Menu, Spin, theme } from 'antd';
import { Outlet, useNavigate } from 'react-router-dom';
import { ROUTE } from '../router/constants';
import AppHeader from './Header';
import useFetch from '../hooks/useFetch';
import { User } from 'feature/users/types';
import { USERS_API } from 'feature/users/constants';
import { parseJWT } from 'feature/auth/functions';
import { items } from './constants';

const { Content, Footer, Sider } = Layout;



function MainLayout ()  {
  const [collapsed, setCollapsed] = useState(false);
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const [getUserRes, getUserReq] = useFetch<User>();


  useEffect(()=> {
    const user = parseJWT();
    getUserReq({
      url: `${USERS_API}/me`,
      method: 'GET',
    })
    .then(res=> {
      if(res.statusCode === 404) {
        navigate(ROUTE.ONBOARD)
      }
      // if(res.isSuccess) {
      //   navigate(ROUTE.USERS)
      // }
    })
  },[]);

  const navigate = useNavigate();

  const onClick: MenuProps['onClick'] = (e) => {
    console.log('click ', e);
    navigate(e.key)
    
  };
  useEffect(()=> {
    window.navigate = navigate;
  },[])

  if(getUserRes.isLoading) return (
    <div style={{height: '100vh', display:'flex', alignItems:'center', justifyContent:'center'}}>
      <Spin/>
    </div>
  )
  

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)}>
        <div className="demo-logo-vertical" />
        <Menu theme="dark" defaultSelectedKeys={['1']} onClick={onClick} mode="inline" items={items} />
      </Sider>
      <Layout>
       <AppHeader user={getUserRes.data}/>
        <Content style={{ margin: '16px 16px' }}>
          <Outlet/>
        </Content>
        <Footer style={{ textAlign: 'center' }}>
          Ant Design ©{new Date().getFullYear()} Created by Ant UED
        </Footer>
      </Layout>
    </Layout>
  );
};

export default MainLayout;