module.exports = {
  createOldCatalogs: false, // Don't save previous translation versions
  indentation: 2,
  lexers: {
    js: ['JsxLexer'],
    jsx: ['JsxLexer'],
    ts: ['JsxLexer'],
    tsx: ['JsxLexer'],
    default: ['JsxLexer']
  },
  locales: ['en', 'ar', 'fr'],
  output: 'public/locales/$LOCALE/$NAMESPACE.json',
  input: [
    'src/**/*.{js,jsx,ts,tsx}',
  ],
  verbose: true,
  sort: true,
  // Ensure missing keys are added
  keepRemoved: true, 
  // By default use common namespace
  defaultNamespace: 'common',
};
