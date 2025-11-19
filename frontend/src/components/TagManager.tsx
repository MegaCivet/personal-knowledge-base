import React, { useState, useEffect } from 'react';
import { Modal, List, Input, Button, message, Popconfirm, Empty } from 'antd';
import { DeleteOutlined, PlusOutlined, TagOutlined } from '@ant-design/icons';
import { getTags, createTag, deleteTag, type TagItem } from '../api/knowledgeApi';

interface TagManagerProps {
    open: boolean;
    onClose: () => void;
    onTagsChanged: () => void; // 通知父组件刷新标签列表
}

const TagManager: React.FC<TagManagerProps> = ({ open, onClose, onTagsChanged }) => {
    const [tags, setTags] = useState<TagItem[]>([]);
    const [newTagName, setNewTagName] = useState('');
    const [loading, setLoading] = useState(false);
    const [creating, setCreating] = useState(false);

    const fetchTags = async () => {
        setLoading(true);
        try {
            const data = await getTags();
            setTags(data);
        } catch (error) {
            message.error('加载标签失败');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (open) {
            fetchTags();
        }
    }, [open]);

    const handleAddTag = async () => {
        if (!newTagName.trim()) return;
        setCreating(true);
        try {
            await createTag(newTagName.trim());
            message.success('标签创建成功');
            setNewTagName('');
            fetchTags();
            onTagsChanged();
        } catch (error) {
            message.error('创建失败，标签可能已存在');
        } finally {
            setCreating(false);
        }
    };

    // 修改点：id 类型改为 string
    const handleDeleteTag = async (id: string) => {
        try {
            await deleteTag(id);
            message.success('标签删除成功');
            fetchTags();
            onTagsChanged();
        } catch (error) {
            message.error('删除失败');
        }
    };

    return (
        <Modal
            title="标签管理"
            open={open}
            onCancel={onClose}
            footer={null}
            width={400}
            centered
        >
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                <Input 
                    placeholder="输入新标签名称" 
                    value={newTagName}
                    onChange={e => setNewTagName(e.target.value)}
                    onPressEnter={handleAddTag}
                    prefix={<TagOutlined style={{ color: '#94a3b8' }} />}
                />
                <Button type="primary" icon={<PlusOutlined />} loading={creating} onClick={handleAddTag}>
                    添加
                </Button>
            </div>

            <List
                loading={loading}
                dataSource={tags}
                bordered
                size="small"
                style={{ maxHeight: 300, overflowY: 'auto' }}
                locale={{ emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无标签" /> }}
                renderItem={item => (
                    <List.Item
                        actions={[
                            <Popconfirm 
                                title="确定删除此标签?" 
                                onConfirm={() => handleDeleteTag(item.id)}
                                okText="删除"
                                cancelText="取消"
                            >
                                <Button type="text" danger icon={<DeleteOutlined />} size="small" />
                            </Popconfirm>
                        ]}
                    >
                        <span style={{ fontWeight: 500 }}>{item.name}</span>
                    </List.Item>
                )}
            />
        </Modal>
    );
};

export default TagManager;