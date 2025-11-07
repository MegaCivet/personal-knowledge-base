import React from 'react';
import UploadArea from '../components/UploadArea';
import ChatWindow from '../components/ChatWindow';
import '../styles/HomePage.css';

const HomePage: React.FC = () => {
  return (
    <div className="home-container">
      <div className="left-panel">
        <UploadArea />
      </div>
      <div className="right-panel">
        <ChatWindow />
      </div>
    </div>
  );
};

export default HomePage;
