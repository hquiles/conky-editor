import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { ConfigForm } from './components/ConfigForm';
import { Header } from './components/Header';
import { categories, Category } from './data/categories';
import './styles/App.css';

export const App: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>('window');
  const [config, setConfig] = useState<Record<string, string>>({});
  const [originalConfig, setOriginalConfig] = useState<Record<string, string>>({});
  const [configPath, setConfigPath] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [isRestarting, setIsRestarting] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    initializeApp();
  }, []);

  useEffect(() => {
    const changed = JSON.stringify(config) !== JSON.stringify(originalConfig);
    setHasChanges(changed);
  }, [config, originalConfig]);

  const initializeApp = async () => {
    // Load config path from localStorage or use default
    const savedPath = localStorage.getItem('conky-config-path');
    const defaultPath = await window.conkyAPI.getDefaultConfigPath();
    const pathToUse = savedPath || defaultPath;

    setConfigPath(pathToUse);
    await loadConfig(pathToUse);
  };

  const loadConfig = async (path: string) => {
    try {
      const result = await window.conkyAPI.readConfig(path);
      if (result.success && result.data) {
        setConfig(result.data);
        setOriginalConfig(result.data);
        setError(null);
      } else {
        setError(result.error || 'Failed to load config');
        setConfig({});
        setOriginalConfig({});
      }
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleConfigChange = (key: string, value: string) => {
    setConfig((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleConfigPathChange = (newPath: string) => {
    setConfigPath(newPath);
    localStorage.setItem('conky-config-path', newPath);
  };

  const handleBrowseConfigFile = async () => {
    try {
      const result = await window.conkyAPI.selectConfigFile();
      if (result.success && result.filePath) {
        setConfigPath(result.filePath);
        localStorage.setItem('conky-config-path', result.filePath);
        await loadConfig(result.filePath);
      }
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);

    try {
      const result = await window.conkyAPI.writeConfig(configPath, config);
      if (result.success) {
        setOriginalConfig(config);
        setLastSaved(new Date());
        setError(null);
      } else {
        setError(result.error || 'Failed to save config');
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveAndRestart = async () => {
    setIsSaving(true);
    setIsRestarting(true);
    setError(null);

    try {
      // First save the config
      const saveResult = await window.conkyAPI.writeConfig(configPath, config);
      if (!saveResult.success) {
        setError(saveResult.error || 'Failed to save config');
        setIsSaving(false);
        setIsRestarting(false);
        return;
      }

      setOriginalConfig(config);
      setLastSaved(new Date());
      setIsSaving(false); // Save complete, reset this state

      // Then restart Conky with the specific config file
      // Use a timeout to ensure we don't hang forever
      const restartPromise = window.conkyAPI.restartConky(configPath);
      const timeoutPromise = new Promise((resolve) =>
        setTimeout(() => resolve({ success: true, timedOut: true }), 3000)
      );

      const restartResult = await Promise.race([restartPromise, timeoutPromise]) as any;

      if (restartResult.timedOut) {
        // Restart initiated, reset state even if we don't wait for completion
        setIsRestarting(false);
      } else if (!restartResult.success) {
        setError(`Saved successfully, but failed to restart Conky: ${restartResult.error}`);
        setIsRestarting(false);
      } else {
        setIsRestarting(false);
      }
    } catch (err) {
      setError((err as Error).message);
      setIsSaving(false);
      setIsRestarting(false);
    }
  };

  const activeCategoryData: Category | undefined = categories.find(
    (cat) => cat.id === activeCategory
  );

  return (
    <div className="app">
      <Sidebar
        categories={categories}
        activeCategory={activeCategory}
        onCategorySelect={setActiveCategory}
      />
      <div className="main-content">
        <Header
          configPath={configPath}
          isSaving={isSaving}
          isRestarting={isRestarting}
          lastSaved={lastSaved}
          hasChanges={hasChanges}
          onSave={handleSave}
          onSaveAndRestart={handleSaveAndRestart}
          onBrowseConfigFile={handleBrowseConfigFile}
          onConfigPathChange={handleConfigPathChange}
        />
        <div className="content-area">
          {error && (
            <div className="error-message">
              <strong>Error:</strong> {error}
            </div>
          )}
          {activeCategoryData ? (
            <ConfigForm
              category={activeCategoryData}
              config={config}
              onConfigChange={handleConfigChange}
            />
          ) : (
            <div className="no-category">Select a category to edit settings</div>
          )}
        </div>
      </div>
    </div>
  );
};
