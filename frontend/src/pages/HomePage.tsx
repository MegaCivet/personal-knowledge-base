import React from 'react';
import { RobotOutlined } from '@ant-design/icons';
import UploadArea from '../components/UploadArea';
import ChatWindow from '../components/ChatWindow';
import '../styles/HomePage.css';

const HomePage: React.FC = () => {
  return (
    <div className="home-container">
      <div className="left-panel">
        <div className="app-header">
          <RobotOutlined className="app-logo" />
          <h1 className="app-title">个人智能知识库</h1>
        </div>
        <UploadArea />
      </div>
      <div className="right-panel">
        <ChatWindow />
      </div>
    </div>
  );
};

export default HomePage;