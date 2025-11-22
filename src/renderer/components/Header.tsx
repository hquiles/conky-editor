import React from 'react';

interface HeaderProps {
  configPath: string;
  isSaving: boolean;
  isRestarting: boolean;
  lastSaved: Date | null;
  hasChanges: boolean;
  onSave: () => void;
  onSaveAndRestart: () => void;
  onBrowseConfigFile: () => void;
  onConfigPathChange: (path: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  configPath,
  isSaving,
  isRestarting,
  lastSaved,
  hasChanges,
  onSave,
  onSaveAndRestart,
  onBrowseConfigFile,
  onConfigPathChange
}) => {
  return (
    <header className="header">
      <div className="header-info">
        <div className="config-path-selector">
          <label>
            <strong>Config File:</strong>
          </label>
          <input
            type="text"
            value={configPath}
            onChange={(e) => onConfigPathChange(e.target.value)}
            className="config-path-input"
            placeholder="/etc/conky/conky.conf"
          />
          <button onClick={onBrowseConfigFile} className="browse-button">
            Browse...
          </button>
        </div>
        {lastSaved && (
          <span className="last-saved">
            Last saved: {lastSaved.toLocaleTimeString()}
          </span>
        )}
      </div>
      <div className="header-actions">
        {hasChanges && <span className="unsaved-indicator">Unsaved changes</span>}
        <button
          onClick={onSave}
          disabled={isSaving || isRestarting || !hasChanges}
          className={`save-button ${hasChanges ? 'has-changes' : ''}`}
        >
          {isSaving ? 'Saving...' : 'Save'}
        </button>
        <button
          onClick={onSaveAndRestart}
          disabled={isSaving || isRestarting || !hasChanges}
          className={`save-button restart-button ${hasChanges ? 'has-changes' : ''}`}
        >
          {isRestarting ? 'Restarting...' : 'Save & Restart Conky'}
        </button>
      </div>
    </header>
  );
};
