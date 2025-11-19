import React, { useState, useRef, useEffect } from 'react';
import { Button, Input, Spin } from 'antd';
import { SendOutlined, RobotOutlined, UserOutlined } from '@ant-design/icons';
import { postQuery } from '../api/chatApi';
import type { Message } from '../types/components';
import SourceList from './SourceList';
import ReactMarkdown from 'react-markdown';
import '../styles/ChatWindow.css';


const ChatWindow: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { sender: 'bot', text: '您好！我是您的知识库助手，请问有什么可以帮您？' },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  
  const chatListContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatListContainerRef.current) {
      const element = chatListContainerRef.current;
      element.scrollTo({ top: element.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, loading]);

  const handleSendMessage = async () => {
    if (inputValue.trim()) {
      const userMessage: Message = { sender: 'user', text: inputValue };
      setMessages(prev => [...prev, userMessage]);
      setInputValue('');
      setLoading(true);

      try {
        const response = await postQuery(inputValue);
        const botMessage: Message = { sender: 'bot', text: response.answer, sources: response.sources };
        setMessages(prev => [...prev, botMessage]);
      } catch (error) {
        const errorMessage: Message = { sender: 'bot', text: '抱歉，服务出错了，请稍后再试。' };
        setMessages(prev => [...prev, errorMessage]);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="chat-container">
      <div 
        ref={chatListContainerRef}
        className="chat-list-container" 
      >
        {messages.map((item, index) => (
          <div key={index} className={`chat-message ${item.sender === 'user' ? 'user-message' : 'bot-message'}`}>
            {/* 机器人头像 */}
            {item.sender === 'bot' && (
              <div className="message-avatar bot-avatar">
                <RobotOutlined />
              </div>
            )}
            
            <div className="message-bubble">
              {item.sender === 'bot' ? (
                <div className="markdown-content">
                  <ReactMarkdown>{item.text}</ReactMarkdown>
                </div>
              ) : (
                item.text
              )}
              
              {item.sender === 'bot' && item.sources && item.sources.length > 0 && (
                <div className="source-list-container">
                   <span className="source-title">参考来源：</span>
                   <SourceList sources={item.sources} />
                </div>
              )}
            </div>

            {/* 用户头像 */}
            {item.sender === 'user' && (
              <div className="message-avatar user-avatar">
                <UserOutlined />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="chat-message bot-message">
             <div className="message-avatar bot-avatar">
                <RobotOutlined />
              </div>
              <div className="message-bubble" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                 <Spin size="small" /> 思考中...
              </div>
          </div>
        )}
      </div>

      <div className="chat-input-area">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onPressEnter={handleSendMessage}
          placeholder="请输入您的问题..."
          disabled={loading}
          size="large"
          style={{ borderRadius: 24 }}
          suffix={
             <Button 
                type="primary" 
                shape="circle" 
                icon={<SendOutlined />} 
                onClick={handleSendMessage}
                loading={loading}
                style={{ boxShadow: 'none' }}
             />
          }
        />
      </div>
    </div>
  );
};

export default ChatWindow;