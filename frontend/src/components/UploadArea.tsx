import React from 'react';
import { InboxOutlined } from '@ant-design/icons';
import { message, Upload } from 'antd';

const { Dragger } = Upload;

const UploadArea: React.FC = () => {
  const props = {
    name: 'files',
    multiple: true,
    action: '/api/v1/knowledge/upload',
    accept: '.md',
    onChange(info: any) {
      const { status } = info.file;
      if (status !== 'uploading') {
        console.log(info.file, info.fileList);
      }
      if (status === 'done') {
        message.success(`${info.file.name} 文件上传成功.`);
      } else if (status === 'error') {
        message.error(`${info.file.name} 文件上传失败.`);
      }
    },
    onDrop(e: any) {
      console.log('Dropped files', e.dataTransfer.files);
    },
  };

  return (
    <Dragger {...props}>
      <p className="ant-upload-drag-icon">
        <InboxOutlined />
      </p>
      <p className="ant-upload-text">点击或拖拽文件到此区域进行上传</p>
      <p className="ant-upload-hint">
        支持单个或批量上传。仅限 Markdown (.md) 文件。
      </p>
    </Dragger>
  );
};

export default UploadArea;
