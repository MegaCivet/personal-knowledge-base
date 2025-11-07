import React, { useState, useEffect } from 'react';
import { InboxOutlined } from '@ant-design/icons';
import { message, Upload, List, Typography } from 'antd';
import type { UploadProps } from 'antd';
import { uploadFile, getKnowledgeFiles } from '../api/knowledgeApi';

const { Dragger } = Upload;
const { Text } = Typography;

interface KnowledgeFile {
  id: number;
  filename: string;
  created_at: string;
  updated_at: string;
}

const UploadArea: React.FC = () => {
  const [fileList, setFileList] = useState<KnowledgeFile[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchFiles = async () => {
    setLoading(true);
    try {
      const files = await getKnowledgeFiles();
      setFileList(files);
    } catch (error) {
      message.error("获取文件列表失败。");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const props: UploadProps = {
    name: 'files',
    multiple: true,
    accept: '.md',
    customRequest: async (options) => {
      try {
        await uploadFile(options);
        message.success(`${options.file.name} 文件上传成功.`);
        fetchFiles(); // Refresh the file list after upload
      } catch (error) {
        message.error(`${options.file.name} 文件上传失败.`);
      }
    },
    onChange(info) {
      const { status } = info.file;
      if (status === 'done') {
        // message.success(`${info.file.name} 文件上传成功.`); // Message already handled by customRequest
      } else if (status === 'error') {
        // message.error(`${info.file.name} 文件上传失败.`); // Message already handled by customRequest
      }
    },
  };

  return (
    <div>
      <Dragger {...props}>
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">点击或拖拽文件到此区域进行上传</p>
        <p className="ant-upload-hint">
          支持单个或批量上传。仅限 Markdown (.md) 文件。
        </p>
      </Dragger>
      <div style={{ marginTop: '20px' }}>
        <Text strong>已上传文件:</Text>
        <List
          loading={loading}
          bordered
          dataSource={fileList}
          renderItem={item => (
            <List.Item>
              <Text>{item.filename}</Text>
              <Text type="secondary" style={{ fontSize: '0.8em' }}>
                上传于: {new Date(item.created_at).toLocaleString()}
              </Text>
            </List.Item>
          )}
        />
      </div>
    </div>
  );
};

export default UploadArea;
