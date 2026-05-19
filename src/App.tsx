import { useState } from 'react';
import Layout from './components/Layout';
import Directory from './components/Directory';
import MonthlyReportComponent from './components/MonthlyReport';
import Credits from './components/Credits';

function App() {
  const [activeTab, setActiveTab] = useState('directory');

  const renderContent = () => {
    switch (activeTab) {
      case 'directory':
        return <Directory />;
      case 'report':
        return <MonthlyReportComponent />;
      case 'credits':
        return <Credits />;
      default:
        return <Directory />;
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderContent()}
    </Layout>
  );
}

export default App;