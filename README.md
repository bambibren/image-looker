# image-looker
A PC side enlarge preview picture component, based on react.

# How to use
#### Install package:
```javascript
npm install --save image-looker
```
#### Import to your app:
```javascript
import ImageLooker from 'image-looker';
```
#### Use the component:

使用此组件包裹住多个`<img/>` 标签或者单个`<img/>` 标签，并像下面这样给这些`<img/>` 添加属性：

```javascript

export default class App extends React.Component {
  const imgs = [{
    src: '/xxx.jpg',
    thumbnail: '/xxx_w100_h200.jpg',
    status: 'done'
  }, {
    src: '/yyy.jpg',
    thumbnail: '/yyy_w100_h200.jpg',
    status: 'fail'
  }];
  render() {
    return (
      <ImageLooker className="container">
        {imgs.map(img => {
          return (
            <img
              src={img.thumbnail}
              data-src={img.src}
              data-invalid={img.status === 'fail'}
            />
          )
        })}    
      </ImageLooker>
    );
  }
}
```
# API

#### `<img/>` 需要的额外属性
|API名称|	用法|是否必填|
:-|:-|:-
|data-src| 放大展示时使用的高清原图地址|否，不填默认使用src|
|data-invalid| 当前图片是否禁用大图预览，一般图片加载失败等情况可以使用此属性|否，不填默认不禁用|
