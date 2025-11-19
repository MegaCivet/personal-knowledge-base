import React, { useState, useEffect, useMemo } from 'react';
import { 
  InboxOutlined, 
  FolderOpenOutlined, 
  FileTextOutlined, 
  CloudUploadOutlined, 
  TagOutlined,
  RightOutlined 
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
  Form,
  Card,
  Empty,
  Tooltip
} from 'antd';
import type { UploadProps, UploadFile } from 'antd';
import { uploadFile, getKnowledgeFiles, type KnowledgeFile } from '../api/knowledgeApi';

const { Dragger } = Upload;
const { Text } = Typography;

const UploadArea: React.FC = () => {
  // ... 逻辑状态保持不变 ...
  const [existingFiles, setExistingFiles] = useState<KnowledgeFile[]>([]);
  const [loadingList, setLoadingList] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<UploadFile[]>([]);
  const [form] = Form.useForm();

  // ... fetchFiles 逻辑保持不变 ...
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

  // ... 分组逻辑保持不变 ...
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

  // ... Modal 操作逻辑保持不变 ...
  const showModal = () => {
    setIsModalOpen(true);
    setPendingFiles([]);
    form.resetFields();
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  // ... 上传逻辑保持不变 ...
  const handleUploadSubmit = async () => {
    if (pendingFiles.length === 0) {
      message.warning('请至少选择一个文件！');
      return;
    }
    try {
      const values = await form.validateFields();
      const tag = values.tag;
      setUploading(true);
      const uploadPromises = pendingFiles.map((file) => {
        return new Promise<void>((resolve, reject) => {
          const rawFile = file.originFileObj as File;
          uploadFile({
            file: rawFile,
            tag: tag,
            onSuccess: () => resolve(),
            onError: (err) => reject(err),
            onProgress: () => {}, 
          });
        });
      });
      await Promise.all(uploadPromises);
      message.success('文件上传成功！');
      setIsModalOpen(false);
      fetchFiles();
    } catch (error) {
      console.error("Upload error:", error);
      message.error('部分或全部文件上传失败，请重试。');
    } finally {
      setUploading(false);
    }
  };

  const uploadProps: UploadProps = {
    onRemove: (file) => {
      setPendingFiles((prev) => {
        const index = prev.indexOf(file);
        const newFileList = prev.slice();
        newFileList.splice(index, 1);
        return newFileList;
      });
    },
    beforeUpload: (file) => { return false; },
    fileList: pendingFiles,
    multiple: true,
    accept: '.md',
    onChange: ({ fileList }) => { setPendingFiles(fileList); }
  };

  // --- UI 渲染优化 ---
  
  // 自定义 Collapse 渲染
  const collapseItems = Object.keys(groupedFiles).map(tag => ({
    key: tag,
    label: (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
        <span style={{ fontWeight: 500, color: '#334155' }}>
          <FolderOpenOutlined style={{ marginRight: 8, color: '#6366f1' }} />
          {tag}
        </span>
        <Tag color="indigo" style={{ borderRadius: 12, border: 'none', background: '#e0e7ff', color: '#4338ca' }}>
          {groupedFiles[tag].length}
        </Tag>
      </div>
    ),
    children: (
      <List
        size="small"
        dataSource={groupedFiles[tag]}
        split={false}
        renderItem={item => (
          <List.Item style={{ padding: '8px 12px', borderRadius: 8, cursor: 'default', transition: 'background 0.2s' }} className="file-list-item">
             <div style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%' }}>
                <div style={{ padding: 6, background: '#f1f5f9', borderRadius: 6, color: '#64748b' }}>
                    <FileTextOutlined />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '13px', fontWeight: 500, color: '#334155', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {item.filename}
                    </div>
                    <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                        {new Date(item.created_at).toLocaleDateString()}
                    </div>
                </div>
             </div>
          </List.Item>
        )}
      />
    )
  }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* 顶部操作按钮：更醒目 */}
      <div style={{ marginBottom: '24px' }}>
        <Button 
          type="primary" 
          icon={<CloudUploadOutlined />} 
          onClick={showModal}
          block
          size="large"
          style={{ 
            height: '48px', 
            fontSize: '16px', 
            fontWeight: 500,
            boxShadow: '0 4px 14px 0 rgba(99, 102, 241, 0.39)' 
          }}
        >
          上传新文档
        </Button>
      </div>

      {/* 列表区域：更整洁 */}
      <div style={{ flex: 1, overflowY: 'auto', minHeight: 0, paddingRight: 4 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <Text style={{ color: '#64748b', fontWeight: 600, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                知识库内容
            </Text>
            <Text style={{ color: '#94a3b8', fontSize: '12px' }}>{existingFiles.length} 个文件</Text>
        </div>
        
        {loadingList ? (
            <Card loading bordered={false} style={{ boxShadow: 'none', background: 'transparent' }} />
        ) : existingFiles.length === 0 ? (
             <Empty 
                image={Empty.PRESENTED_IMAGE_SIMPLE} 
                description={<span style={{ color: '#94a3b8' }}>暂无文档，快去上传吧</span>} 
             />
        ) : (
            <Collapse 
                defaultActiveKey={Object.keys(groupedFiles)} 
                ghost 
                expandIcon={({ isActive }) => <RightOutlined rotate={isActive ? 90 : 0} style={{ fontSize: '12px', color: '#cbd5e1' }} />}
                items={collapseItems}
                style={{ background: 'transparent' }}
            />
        )}
      </div>

      {/* Modal 样式优化 */}
      <Modal
        title={<div style={{ fontSize: '18px', fontWeight: 600 }}>上传文档</div>}
        open={isModalOpen}
        onCancel={handleCancel}
        width={500}
        footer={[
            <Button key="back" onClick={handleCancel} disabled={uploading} size="large" style={{ borderRadius: 8 }}>
              取消
            </Button>,
            <Button 
              key="submit" 
              type="primary" 
              loading={uploading} 
              onClick={handleUploadSubmit}
              size="large"
              style={{ borderRadius: 8, paddingLeft: 32, paddingRight: 32 }}
            >
              {uploading ? '处理中...' : '开始上传'}
            </Button>,
        ]}
        centered
      >
        <div style={{ marginTop: 24 }}>
            <Form form={form} layout="vertical" name="upload_form">
                <Form.Item
                    name="tag"
                    label={<span style={{ fontWeight: 500 }}>文档标签</span>}
                    rules={[{ required: true, message: '请填写文档标签' }]}
                >
                    <Input 
                        prefix={<TagOutlined style={{ color: '#94a3b8' }} />} 
                        placeholder="例如：项目需求、技术方案..." 
                        size="large"
                        allowClear
                    />
                </Form.Item>

                <Form.Item
                    label={<span style={{ fontWeight: 500 }}>选择文件</span>}
                    required
                    style={{ marginBottom: 0 }}
                >
                    <Dragger {...uploadProps} style={{ borderRadius: 12, background: '#f8fafc', border: '2px dashed #e2e8f0' }}>
                        <p className="ant-upload-drag-icon">
                            <InboxOutlined style={{ color: '#6366f1' }} />
                        </p>
                        <p className="ant-upload-text" style={{ color: '#334155' }}>点击或拖拽文件到此处</p>
                        <p className="ant-upload-hint" style={{ color: '#94a3b8' }}>
                            支持 Markdown (.md) 格式
                        </p>
                    </Dragger>
                </Form.Item>
            </Form>
        </div>
      </Modal>
    </div>
  );
};

export default UploadArea;