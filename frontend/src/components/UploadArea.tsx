import React, { useState, useEffect, useMemo } from 'react';
import { 
  InboxOutlined, 
  FolderOutlined, 
  FileTextOutlined, 
  CloudUploadOutlined, 
  TagOutlined 
} from '@ant-design/icons';
import { 
  message, 
  Upload, 
  List, 
  Typography, 
  Input, 
  Collapse, 
  Tag, 
  Button, 
  Modal, 
  Form 
} from 'antd';
import type { UploadProps, UploadFile } from 'antd';
import { uploadFile, getKnowledgeFiles, type KnowledgeFile } from '../api/knowledgeApi';

const { Dragger } = Upload;
const { Text } = Typography;

const UploadArea: React.FC = () => {
  // --- 1. 主页面状态 ---
  const [existingFiles, setExistingFiles] = useState<KnowledgeFile[]>([]);
  const [loadingList, setLoadingList] = useState<boolean>(false);

  // --- 2. Modal 表单状态 ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<UploadFile[]>([]); // 暂存在 Modal 中的文件
  
  const [form] = Form.useForm();

  // --- 3. 获取文件列表 (保持不变) ---
  const fetchFiles = async () => {
    setLoadingList(true);
    try {
      const files = await getKnowledgeFiles();
      setExistingFiles(files);
    } catch (error) {
      message.error("获取文件列表失败。");
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  // --- 4. 数据处理：按标签分组 (保持不变) ---
  const groupedFiles = useMemo(() => {
    const groups: Record<string, KnowledgeFile[]> = {};
    existingFiles.forEach(file => {
      const tag = file.tag || '未分类';
      if (!groups[tag]) {
        groups[tag] = [];
      }
      groups[tag].push(file);
    });
    return groups;
  }, [existingFiles]);

  const collapseItems = Object.keys(groupedFiles).map(tag => ({
    key: tag,
    label: (
      <span>
        <FolderOutlined style={{ marginRight: 8, color: '#1890ff' }} />
        {tag} 
        <Tag style={{ marginLeft: 8, borderRadius: 10 }}>{groupedFiles[tag].length}</Tag>
      </span>
    ),
    children: (
      <List
        size="small"
        dataSource={groupedFiles[tag]}
        renderItem={item => (
          <List.Item>
             <List.Item.Meta
                avatar={<FileTextOutlined />}
                title={<Text style={{ fontSize: '0.9em' }}>{item.filename}</Text>}
                description={
                  <Text type="secondary" style={{ fontSize: '0.75em' }}>
                    {new Date(item.created_at).toLocaleString()}
                  </Text>
                }
             />
          </List.Item>
        )}
      />
    )
  }));

  // --- 5. Modal 操作逻辑 ---
  const showModal = () => {
    setIsModalOpen(true);
    setPendingFiles([]); // 重置文件列表
    form.resetFields();  // 重置表单
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  // 核心上传逻辑
  const handleUploadSubmit = async () => {
    if (pendingFiles.length === 0) {
      message.warning('请至少选择一个文件！');
      return;
    }

    try {
      // 1. 校验表单并获取标签
      const values = await form.validateFields();
      const tag = values.tag;

      setUploading(true);

      // 2. 构造上传 Promise 列表
      const uploadPromises = pendingFiles.map((file) => {
        return new Promise<void>((resolve, reject) => {
          // 注意：这里 file.originFileObj 才是原生的 File 对象
          const rawFile = file.originFileObj as File;
          
          uploadFile({
            file: rawFile,
            tag: tag,
            onSuccess: () => resolve(),
            onError: (err) => reject(err),
            // 这里暂不处理单个文件的进度，简化逻辑
            onProgress: () => {}, 
          });
        });
      });

      // 3. 并行执行上传
      await Promise.all(uploadPromises);

      message.success('文件上传成功！');
      setIsModalOpen(false);
      fetchFiles(); // 刷新列表
    } catch (error) {
      console.error("Upload error:", error);
      message.error('部分或全部文件上传失败，请重试。');
    } finally {
      setUploading(false);
    }
  };

  // Upload 组件配置：手动控制
  const uploadProps: UploadProps = {
    onRemove: (file) => {
      setPendingFiles((prev) => {
        const index = prev.indexOf(file);
        const newFileList = prev.slice();
        newFileList.splice(index, 1);
        return newFileList;
      });
    },
    beforeUpload: (file) => {
      // 返回 false 阻止自动上传，并添加到 pendingFiles
      // Antd 的 beforeUpload 参数是 RcFile，它继承自 File
      // 为了适配 Upload 组件的 fileList 属性，我们需要把它包装一下或者直接利用 Upload 的 onChange
      return false; 
    },
    fileList: pendingFiles,
    multiple: true,
    accept: '.md',
    onChange: ({ fileList }) => {
        // 更新文件列表状态，确保 UI 同步
        // 注意：因为我们阻止了自动上传，status 需要手动维护或忽略，这里主要为了让列表展示出来
        setPendingFiles(fileList); 
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      
      {/* 顶部操作区 */}
      <div style={{ marginBottom: '20px' }}>
        <Button 
          type="primary" 
          icon={<CloudUploadOutlined />} 
          onClick={showModal}
          block
          size="large"
        >
          上传新文档
        </Button>
      </div>

      {/* 文件列表展示区 */}
      <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
        <Text strong style={{ display: 'block', marginBottom: '10px' }}>
            知识库文档:
        </Text>
        
        {loadingList ? (
             <p style={{ textAlign: 'center', color: '#999', marginTop: '20px' }}>加载中...</p>
        ) : existingFiles.length === 0 ? (
             <p style={{ textAlign: 'center', color: '#999', marginTop: '20px' }}>暂无文件，请点击上方按钮上传</p>
        ) : (
            <Collapse 
                defaultActiveKey={Object.keys(groupedFiles)} 
                ghost 
                items={collapseItems}
            />
        )}
      </div>

      {/* 上传 Modal */}
      <Modal
        title="上传文档"
        open={isModalOpen}
        onCancel={handleCancel}
        footer={[
            <Button key="back" onClick={handleCancel} disabled={uploading}>
              取消
            </Button>,
            <Button 
              key="submit" 
              type="primary" 
              loading={uploading} 
              onClick={handleUploadSubmit}
            >
              {uploading ? '上传处理中...' : '开始上传'}
            </Button>,
        ]}
      >
        <Form
            form={form}
            layout="vertical"
            name="upload_form"
        >
            <Form.Item
                name="tag"
                label="文档标签"
                tooltip="标签用于对文档进行分类展示，例如：‘后端开发’、‘算法笔记’"
                rules={[{ required: true, message: '请填写文档标签' }]}
            >
                <Input 
                    prefix={<TagOutlined />} 
                    placeholder="请输入标签，例如：学习笔记" 
                    allowClear
                />
            </Form.Item>

            <Form.Item
                label="选择文件"
                required
                tooltip="支持 .md 格式的 Markdown 文件"
            >
                <Dragger {...uploadProps} style={{ maxHeight: '200px' }}>
                    <p className="ant-upload-drag-icon">
                        <InboxOutlined />
                    </p>
                    <p className="ant-upload-text">点击或拖拽文件到此区域</p>
                    <p className="ant-upload-hint">
                        支持批量上传
                    </p>
                </Dragger>
            </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default UploadArea;