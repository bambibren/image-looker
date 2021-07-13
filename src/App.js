import {
  CloseOutlined,
  LeftOutlined,
  RightOutlined
} from '@ant-design/icons';
import { Spin } from 'antd';
import _ from "lodash";
import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";


const Wrapper = styled.div`
  .pics-mask {
      position: fixed;
      top: 0;
      right: 0;
      left: 0;
      bottom: 0;
      z-index: 999;
      background-color: rgba(0,0,0,1);
      overflow: auto;
      display: flex;
      align-items: center;
      justify-content: center;
  }

  .pics-title {
    top: 0;
    right: 0;
    font-size: 16px;
    position: fixed;
    height: 48px;
    width: 50px;
    color: #aaa;
    background-color: rgba(0,0,0,.4);
    line-height: 50px;
    height: 50px;
    border-radius: 100px;
    margin-top: 10px;
    margin-right: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #f8f8f9;
    &:hover {
      color: #FFCA19;
    }
  }

  .pics-mask img {
      width: 100%;
      height: 100%;
      object-fit: contain;
  }

  i.pics-close {
      cursor: pointer;
      font-size: 18px;
      font-style: normal;
      display: flex;
      align-items: center;
      justify-content: center;
  }

  .switch-left, .switch-right {
    position: fixed;
    top: calc(50% - 25px);
    left: 30px;
    right: auto;
    z-index: 999;
    width: 50px;
    height: 50px;
    border-radius: 100px;
    background: rgba(0,0,0, .8);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    color: #f8f8f9;
    &:hover {
      color: #FFCA19;
    }
  }

  .switch-right {
    right: 30px;
    left: auto;
  }

  .picture {
    cursor: pointer;
  }
`;

// function getBase64(file) {
//   return new Promise((resolve, reject) => {
//     const reader = new FileReader();
//     reader.readAsDataURL(file);
//     reader.onload = () => resolve(reader.result);
//     reader.onerror = error => reject(error);
//   });
// }

export default function ImagesPreview({
  children,
  className = ""
}) {
  const [needResize, setNeedResize] = useState(false);
  const [previewVisible, setVisible] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [previewImageSrc, setSrc] = useState('');
  const [previewLoading, setLoading] = useState(false);
  const [previewOrigin, setOrigin] = useState(false);
  const [images, setImages] = useState(new Array(children.length).fill({
    src: ''
  }));
  const mask = useRef(null);
  const currentIndexRef = useRef(-1);

  const handleCancel = () => setVisible(false);

  const turnLeft = (currentIndex) => {
    if (currentIndex - 1 >= 0) {
      setLoading(true);
      setOrigin(false);
      setCurrentIndex(currentIndex - 1);
    }
  }

  const turnRight = (currentIndex) => {
    if (currentIndex + 1 <= images.length - 1) {
      setLoading(true);
      setOrigin(false);
      setCurrentIndex(currentIndex + 1);
    }
  }

  const handleKeyDown = e => {
    if (e.keyCode == 37) {
      turnLeft(currentIndexRef.current);
    } else if (e.keyCode == 39) {
      turnRight(currentIndexRef.current);
    }
  }

  const handleResize = () => {
    if (currentIndexRef.current > -1) {
      const stageSize = {
        x: mask.current?.clientWidth,
        y: mask.current?.clientHeight
      }
      const imageSize = {
        x: images[currentIndexRef.current].naturalWidth,
        y: images[currentIndexRef.current].naturalHeight
      }
      if (imageSize.x / stageSize.x > 1
        || imageSize.y / stageSize.y > 1) {
        setNeedResize(true);
      } else {
        setNeedResize(false);
      }
    }
  }

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', handleResize);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', handleResize);
    }
  }, [])

  useEffect(() => {
    currentIndexRef.current = currentIndex;
    if (images[currentIndex]) {
      if (images[currentIndex]?.dataset?.src) {
        setSrc(images[currentIndex].dataset?.src);
      } else {
        setSrc(images[currentIndex].src);
      }
    }
  }, [currentIndex, images[currentIndex]?.src])
  return (
    <Wrapper className={className}>
      {React.Children.map(children, (child, index) => {
        return React.cloneElement(child, {
          ...child.props,
          className: (child.props['data-invalid'] ? "" : "picture") + (child.props.className ? ' ' + child.props.className : ''),
          onLoad: (e) => {
            const imagesClone = _.cloneDeep(images);
            imagesClone[index] = e.target;
            setImages(imagesClone);
          },
          onClick: () => {
            if (!JSON.parse(images[index].dataset?.invalid || false)) {
              setLoading(true);
              setOrigin(false);
              setCurrentIndex(index);
              setVisible(true);
            }
          }
        });
      })}
      {
        previewVisible ? (
          <div className="pics-mask" ref={mask}>
            <div className="pics-title">
              <i className="pics-close" onClick={() => handleCancel()}>
                <CloseOutlined />
              </i>
            </div>
            {
              currentIndex - 1 >= 0 ? (
                <div className="switch-left" onClick={() => turnLeft(currentIndex)}>
                  <LeftOutlined />
                </div>
              ) : null
            }
            {
              currentIndex + 1 <= images.length - 1 ? (
                <div className="switch-right" onClick={() => turnRight(currentIndex)}>
                  <RightOutlined />
                </div>
              ) : null
            }
            <Spin
              className="loading"
              style={{
                position: 'fixed',
                top: '50%',
                left: '50%',
                display: previewLoading ? 'block' : 'none'
              }}
            />
            <img
              style={{
                display: previewLoading ? 'none' : 'block',
                width: needResize ? (previewOrigin ? "auto" : "100%") : "auto",
                height: needResize ? (previewOrigin ? "auto" : "100%") : "auto",
                cursor: needResize ? (previewOrigin ? "zoom-out" : "zoom-in") : "auto",
              }}
              src={previewImageSrc}
              onLoad={() => {
                handleResize();
                setLoading(false);
              }}
              onClick={() => {
                if (needResize) {
                  setOrigin(!previewOrigin);
                }
              }}
            />
          </div>
        ) : null
      }

    </Wrapper>
  );
}
