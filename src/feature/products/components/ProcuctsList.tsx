import React, { useEffect, useState } from 'react'
import useFetch from 'feature/base/hooks/useFetch'
import { PRODUCTS_API } from '../constants';
import { Product } from '../types';
import Title from 'antd/es/typography/Title';
import { Button, message, Table, Card, Space, Tag, Typography, Modal } from 'antd';
import { useNavigate } from 'react-router-dom';
import { PlusOutlined, EditOutlined, DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons';

const { Text } = Typography;
const { confirm } = Modal;

function ProcuctsList() {
  const [productsRes, getProductsReq] = useFetch<{
    products: Product[];
    total: number;
  }>();
  const [deleteProductRes, deleteProductReq] = useFetch();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const onAddClick = () => {
    navigate('add')
  }

  const fetchProducts = (page: number = currentPage, size: number = pageSize) => {
    getProductsReq({
      url: PRODUCTS_API,
      method: 'GET',
      params: {
        page_no: page,
        page_size: size,
      },
    });
  }

  const handlePageChange = (page: number, size?: number) => {
    setCurrentPage(page);
    if (size && size !== pageSize) {
      setPageSize(size);
      fetchProducts(1, size);
      setCurrentPage(1);
    } else {
      fetchProducts(page, pageSize);
    }
  };

  const handleEdit = (product: Product) => {
    // TODO: Navigate to edit page
    navigate(`edit/${product.id}`);
  };

  const handleDelete = async (product: Product) => {
    confirm({
      title: 'Delete Product',
      icon: <ExclamationCircleOutlined />,
      content: `Are you sure you want to delete "${product.name}"? This action cannot be undone.`,
      okText: 'Yes, Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          const response = await deleteProductReq({
            url: `${PRODUCTS_API}/${product.id}`,
            method: 'DELETE'
          });
          
          if (response.isSuccess) {
            message.success(`Product "${product.name}" deleted successfully`);
            // Refresh the products list
            fetchProducts(currentPage, pageSize);
          }
        } catch (error) {
          console.error('Error deleting product:', error);
          // The useFetch hook already shows error messages via message.error
        }
      },
    });
  };

  const columns = [
    {
      title: 'Product Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => <Text strong>{text}</Text>,
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      width: 200,
      render: (text: string) => (
        <div 
          style={{ 
            maxWidth: 180, 
            maxHeight: 48,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            wordWrap: 'break-word'
          }}
          title={text}
        >
          <Text type="secondary">
            {text || 'No description'}
          </Text>
        </div>
      ),
    },
    {
      title: 'Category',
      dataIndex: 'category_id',
      key: 'category_id',
      render: (categoryId: number) => (
        <Tag color="blue">Category {categoryId}</Tag>
      ),
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      render: (price: number) => (
        <Text strong style={{ color: '#1890ff' }}>
          ${price?.toFixed(2)}
        </Text>
      ),
      sorter: (a: Product, b: Product) => a.price - b.price,
    },
    {
      title: 'Stock',
      dataIndex: 'stock',
      key: 'stock',
      render: (stock: number) => (
        <Tag color={stock > 10 ? 'green' : stock > 0 ? 'orange' : 'red'}>
          {stock} units
        </Tag>
      ),
      sorter: (a: Product, b: Product) => a.stock - b.stock,
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 150,
      render: (_: any, record: Product) => (
        <Space size="small">
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            size="small"
          >
            Edit
          </Button>
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
            loading={deleteProductRes.isLoading}
            size="small"
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <div className="p-6">
      <Card>
        <div className='flex justify-between items-center mb-6'>
          <Title level={3} className="mb-0">Products Management</Title>
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={onAddClick}
            size="large"
          >
            Add Product
          </Button>
        </div>
        
        <Table
          columns={columns}
          dataSource={productsRes.data?.products || []}
          loading={productsRes.isLoading}
          rowKey="id"
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: productsRes.data?.total || 0,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} of ${total} products`,
            pageSizeOptions: ['5', '10', '20', '50'],
            onChange: handlePageChange,
            onShowSizeChange: handlePageChange,
          }}
          scroll={{ x: 800 }}
          size="middle"
        />
      </Card>
    </div>
  )
}

export default ProcuctsList