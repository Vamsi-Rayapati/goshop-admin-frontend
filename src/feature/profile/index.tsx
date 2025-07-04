import { Avatar, Button, Card, Flex, Form, Input, Tag, Typography, Upload, UploadProps } from 'antd'

import useFetch from 'feature/base/hooks/useFetch';
import { ROLE_COLORS, USERS_API } from 'feature/users/constants';
import { User } from 'feature/users/types';
import React, { useEffect, useState } from 'react'
import { AVATAR_API } from './constants';
import apiService from 'feature/base/utils/ApiService';
import { UserOutlined, EditOutlined, HomeOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useForm } from 'antd/es/form/Form';
import UserForm from 'feature/users/components/UserForm';
const {Title, Text} =Typography
function Profile() {
  const [getUserRes, getUserReq] = useFetch<User>();
  const [form ] = useForm();
  const [uploadUrlRes, getUploadUrl] = useFetch<{upload_url: string, path: string}>();
  const [changedFields, setChangedFields] = useState<Partial<User>>({});
  const [patchUserRes, patchUserReq] = useFetch<User>();
  const [openDialog, setOpenDialog] = useState(false);
  const [saveAvatarRes, saveAvatarReq] = useFetch();

  const user = getUserRes.data;


  useEffect(()=> {

    getUserReq({
      url: USERS_API+'/me',
      method: 'GET'
    })
  },[])

  const props: UploadProps = {
    customRequest: async (options: any) => {
      const {  file, onSuccess, onError } = options;
      console.log("VRRR",file)

      getUploadUrl({
        url: AVATAR_API+"/upload_url",
        method:'POST',
        data: {
          file_name:file.name,
          content_type: file.type
        }
      })
      .then(async response=> {
        await axios({
          url: response.data.upload_url,
          method:'PUT',
          data: file,
          headers: {
            'Content-Type': file.type,
          },

        })
        saveAvatarReq({
          url: AVATAR_API+"/"+user.id,
          method:'POST',
          data: {
            avatar: response.data.path
          }

        })
      })
      .catch(err => {
        console.error(err)
      })

      
    },
    showUploadList: false,
    accept: 'image/*',
    maxCount: 1,
  };

  useEffect(()=> {
    if(getUserRes.isSuccess) {
        form.setFieldsValue(getUserRes.data);
    }

},[getUserRes])

const onValuesChange = (changedValues: Partial<User>) => {
  setChangedFields((prev) => ({
    ...prev,
    ...changedValues,
  }));
};

const onClose = () =>  {
  setOpenDialog(false);
}

const onFinish = (payload: any) => {
  patchUserReq({
    url: `${USERS_API}/${user.id}`,
    method: 'PATCH',
    data: payload
  })
  .then(()=> {
    onClose();
    getUserReq({
      url: USERS_API+'/me',
      method: 'GET'
    })}
  );
}

  return (
    <Card >
      <Flex gap={10}>
        <Upload  {...props}>
            <Avatar size={100}  src={user.avatar}  />
        </Upload>
        <Flex vertical style={{flex:1}}>
          <Flex gap={10} align={'center'}>
            <span style={{fontSize: 25, fontWeight: 'bold', lineHeight: 1}}>{user.full_name}</span>
            <Tag style={{alignSelf:'flex-start'}} color={ROLE_COLORS[user.role]}>{user.role}</Tag>
          </Flex>
          <span style={{color:'rgba(0, 0, 0, 0.45)', paddingLeft:2}}>{user.username}</span>
          
         
         {user.primary_address && <Flex gap={5}  style={{maxWidth: 300}}>
          <HomeOutlined color='rgba(0, 0, 0, 0.45)' style={{alignSelf:'flex-start', paddingTop: 4}}/>
          <span style={{color:'rgba(0, 0, 0, 0.45)'}}>{user.primary_address}</span>
          </Flex> }
        </Flex>
        <Button type={'primary'} onClick={()=> setOpenDialog(true)} icon={<EditOutlined/>}>Edit</Button>
      </Flex>
      
      {openDialog &&
          <UserForm
            userId={user?.id}
            submitResponse={patchUserRes }
            onSubmit={onFinish}
            onClose={onClose} />}

     
      
    </Card>
  )
}

export default Profile