const path = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const OptimizeCSSPlugin = require('optimize-css-assets-webpack-plugin');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');


const packageJson = require('./package.json');
const projectName = packageJson.name.replace('@fastweb/', '').replace(/(-[a-z])/g,function($,$1){
  return $1.replace("-",'').toUpperCase();
});
const projectPath=packageJson.main;
const env = process.env.WEBPACK_ENV;
const plugins=[];
let outputFile=projectName;

function resolve(dir) {
  return path.join(__dirname, dir);
}

plugins.push(new ExtractTextPlugin(projectName+'.css'));
if(env==='build'){
  plugins.push(new UglifyJSPlugin());
  plugins.push(new OptimizeCSSPlugin({
    cssProcessorOptions: {
      safe: true
    }
  }));
  outputFile +='.min.js';
}else{
  outputFile +='.js';
}

module.exports = {
  entry: {
    app: resolve(projectPath)
  },
  output: {
    path: resolve("./dist"),
    filename: outputFile,
    library: projectName,
    libraryTarget: 'umd',
    umdNamedDefine: true

  },
  resolve: {
    extensions: ['.js']
  },
  devtool: 'source-map',
  module: {
    rules: [
       {
        test: /\.js$/,
        loader: 'babel-loader',
        include: [resolve('src')]
      }, {
        test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: resolve('img/[name].[ext]')
        }
      }, {
        test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: resolve('media/[name].[ext]')
        }
      }, {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: resolve('fonts/[name].[ext]')
        }
      },
      {
        test: /\.scss$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: ['css-loader', 'sass-loader']
        })
      },
      {
        test: /\.less$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: ['css-loader', 'less-loader']
        })
      },
      {
        test: /\.css/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: ['css-loader']
        })
      }
    ]
  },
  plugins: plugins
};
