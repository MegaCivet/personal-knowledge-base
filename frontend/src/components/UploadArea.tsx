import React, { useState, useEffect, useMemo } from 'react';
import { 
  InboxOutlined, 
  FolderOpenOutlined, 
  FileTextOutlined, 
  CloudUploadOutlined, 
  SettingOutlined,
  EditOutlined,
  RightOutlined 
} from '@ant-design/icons';
import { 
  message, 
  Upload, 
  List, 
  Typography, 
  Select, 
  Collapse, 
  Tag, 
  Button, 
  Modal, 
  Form,
  Input,
  Card,
  Empty,
  Tooltip
} from 'antd';
import type { UploadProps, UploadFile } from 'antd';
import { 
    uploadFile, 
    getKnowledgeFiles, 
    getTags,
    updateFileTag
} from '../api/knowledgeApi';
import type { KnowledgeFile, TagItem } from '../types/api';
import TagManager from './TagManager'; // 引入标签管理组件

const { Dragger } = Upload;
const { Text } = Typography;

const UploadArea: React.FC = () => {
  // --- 状态定义 ---
  const [existingFiles, setExistingFiles] = useState<KnowledgeFile[]>([]);
  const [availableTags, setAvailableTags] = useState<TagItem[]>([]); // 可选标签列表
  const [loadingList, setLoadingList] = useState<boolean>(false);
  const [activeKeys, setActiveKeys] = useState<string[]>([]);
  
  // 上传 Modal 状态
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<UploadFile[]>([]);
  
  // 标签管理 Modal 状态
  const [isTagManagerOpen, setIsTagManagerOpen] = useState(false);

  // 修改文件标签 Modal 状态
  const [isEditTagModalOpen, setIsEditTagModalOpen] = useState(false);
  const [editingFile, setEditingFile] = useState<KnowledgeFile | null>(null);

  const [uploadForm] = Form.useForm();
  const [editTagForm] = Form.useForm();

  // --- 数据加载 ---
  const fetchFiles = async () => {
    setLoadingList(true);
    try {
      const files = await getKnowledgeFiles();
      setExistingFiles(files);
    } catch (error) {
      message.error("获取文件列表失败");
    } finally {
      setLoadingList(false);
    }
  };

  const fetchTags = async () => {
    try {
        const tags = await getTags();
        setAvailableTags(tags);
    } catch (error) {
        console.error("Failed to fetch tags", error);
    }
  };

  useEffect(() => {
    fetchFiles();
    fetchTags();
  }, []);

  // --- 分组逻辑 ---
  const groupedFiles = useMemo(() => {
    const groups: Record<string, KnowledgeFile[]> = {};
    // 默认先初始化已有的标签，确保即便是空标签也能显示分组（可选）
    availableTags.forEach(t => {
        if (!groups[t.name]) groups[t.name] = [];
    });
    if (!groups['未分类']) groups['未分类'] = [];

    existingFiles.forEach(file => {
      const tag = file.tag || '未分类';
      if (!groups[tag]) {
        groups[tag] = [];
      }
      groups[tag].push(file);
    });
    
    // 过滤掉没有文件的分组，如果想要显示空分组可以去掉这行
    const filteredGroups: Record<string, KnowledgeFile[]> = {};
    Object.keys(groups).forEach(key => {
        if (groups[key].length > 0) filteredGroups[key] = groups[key];
    });
    return filteredGroups;
  }, [existingFiles, availableTags]);

  useEffect(() => {
    if (activeKeys.length === 0) {
      const keys = Object.keys(groupedFiles);
      if (keys.length > 0) {
        setActiveKeys(keys);
      }
    }
  }, [groupedFiles]);

  // --- 动作处理 ---

  // 打开修改标签 Modal
  const handleEditFileTag = (file: KnowledgeFile) => {
      setEditingFile(file);
      // 设置表单初始值
      const initialTag = file.tag && availableTags.some(t => t.name === file.tag) ? file.tag : undefined;
      editTagForm.setFieldValue('tag', initialTag);
      setIsEditTagModalOpen(true);
  };

  // 提交修改文件标签
  const submitEditFileTag = async () => {
      if (!editingFile) return;
      try {
          const values = await editTagForm.validateFields();
          await updateFileTag(editingFile.id, values.tag);
          message.success("修改成功");
          setIsEditTagModalOpen(false);
          fetchFiles(); // 刷新列表
      } catch (error) {
          message.error("修改失败");
      }
  };

  // 提交上传
  const handleUploadSubmit = async () => {
    if (pendingFiles.length === 0) {
      message.warning('请至少选择一个文件！');
      return;
    }
    try {
      const values = await uploadForm.validateFields();
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
      setIsUploadModalOpen(false);
      await fetchFiles();
      setActiveKeys(prev => (prev.includes(tag) ? prev : [...prev, tag]));
    } catch (error) {
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
    beforeUpload: () => false,
    fileList: pendingFiles,
    multiple: true,
    accept: '.md',
    onChange: ({ fileList }) => { setPendingFiles(fileList); }
  };

  // --- 渲染 ---

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
          <List.Item 
            style={{ padding: '8px 12px', borderRadius: 8, transition: 'background 0.2s' }} 
            className="file-list-item"
            actions={[
                <Tooltip title="修改标签">
                    <Button 
                        type="text" 
                        size="small" 
                        icon={<EditOutlined />} 
                        onClick={() => handleEditFileTag(item)} 
                    />
                </Tooltip>
            ]}
          >
             <div style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', overflow: 'hidden' }}>
                <div style={{ padding: 6, background: '#f1f5f9', borderRadius: 6, color: '#64748b', flexShrink: 0 }}>
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

  // 标签选择器的 Options
  const tagOptions = availableTags.map(t => ({ label: t.name, value: t.name }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      
      {/* 顶部操作区 */}
      <div style={{ marginBottom: '24px', display: 'flex', gap: 12 }}>
        <Button 
          type="primary" 
          icon={<CloudUploadOutlined />} 
          onClick={() => {
              setIsUploadModalOpen(true);
              setPendingFiles([]);
              uploadForm.resetFields();
          }}
          size="large"
          style={{ flex: 1, boxShadow: '0 4px 14px 0 rgba(99, 102, 241, 0.39)' }}
        >
          上传文档
        </Button>
        <Tooltip title="管理标签">
            <Button 
                icon={<SettingOutlined />} 
                size="large" 
                onClick={() => setIsTagManagerOpen(true)}
            />
        </Tooltip>
      </div>

      {/* 列表区域 */}
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
             <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={<span style={{ color: '#94a3b8' }}>暂无文档</span>} />
        ) : (
          <Collapse 
                activeKey={activeKeys}
                onChange={(keys) => setActiveKeys(Array.isArray(keys) ? keys : [keys])}
                ghost 
                expandIcon={({ isActive }) => <RightOutlined rotate={isActive ? 90 : 0} style={{ fontSize: '12px', color: '#cbd5e1' }} />}
                items={collapseItems}
                style={{ background: 'transparent' }}
            />
        )}
      </div>

      {/* 1. 上传 Modal */}
      <Modal
        title={<div style={{ fontSize: '18px', fontWeight: 600 }}>上传文档</div>}
        open={isUploadModalOpen}
        onCancel={() => setIsUploadModalOpen(false)}
        width={500}
        footer={[
            <Button key="back" onClick={() => setIsUploadModalOpen(false)} disabled={uploading}>取消</Button>,
            <Button key="submit" type="primary" loading={uploading} onClick={handleUploadSubmit}>开始上传</Button>,
        ]}
        centered
      >
        <div style={{ marginTop: 24 }}>
            <Form form={uploadForm} layout="vertical" name="upload_form">
                <Form.Item
                    name="tag"
                    label={<span style={{ fontWeight: 500 }}>选择标签</span>}
                    rules={[{ required: true, message: '请选择一个标签' }]}
                >
                    <Select 
                        placeholder="请选择已有标签" 
                        size="large"
                        options={tagOptions}
                        showSearch
                        filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
                        notFoundContent={<Button type="link" size="small" onClick={() => setIsTagManagerOpen(true)}>去创建新标签</Button>}
                    />
                </Form.Item>

                <Form.Item label={<span style={{ fontWeight: 500 }}>选择文件</span>} required>
                    <Dragger {...uploadProps} style={{ borderRadius: 12, background: '#f8fafc', border: '2px dashed #e2e8f0' }}>
                        <p className="ant-upload-drag-icon"><InboxOutlined style={{ color: '#6366f1' }} /></p>
                        <p className="ant-upload-text" style={{ color: '#334155' }}>点击或拖拽文件到此处</p>
                    </Dragger>
                </Form.Item>
            </Form>
        </div>
      </Modal>

      {/* 2. 修改文件标签 Modal */}
      <Modal
        title="修改文档标签"
        open={isEditTagModalOpen}
        onCancel={() => setIsEditTagModalOpen(false)}
        onOk={submitEditFileTag}
        centered
        width={400}
      >
         <Form form={editTagForm} layout="vertical" style={{ marginTop: 20 }}>
            <Form.Item label="当前文件">
                <Input value={editingFile?.filename} disabled />
            </Form.Item>
            <Form.Item name="tag" label="新标签" rules={[{ required: true, message: '请选择标签' }]}>
                <Select 
                    placeholder="选择标签" 
                    options={tagOptions} 
                    showSearch
                />
            </Form.Item>
         </Form>
      </Modal>

      {/* 3. 标签管理组件 */}
      <TagManager 
        open={isTagManagerOpen} 
        onClose={() => setIsTagManagerOpen(false)} 
        onTagsChanged={fetchTags} 
      />

    </div>
  );
};

export default UploadArea;