import React, { useState } from 'react';
import { Button, Input, List, Spin } from 'antd';
import { postQuery } from '../api/chatApi';

interface Message {
  sender: 'user' | 'bot';
  text: string;
}

const ChatWindow: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { sender: 'bot', text: '您好！有什么可以帮助您的吗？' },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendMessage = async () => {
    if (inputValue.trim()) {
      const userMessage = { sender: 'user' as const, text: inputValue };
      setMessages(prev => [...prev, userMessage]);
      setInputValue('');
      setLoading(true);

      try {
        const response = await postQuery(inputValue);
        const botMessage = { sender: 'bot' as const, text: response.answer };
        setMessages(prev => [...prev, botMessage]);
      } catch (error) {
        const errorMessage = { sender: 'bot' as const, text: '抱歉，服务出错了，请稍后再试。' };
        setMessages(prev => [...prev, errorMessage]);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <List
        itemLayout="horizontal"
        dataSource={messages}
        renderItem={(item) => (
          <List.Item style={{ textAlign: item.sender === 'user' ? 'right' : 'left' }}>
            <List.Item.Meta
              title={item.sender === 'user' ? 'You' : 'Bot'}
              description={item.text}
            />
          </List.Item>
        )}
        style={{ flex: 1, overflowY: 'auto', padding: '20px' }}
      />
      {loading && <Spin style={{ padding: '20px' }} />}
      <div style={{ display: 'flex', padding: '10px' }}>
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onPressEnter={handleSendMessage}
          placeholder="请输入您的问题..."
          disabled={loading}
        />
        <Button
          type="primary"
          onClick={handleSendMessage}
          style={{ marginLeft: '10px' }}
          loading={loading}
        >
          发送
        </Button>
      </div>
    </div>
  );
};

export default ChatWindow;
