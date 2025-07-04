import { PaginationProps, Table, TableProps, Tag } from 'antd';
import { User, Role } from '../types';
import moment from 'moment';
import UsersListActions from './UsersListActions';
import { useState } from 'react';
import { ROLE_COLORS } from '../constants';


const staticColumns: TableProps<User>['columns'] = [
    {
      title: 'Name',
      dataIndex: 'full_name',
      key: 'full_name',
      align:'center'
    },
    {
      title: 'Email',
      dataIndex: 'username',
      key: 'username',
      align:'center'
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render(value: Role, record, index) {
        return <Tag color={ROLE_COLORS[value]}>{value.toUpperCase()}</Tag>
      },
      align:'center'
    },
    {
      title: 'Created At',
      dataIndex: 'created_at',
      key: 'created_at',
      render(value: string,record, index) {
        return <span>{moment.utc(value).local().format('DD MMM YYYY, hh:mm A')}</span>
      },
      align:'center'
    }
]

interface Props {
  loading: boolean;
  users: User[];
  total: number;
  onDelete: (user: User)=> void;
  onEdit: (user: User)=> void;
  currentPage: number;
  setCurrentPage: PaginationProps['onChange'];
}

function UsersList({users,loading,onDelete,onEdit, total, currentPage, setCurrentPage}: Props) {

  const columns: TableProps<User>['columns'] = [
    ...staticColumns??[],
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => <UsersListActions user={record} onDelete={onDelete} onEdit={onEdit}/>,
      align:'center'
    },
  ];


  return (
      <Table loading={loading} columns={columns} dataSource={users} rowKey="id"  pagination={{ pageSize: 5 , total: total, onChange: setCurrentPage, current: currentPage }}  />
  )
}

export default UsersList;