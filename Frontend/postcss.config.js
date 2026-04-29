module.exports = {
    plugins: [
        require('tailwindcss'),
        require('autoprefixer')({
            overrideBrowserslist: ['last 2 versions', '>1%'],
        }),
    ],
}
