import React from 'react';
import { Category, ConfigSetting } from '../data/categories';

interface ConfigFormProps {
  category: Category;
  config: Record<string, string>;
  onConfigChange: (key: string, value: string) => void;
}

export const ConfigForm: React.FC<ConfigFormProps> = ({ category, config, onConfigChange }) => {
  const renderInput = (setting: ConfigSetting) => {
    const value = config[setting.key] || '';

    switch (setting.type) {
      case 'boolean':
        return (
          <select
            value={value}
            onChange={(e) => onConfigChange(setting.key, e.target.value)}
            className="form-select"
          >
            <option value="">Not set</option>
            <option value="true">True</option>
            <option value="false">False</option>
          </select>
        );

      case 'number':
        return (
          <input
            type="number"
            value={value}
            onChange={(e) => onConfigChange(setting.key, e.target.value)}
            className="form-input"
            placeholder="Enter number"
          />
        );

      case 'select':
        return (
          <select
            value={value}
            onChange={(e) => onConfigChange(setting.key, e.target.value)}
            className="form-select"
          >
            <option value="">Not set</option>
            {setting.options?.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        );

      case 'text':
      default:
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => onConfigChange(setting.key, e.target.value)}
            className="form-input"
            placeholder="Enter value"
          />
        );
    }
  };

  return (
    <div className="config-form">
      <div className="form-header">
        <h2>{category.name}</h2>
      </div>
      <div className="form-content">
        {category.settings.map((setting) => (
          <div key={setting.key} className="form-group">
            <label className="form-label">
              {setting.label}
              {setting.description && (
                <span className="form-description">{setting.description}</span>
              )}
            </label>
            {renderInput(setting)}
          </div>
        ))}
      </div>
    </div>
  );
};
