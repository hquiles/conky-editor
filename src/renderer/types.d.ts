export interface ConkyAPI {
  getDefaultConfigPath: () => Promise<string>;
  selectConfigFile: () => Promise<{
    success: boolean;
    filePath?: string;
    canceled?: boolean;
    error?: string;
  }>;
  readConfig: (configPath: string) => Promise<{
    success: boolean;
    data?: Record<string, string>;
    rawContent?: string;
    error?: string;
  }>;
  writeConfig: (configPath: string, config: Record<string, string>) => Promise<{
    success: boolean;
    error?: string;
  }>;
  restartConky: (configPath: string) => Promise<{
    success: boolean;
    error?: string;
  }>;
}

declare global {
  interface Window {
    conkyAPI: ConkyAPI;
  }
}
