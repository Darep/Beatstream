interface Theme {
  accentColor: string;
  accentLight: string;
  bgCellEven: string;
  bgCellHover: string;
  bgCellOdd: string;
  textDark: string;
}

export const THEME_LIGHT: Theme = {
  accentColor: '#fa4',
  accentLight: '#fa4',
  bgCellEven: '#fff',
  bgCellHover: '#f7f0e0',
  bgCellOdd: '#f8f8f8',
  textDark: '#333',
};

export const THEME_DARK: Theme = {
  ...THEME_LIGHT,
  accentColor: '#c71',
  accentLight: '#c71',
  bgCellEven: '#181818',
  bgCellHover: '#333',
  bgCellOdd: '#101010',
  textDark: '#fafafa',
};
