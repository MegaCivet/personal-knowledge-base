import React from 'react';
import { Tag } from 'antd';
import { BookOutlined } from '@ant-design/icons';
import type { SourceListProps } from '../types/components';

const SourceList: React.FC<SourceListProps> = ({ sources }) => {
  const uniqueSources = Array.from(new Map(sources.map(s => [s.file_id, s])).values());

  if (uniqueSources.length === 0) {
    return null;
  }

  return (
    <div style={{ marginTop: '10px' }}>
      <strong>来源:</strong>
      <div style={{ marginTop: '5px' }}>
        {uniqueSources.map((s) => (
          <Tag key={s.file_id} icon={<BookOutlined />}>
            {s.filename}（{s.tag ?? '未分类'}）
          </Tag>
        ))}
      </div>
    </div>
  );
};

export default SourceList;
