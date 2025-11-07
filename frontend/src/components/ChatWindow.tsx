import React, { useState } from 'react';
import { Button, Input, List } from 'antd';

interface Message {
  sender: 'user' | 'bot';
  text: string;
}

const ChatWindow: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { sender: 'bot', text: '您好！有什么可以帮助您的吗？' },
    { sender: 'user', text: '你好，请问这个知识库能做什么？' },
    { sender: 'bot', text: '我可以根据您上传的 Markdown 文档内容，回答您的任何问题。' },
  ]);
  const [inputValue, setInputValue] = useState('');

  const handleSendMessage = () => {
    if (inputValue.trim()) {
      // TODO: Send message to API and get response
      setMessages([...messages, { sender: 'user', text: inputValue }]);
      setInputValue('');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <List
        itemLayout="horizontal"
        dataSource={messages}
        renderItem={(item, index) => (
          <List.Item style={{ textAlign: item.sender === 'user' ? 'right' : 'left' }}>
            <List.Item.Meta
              title={item.sender === 'user' ? 'You' : 'Bot'}
              description={item.text}
            />
          </List.Item>
        )}
        style={{ flex: 1, overflowY: 'auto', padding: '20px' }}
      />
      <div style={{ display: 'flex', padding: '10px' }}>
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onPressEnter={handleSendMessage}
          placeholder="请输入您的问题..."
        />
        <Button type="primary" onClick={handleSendMessage} style={{ marginLeft: '10px' }}>
          发送
        </Button>
      </div>
    </div>
  );
};

export default ChatWindow;
