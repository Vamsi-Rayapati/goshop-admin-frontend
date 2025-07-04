import { Button, Card, Form, FormProps, Input } from 'antd'
import useFetch from 'feature/base/hooks/useFetch'
import React from 'react'
import { SIGNUP_URL } from '../constants';
import { useNavigate } from 'react-router-dom';
import { ROUTE } from 'feature/base/router/constants';



function Signup() {

    const [signupRes, signupReq]  = useFetch();

    const navigate = useNavigate();

    const onFinish: FormProps<SignupForm>['onFinish'] = async (values) => {
        const res = await signupReq({
            url: SIGNUP_URL,
            method: 'POST',
            data: values,
        });

        if(res.isSuccess) {
            navigate(ROUTE.ONBOARD);
        }

    }
    return (
        <div style={{height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <Card>
            <Form
                name="basic"
                className='flex flex-col'
                disabled={signupRes.isLoading}
                layout={'vertical'}
                // labelCol={{ span: 8 }}
                style={{ width: 300 }}
                initialValues={{ remember: true }}
                onFinish={onFinish}
                variant={'filled'}
                size={'large'}
                autoComplete="off"
            >
            <Form.Item<SignupForm>
            label="Email"
            name="email"
            rules={[
                { type: 'email', message: 'The input is not valid E-mail!'},
                { required: true, message: 'Please input your email!' }]}
            >
            <Input  />
            </Form.Item>
            

            <Form.Item<SignupForm>
            label="Password"
            name="password"
            rules={[{ required: true, message: 'Please input your password!' }]}
            >
            <Input.Password  />
            </Form.Item>

            <Form.Item className='self-center'>
            <Button type="primary" htmlType="submit" loading={signupRes.isLoading} >
                Create Account
            </Button>
            </Form.Item>
            <div className='flex items-center self-center'>
                    <span>Already having account ?</span> 
                    <Button type={'link'} onClick={()=> navigate('/auth/login')}>Login</Button>
            </div>
            </Form>
            </Card>
        </div>
    )
}

export default Signup