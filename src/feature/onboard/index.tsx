import { Button, Card, Form, FormProps, Input } from 'antd'
import useFetch from 'feature/base/hooks/useFetch'
import React from 'react'
import { useNavigate } from 'react-router-dom';
import { ROUTE } from 'feature/base/router/constants';
import { ONBOARD_URL } from './constants';

type OnboardForm = {
    first_name: string;
    last_name: string;
}

function Onboard() {

    const [signupRes, signupReq]  = useFetch();

    const navigate = useNavigate();

    const onFinish: FormProps<OnboardForm>['onFinish'] = async (values) => {
        const res = await signupReq({
            url: ONBOARD_URL,
            method: 'POST',
            data: values,
        });

        if(res.isSuccess) {
            navigate(ROUTE.CONSOLE);
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
            <Form.Item<OnboardForm>
            label="First Name"
            name="first_name"
            rules={[
                { required: true, message: 'Please input your First Name!' }]}
            >
            <Input  />
            </Form.Item>
            

            <Form.Item<OnboardForm>
            label="Last Name"
            name="last_name"
            rules={[{ required: true, message: 'Please input your Last Name!' }]}
            >
            <Input  />
            </Form.Item>

            <Form.Item className='self-center'>
            <Button type="primary" htmlType="submit" loading={signupRes.isLoading} >
                Finish
            </Button>
            </Form.Item>
            </Form>
            </Card>
        </div>
    )
}

export default Onboard