export interface ConfigSetting {
  key: string;
  label: string;
  type: 'text' | 'number' | 'boolean' | 'select';
  options?: string[];
  description?: string;
}

export interface Category {
  id: string;
  name: string;
  settings: ConfigSetting[];
}

export const categories: Category[] = [
  {
    id: 'window',
    name: 'Window & Display',
    settings: [
      {
        key: 'alignment',
        label: 'Alignment',
        type: 'select',
        options: ['top_left', 'top_right', 'top_middle', 'bottom_left', 'bottom_right', 'bottom_middle', 'middle_left', 'middle_right', 'none'],
        description: 'Position on screen'
      },
      {
        key: 'own_window',
        label: 'Own Window',
        type: 'boolean',
        description: 'Draw in separate window'
      },
      {
        key: 'own_window_type',
        label: 'Window Type',
        type: 'select',
        options: ['normal', 'desktop', 'dock', 'panel', 'override'],
        description: 'Window style'
      },
      {
        key: 'own_window_transparent',
        label: 'Window Transparent',
        type: 'boolean',
        description: 'Make window background transparent'
      },
      {
        key: 'own_window_hints',
        label: 'Window Hints',
        type: 'text',
        description: 'Window manager hints (e.g., undecorated,below,sticky,skip_taskbar,skip_pager)'
      }
    ]
  },
  {
    id: 'output',
    name: 'Output Destinations',
    settings: [
      {
        key: 'out_to_x',
        label: 'Output to X',
        type: 'boolean',
        description: 'Enable X display output'
      },
      {
        key: 'out_to_console',
        label: 'Output to Console',
        type: 'boolean',
        description: 'Output to standard console'
      },
      {
        key: 'out_to_wayland',
        label: 'Output to Wayland',
        type: 'boolean',
        description: 'Enable Wayland support'
      }
    ]
  },
  {
    id: 'visual',
    name: 'Visual Styling',
    settings: [
      {
        key: 'font',
        label: 'Font',
        type: 'text',
        description: 'Default font (e.g., DejaVu Sans Mono:size=12)'
      },
      {
        key: 'default_color',
        label: 'Default Color',
        type: 'text',
        description: 'Default text color (hex or name)'
      },
      {
        key: 'default_outline_color',
        label: 'Outline Color',
        type: 'text',
        description: 'Text outline color'
      },
      {
        key: 'default_shade_color',
        label: 'Shade Color',
        type: 'text',
        description: 'Text shade color'
      },
      {
        key: 'draw_borders',
        label: 'Draw Borders',
        type: 'boolean',
        description: 'Draw borders around text'
      },
      {
        key: 'draw_graph_borders',
        label: 'Draw Graph Borders',
        type: 'boolean',
        description: 'Draw borders around graphs'
      },
      {
        key: 'draw_shades',
        label: 'Draw Shades',
        type: 'boolean',
        description: 'Draw shaded text'
      },
      {
        key: 'draw_outline',
        label: 'Draw Outline',
        type: 'boolean',
        description: 'Draw outlined text'
      }
    ]
  },
  {
    id: 'dimensions',
    name: 'Dimensions & Spacing',
    settings: [
      {
        key: 'gap_x',
        label: 'Gap X',
        type: 'number',
        description: 'Horizontal gap from edge (pixels)'
      },
      {
        key: 'gap_y',
        label: 'Gap Y',
        type: 'number',
        description: 'Vertical gap from edge (pixels)'
      },
      {
        key: 'minimum_width',
        label: 'Minimum Width',
        type: 'number',
        description: 'Minimum window width (pixels)'
      },
      {
        key: 'minimum_height',
        label: 'Minimum Height',
        type: 'number',
        description: 'Minimum window height (pixels)'
      },
      {
        key: 'maximum_width',
        label: 'Maximum Width',
        type: 'number',
        description: 'Maximum window width (pixels)'
      }
    ]
  },
  {
    id: 'performance',
    name: 'Performance & Behavior',
    settings: [
      {
        key: 'update_interval',
        label: 'Update Interval',
        type: 'number',
        description: 'Refresh rate in seconds'
      },
      {
        key: 'double_buffer',
        label: 'Double Buffer',
        type: 'boolean',
        description: 'Enable double buffering (reduces flicker)'
      },
      {
        key: 'cpu_avg_samples',
        label: 'CPU Average Samples',
        type: 'number',
        description: 'Number of samples to average for CPU'
      },
      {
        key: 'net_avg_samples',
        label: 'Network Average Samples',
        type: 'number',
        description: 'Number of samples to average for network'
      },
      {
        key: 'no_buffers',
        label: 'No Buffers',
        type: 'boolean',
        description: 'Subtract file system buffers from used memory'
      },
      {
        key: 'background',
        label: 'Background',
        type: 'boolean',
        description: 'Fork to background'
      }
    ]
  },
  {
    id: 'text',
    name: 'Text Settings',
    settings: [
      {
        key: 'use_xft',
        label: 'Use XFT',
        type: 'boolean',
        description: 'Use Xft for anti-aliased fonts'
      },
      {
        key: 'uppercase',
        label: 'Uppercase',
        type: 'boolean',
        description: 'Convert all text to uppercase'
      },
      {
        key: 'override_utf8_locale',
        label: 'Override UTF8 Locale',
        type: 'boolean',
        description: 'Force UTF-8 encoding'
      }
    ]
  }
];
