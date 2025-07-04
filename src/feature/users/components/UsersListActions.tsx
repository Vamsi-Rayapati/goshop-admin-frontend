import { Button, Popconfirm } from 'antd'
import React from 'react'
import { User } from '../types';

interface Props {
    user: User;
    onDelete: (user: User)=> void;
    onEdit: (user: User)=> void;
}
function UsersListActions({onDelete,onEdit, user}: Props) {
    const handleEdit = () => onEdit(user);
    const handleDelete = () => onDelete(user);
    return (
        <div>
            <Button onClick={handleEdit} type={'link'}>Edit</Button>
            <Popconfirm
                title="Delete the user"
                description="Are you sure to delete this user?"
                onConfirm={handleDelete}
                okText="Yes"
                cancelText="No">
                <Button type={'link'} danger>Delete</Button>
            </Popconfirm>
        </div>
    )
}

export default UsersListActions