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
      // --- 修改开始 ---
      // 安全地获取文件名
      const file = options.file;
      let fileName: string = '文件'; // 设置一个默认文件名

      if (file instanceof File) {
        // 如果是 File 对象，直接用 .name
        fileName = file.name;
      } else if (typeof (file as any)?.name === 'string') {
        // 兼容 antd 的 RcFile (它可能不是 File 的实例，但有 name 属性)
        fileName = (file as any).name;
      }
      // --- 修改结束 ---

      try {
        await uploadFile(options);
        // 使用我们安全获取的 fileName
        message.success(`${fileName} 文件上传成功.`);
        fetchFiles(); // Refresh the file list after upload
      } catch (error) {
        // 使用我们安全获取的 fileName
        message.error(`${fileName} 文件上传失败.`);
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
    // 隐藏 antd 自己的上传列表，因为我们有自定义的列表
    showUploadList: false,
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
