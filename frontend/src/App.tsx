import { App as AntApp, ConfigProvider, theme } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import './App.css'
import HomePage from './pages/HomePage';

function App() {
  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        token: {
          colorPrimary: '#6366f1', // Indigo 500
          borderRadius: 8,
          fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        },
        algorithm: theme.defaultAlgorithm,
        components: {
          Button: {
            controlHeightLG: 44,
            borderRadiusLG: 12,
          },
          Input: {
            controlHeightLG: 44,
            borderRadiusLG: 12,
          },
          Card: {
            borderRadiusLG: 16,
          }
        }
      }}
    >
      <AntApp>
        <HomePage />
      </AntApp>
    </ConfigProvider>
  )
}

export default App