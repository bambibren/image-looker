import { CloseOutlined, LeftOutlined, RightOutlined } from "@ant-design/icons";
import { Spin } from "antd";
import _ from "lodash";
import React, { forwardRef, useEffect, useRef, useState } from "react";
import "./css/index.css";

// function getBase64(file) {
//   return new Promise((resolve, reject) => {
//     const reader = new FileReader();
//     reader.readAsDataURL(file);
//     reader.onload = () => resolve(reader.result);
//     reader.onerror = error => reject(error);
//   });
// }

function ImagesPreview(props, ref) {
  const children = props.children || [];
  const [needResize, setNeedResize] = useState(false);
  const [previewVisible, setVisible] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [previewImageSrc, setSrc] = useState("");
  const [previewLoading, setLoading] = useState(false);
  const [previewOrigin, setOrigin] = useState(false);
  const [images, setImages] = useState(
    new Array(children.length).fill({
      src: "",
    })
  );
  const mask = useRef(null);
  const currentIndexRef = useRef(-1);
  const imagesRef = useRef(images);
  const bodyStyleRef = useRef({});

  const handleCancel = () => setVisible(false);

  const turnLeft = () => {
    setCurrentIndex((index) => {
      if (index - 1 >= 0) {
        setLoading(true);
        setOrigin(false);
        return index - 1;
      } else {
        return index;
      }
    });
  };

  const turnRight = () => {
    setCurrentIndex((index) => {
      if (index + 1 <= images.length - 1) {
        setLoading(true);
        setOrigin(false);
        return index + 1;
      } else {
        return index;
      }
    });
  };

  const handleKeyDown = (e) => {
    if (e.keyCode == 37) {
      turnLeft();
    } else if (e.keyCode == 39) {
      turnRight();
    }
  };

  const handleResize = () => {
    if (currentIndexRef.current > -1) {
      const stageSize = {
        x: mask.current && mask.current.clientWidth,
        y: mask.current && mask.current.clientHeight,
      };
      const images = imagesRef.current;
      const imageSize = {
        x: images[currentIndexRef.current].naturalWidth,
        y: images[currentIndexRef.current].naturalHeight,
      };
      if (imageSize.x / stageSize.x > 1 || imageSize.y / stageSize.y > 1) {
        setNeedResize(true);
      } else {
        setNeedResize(false);
      }
    }
  };

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("resize", handleResize);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    currentIndexRef.current = currentIndex;
    if (images[currentIndex]) {
      if (images[currentIndex] && images[currentIndex].dataset.src) {
        setSrc(images[currentIndex].dataset.src);
      } else {
        setSrc(images[currentIndex].src);
      }
    }
  }, [currentIndex, images[currentIndex] && images[currentIndex].src]);

  useEffect(() => {
    imagesRef.current = images;
  }, [images]);

  useEffect(() => {
    if (mask.current) {
      document.body.appendChild(mask.current);
    }
  }, [mask.current]);

  useEffect(() => {
    if (previewVisible) {
      bodyStyleRef.current.overflow = document.body.style.overflow;
      bodyStyleRef.current.width = document.body.style.width;
      document.body.style.overflow = "hidden";
      document.body.style.width = "calc(100% - 15px)";
    } else {
      document.body.style.overflow = bodyStyleRef.current.overflow || null;
      document.body.style.width = bodyStyleRef.current.width || null;
    }
  }, [previewVisible]);
  return (
    <div {...props} ref={ref}>
      {React.Children.map(children, (child, index) => {
        return React.cloneElement(child, {
          ...child.props,
          className:
            (child.props["data-invalid"] ? "" : "cursor") +
            (child.props.className ? " " + child.props.className : ""),
          onLoad: (e) => {
            const imagesClone = _.cloneDeep(images);
            imagesClone[index] = e.target;
            imagesClone[index].loaded = true;
            setImages(imagesClone);
          },
          onClick: () => {
            if (!JSON.parse(images[index].dataset.invalid || false)) {
              if (!images[index].loaded) setLoading(true);
              setOrigin(false);
              setCurrentIndex(index);
              setVisible(true);
            }
          },
        });
      })}
      <div
        className="pics-mask"
        ref={mask}
        style={{
          display: previewVisible ? "flex" : "none",
        }}
      >
        <div className="pics-title" onClick={() => handleCancel()}>
          <i className="pics-close">
            <CloseOutlined />
          </i>
        </div>
        {currentIndex - 1 >= 0 ? (
          <div className="pics-switch-left" onClick={() => turnLeft()}>
            <LeftOutlined />
          </div>
        ) : null}
        {currentIndex + 1 <= images.length - 1 ? (
          <div className="pics-switch-right" onClick={() => turnRight()}>
            <RightOutlined />
          </div>
        ) : null}
        <Spin
          className="pics-loading"
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            display: previewLoading ? "block" : "none",
          }}
        />
        <img
          style={{
            display: previewLoading ? "none" : "block",
            maxWidth: previewOrigin ? "inherit" : "100vw",
            maxHeight: previewOrigin ? "inherit" : "100vh",
            cursor: needResize
              ? previewOrigin
                ? "zoom-out"
                : "zoom-in"
              : "auto",
          }}
          src={previewImageSrc}
          key={currentIndex}
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
    </div>
  );
}

export default forwardRef(ImagesPreview);
