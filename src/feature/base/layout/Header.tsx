import { Avatar, Button, Card, Popover, theme } from 'antd';
import Meta from 'antd/es/card/Meta';
import { Header } from 'antd/es/layout/layout';
import { handleLogout } from 'feature/auth/functions';
import { User } from 'feature/users/types';
import React from 'react'

interface IProps {
    user: User
}

function AppHeader({user}: IProps) {
    const {
        token: { colorBgContainer, borderRadiusLG },
      } = theme.useToken();
    return (
        <Header style={{ paddingRight: 5, background: colorBgContainer, display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
           
           <Popover content={
           
           <div style={{ display:'flex', flexDirection: 'column', gap: 20}}>
            <Card style={{width:250}}>
                <Meta
                    avatar={<Avatar style={{ backgroundColor: '#f56a00', cursor:'pointer' }} size={'large'}>{user.first_name?.[0] + user.last_name?.[0]}</Avatar>}
                    title={user.first_name + ' ' + user.last_name}
                    description={user.username}
                    />
                
            </Card>
            <Button onClick={handleLogout}>Logout</Button>
            </div>
            
            
            }>

           <Avatar style={{ backgroundColor: '#f56a00', cursor:'pointer' }} size={'large'}>{user.first_name?.[0] + user.last_name?.[0]}</Avatar>
           </Popover>
                

            
            {/*  */}
        </Header>
    )
}

export default AppHeader;