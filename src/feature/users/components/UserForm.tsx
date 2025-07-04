import { Form, Input, Modal, Select, Spin } from 'antd'
import React, { useEffect, useRef, useState } from 'react'
import { User } from '../types';
import { DefaultOptionType } from 'antd/es/select';
import useFetch, { IResponse } from 'feature/base/hooks/useFetch';
import { USERS_API } from '../constants';


interface Props {
    userId?: string;
    onClose: ()=> void;
    onSubmit: (user: Partial<User>) => void;
    submitResponse: IResponse<User>
}

const roleOptions: DefaultOptionType[] = [
    { label: 'User', value: 'USER'},
    { label: 'Admin', value:'ADMIN'},
    { label: 'Super Visor', value: 'SUPERVISOR'}
]


function UserForm({onClose,onSubmit, userId, submitResponse}:Props) {
    const title = userId ? 'Edit User' : 'Add User';
    const [changedFields, setChangedFields] = useState<Partial<User>>({});
    const [getUserRes, getUserReq] = useFetch<User>();
    const [form] = Form.useForm();

    const onValuesChange = (changedValues: Partial<User>) => {
        setChangedFields((prev) => ({
          ...prev,
          ...changedValues,
        }));
    };

    useEffect(()=> {
        if(userId) {
            getUserReq({
                url: `${USERS_API}/${userId}`,
                method: 'GET'
            });
        }
        
    },[])


    useEffect(()=> {
        if(getUserRes.isSuccess) {
            form.setFieldsValue(getUserRes.data);
        }

    },[getUserRes])

    const onFinish = (values:User) => {
        if(userId) onSubmit(changedFields);
        else onSubmit(values);
    }


    useEffect(()=> {
        if(submitResponse.isFailed && submitResponse.error) {
            const errors = submitResponse.error.details?.map((item) => ({
                name: item.field,
                errors: [item.message],
              }));
            if(errors?.length>0) {
                form.setFields(errors);
            }

        }
    },[submitResponse])

    console.log(changedFields);
    return (
        <Modal
            onClose={onClose}
            onCancel={onClose}
            open={true}
            title={title}
            okText={'Submit'}
            okButtonProps={{htmlType:'submit', form: 'user-form', loading: submitResponse.isLoading}}>
            <Spin spinning={getUserRes.isLoading}>
            <Form
                id='user-form'
                onValuesChange={onValuesChange}
                form={form}
                onFinish={onFinish}>
                <Form.Item<User>
                    label="First Name"
                    name={'first_name'}
                    rules={[{ required: true, message: 'Please input your first name!' }]}
                    >
                    <Input />
                </Form.Item>
                <Form.Item<User>
                    label="Last Name"
                    name={'last_name'}
                    rules={[{ required: true, message: 'Please input your last name!' }]}
                    >
                    <Input />
                </Form.Item>

                <Form.Item<User>
                    label="User Name"
                    name={'username'}
                    rules={[
                        { type: 'email', message: 'The input is not valid E-mail!'},
                        { required: true, message: 'Please input your E-mail!'},
                    ]}
                    >
                    <Input />
                </Form.Item>

                <Form.Item<User>
                    label="Address"
                    name={'primary_address'}
                    >
                    <Input.TextArea />
                </Form.Item>

                <Form.Item<User>
                    label="Role"
                    name={'role'}
                    rules={[{ required: true, message: 'Please select role!' }]}>
                    <Select options={roleOptions} />
                </Form.Item>

            </Form>
            </Spin>

        </Modal>
    )
}

export default UserForm