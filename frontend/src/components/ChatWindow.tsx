import React, { useState, useRef, useEffect } from 'react'; // 1. 导入 useRef 和 useEffect
import { Button, Input, List, Spin } from 'antd';
import { postQuery, type Source } from '../api/chatApi';
import SourceList from './SourceList';
import ReactMarkdown from 'react-markdown';
import '../styles/ChatWindow.css'; // 2. 导入新的 CSS 文件

interface Message {
  sender: 'user' | 'bot';
  text: string;
  sources?: Source[];
}

const ChatWindow: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { sender: 'bot', text: '您好！有什么可以帮助您的吗？' },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  
  // 3. 为列表容器创建一个 ref
  const chatListContainerRef = useRef<HTMLDivElement>(null);

  // 4. (建议 2) 添加自动滚动逻辑
  useEffect(() => {
    if (chatListContainerRef.current) {
      const element = chatListContainerRef.current;
      element.scrollTop = element.scrollHeight;
    }
  }, [messages]); // 每次 'messages' 数组更新时触发

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
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* 5. 将 ref 附加到 List 的父 div 上，并修改 List 样式 */}
      <div 
        ref={chatListContainerRef}
        style={{ flex: 1, overflowY: 'auto', padding: '20px' }}
        className="chat-list-container" 
      >
        <List
          itemLayout="horizontal"
          dataSource={messages}
          renderItem={(item) => (
            // 6. 彻底修改 renderItem 
            <List.Item className={`chat-message ${item.sender === 'user' ? 'user-message' : 'bot-message'}`}>
              <div className="message-bubble">
                {item.sender === 'bot' ? (
                  <div className="markdown-content">
                    <ReactMarkdown>{item.text}</ReactMarkdown>
                  </div>
                ) : (
                  item.text
                )}
                
                {item.sender === 'bot' && item.sources && (
                  <div style={{ marginTop: '10px' }}> 
                    <SourceList sources={item.sources} />
                  </div>
                )}
              </div>
            </List.Item>
          )}
          split={false} // 移除 antd 列表的默认分割线
        />
      </div>
      {loading && <Spin style={{ padding: '20px' }} />}
      {/* 7. (建议 3) 美化输入框区域 */}
      <div className="chat-input-area">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onPressEnter={handleSendMessage}
          placeholder="请输入您的问题..."
          disabled={loading}
          size="large" // 增大输入框
        />
        <Button
          type="primary"
          onClick={handleSendMessage}
          style={{ marginLeft: '10px' }}
          loading={loading}
          size="large" // 增大按钮
        >
          发送
        </Button>
      </div>
    </div>
  );
};

export default ChatWindow;