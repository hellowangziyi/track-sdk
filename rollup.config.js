import ts from 'rollup-plugin-typescript2'
import path from 'path'
import dts from 'rollup-plugin-dts'

export default [{
    input: 'src/core/index.ts',
    output: [
        // 打包esModule
        {
            file: path.resolve(__dirname, './dist/index.ems.js'),
            format: 'es'
        },
        // 打包common js
        {
            file: path.resolve(__dirname, './dist/index.cjs.js'),
            format: 'cjs'
        },
        // 打包amd cmd umd
        {
            file: path.resolve(__dirname, './dist/index.js'),
            format: 'umd',
            name: 'tracker'
        }
    ],
    plugins: [
        ts(),
    ]
}, {
    // 打包声明文件
    input: './src/core/index.ts',
    output: {
        file: path.resolve(__dirname, './dist/index.d.ts'),
        format: 'es'
    },
    plugins: [
        dts()
    ]

}]