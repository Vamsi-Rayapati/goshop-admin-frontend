import { Form, Input, Modal, Select, Spin } from 'antd'
import React, { useEffect, useRef, useState } from 'react'
import { Category } from '../types';
import { DefaultOptionType } from 'antd/es/select';
import useFetch, { IResponse } from 'feature/base/hooks/useFetch';
import { CATEGORIES_API } from '../constants';


interface Props {
    userId?: string;
    onClose: ()=> void;
    onSubmit: (user: Partial<Category>) => void;
    submitResponse: IResponse<Category>
}


function CategoryForm({onClose,onSubmit, userId, submitResponse}:Props) {
    const title = userId ? 'Edit Category' : 'Add Category';
    const [changedFields, setChangedFields] = useState<Partial<Category>>({});
    const [getUserRes, getUserReq] = useFetch<Category>();
    const [form] = Form.useForm();

    const onValuesChange = (changedValues: Partial<Category>) => {
        setChangedFields((prev) => ({
          ...prev,
          ...changedValues,
        }));
    };

    useEffect(()=> {
        if(userId) {
            getUserReq({
                url: `${CATEGORIES_API}/${userId}`,
                method: 'GET'
            });
        }
        
    },[])


    useEffect(()=> {
        if(getUserRes.isSuccess) {
            form.setFieldsValue(getUserRes.data);
        }

    },[getUserRes])

    const onFinish = (values:Category) => {
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
                <Form.Item<Category>
                    label="Name"
                    name={'name'}
                    rules={[{ required: true, message: 'Please input your category name!' }]}
                    >
                    <Input />
                </Form.Item>
            </Form>
            </Spin>

        </Modal>
    )
}

export default CategoryForm