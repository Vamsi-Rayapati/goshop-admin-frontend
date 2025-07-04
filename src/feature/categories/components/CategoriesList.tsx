import { Button, PaginationProps, Popconfirm, Table, TableProps, Tag } from 'antd';
import moment from 'moment';
import { Category } from '../types';


const staticColumns: TableProps<Category>['columns'] = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      align:'center'
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
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
  categories: Category[];
  total: number;
  onDelete: (user: Category)=> void;
  onEdit: (user: Category)=> void;
  currentPage: number;
  setCurrentPage: PaginationProps['onChange'];
}

function CategoriesList({categories,loading,onDelete,onEdit, total, currentPage, setCurrentPage}: Props) {

  const columns: TableProps<Category>['columns'] = [
    ...staticColumns??[],
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => {
        const handleEdit = () => onEdit(record);
    const handleDelete = () => onDelete(record);
    return (
        <div>
            {/* <Button onClick={handleEdit} type={'link'}>Edit</Button> */}
            <Popconfirm
                title="Delete the category"
                description="Are you sure to delete this category?"
                onConfirm={handleDelete}
                okText="Yes"
                cancelText="No">
                <Button type={'link'} danger>Delete</Button>
            </Popconfirm>
        </div>
    )
      },
      align:'center'
    },
  ];


  return (
      <Table loading={loading} columns={columns} dataSource={categories} rowKey="id"  pagination={{ pageSize: 5 , total: total, onChange: setCurrentPage, current: currentPage }}  />
  )
}

export default CategoriesList;