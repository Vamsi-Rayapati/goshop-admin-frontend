import { Button, Card, Form, FormProps, Input } from 'antd'
import useFetch from 'feature/base/hooks/useFetch'
import { LOGIN_URL } from '../constants';
import { useNavigate } from 'react-router-dom';
import { ROUTE } from 'feature/base/router/constants';



function Login() {

    const [loginRes, loginReq]  = useFetch();

    const navigate = useNavigate();

    const onFinish: FormProps<SignupForm>['onFinish'] = async (values) => {
        const res = await loginReq({
            url: LOGIN_URL,
            method: 'POST',
            data: values
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
                disabled={loginRes.isLoading}
                layout={'vertical'}
                style={{ width: 300 }}
                initialValues={{ remember: true }}
                size={'large'}
                onFinish={onFinish}
                variant={'filled'}
                autoComplete="off">
                <Form.Item<SignupForm>
                    label="Email"
                    name="email"
                    rules={[
                        { type: 'email', message: 'The input is not valid E-mail!'},
                        { required: true, message: 'Please input your email!' }]}
                    >
                    <Input />
                </Form.Item>

                <Form.Item<SignupForm>
                    label="Password"
                    name="password"
                    rules={[{ required: true, message: 'Please input your password!' }]} >
                    <Input.Password />
                </Form.Item>

                <Form.Item className='self-center'>
                    <Button type="primary" htmlType="submit" loading={loginRes.isLoading}>
                        Login
                    </Button>
                </Form.Item>
                <div className='flex items-center self-center'>
                    <span>Not having account ?</span> 
                    <Button type={'link'} onClick={()=> navigate('/auth/signup')}>Signup</Button>
                </div>

                
            </Form>
            </Card>
        </div>
    )
}

export default Login