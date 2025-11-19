import React from 'react';
import { Tag } from 'antd';
import { BookOutlined } from '@ant-design/icons';
import type { Source } from '../api/chatApi';

interface SourceListProps {
  sources: Source[];
}

const SourceList: React.FC<SourceListProps> = ({ sources }) => {
  // Get unique filenames
  const uniqueFilenames = [...new Set(sources.map(source => source.filename))];

  if (uniqueFilenames.length === 0) {
    return null;
  }

  return (
    <div style={{ marginTop: '10px' }}>
      <strong>来源:</strong>
      <div style={{ marginTop: '5px' }}>
        {uniqueFilenames.map((filename, index) => (
          <Tag key={index} icon={<BookOutlined />}>
            {filename}
          </Tag>
        ))}
      </div>
    </div>
  );
};

export default SourceList;
