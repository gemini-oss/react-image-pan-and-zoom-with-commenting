import React from "react";
import clsx from "clsx";
import { Minimize, Minus, Plus, X } from "react-feather";
import {
  ERROR_LOADING_IMG,
  LARGE_IMAGE_LIMIT,
  LOADING_IMG_TEXT,
  LOADING_ZOOM_SUPPORT_TEXT,
} from "../../constants";
import { getBounds } from "../../utils";
import Button from "../button";
import { CommentDotProps } from "../dot-container";
import StyledMainContainer from "./styles";

type ZoomToLocProps = {
  x: number;
  y: number;
  xOffset: number;
  yOffset?: number;
  xValMin?: number;
};

export type ImageZoomCallBackProps = {
  x: number;
  y: number;
  width: number;
  height: number;
  fromWindowEvent?: boolean;
};

type ImageZoomStateProps = {
  panZoomActive: boolean | null;
  mouseDown: boolean;
  touchStart: boolean;
  imgLoaded: boolean;
  imgError: boolean;
  zoomSupportImgLoaded: boolean;
  removeImgSupport: boolean;
  mainRect: DOMRect | undefined;
};

export interface ImagePanAndZoomProps {
  src: string | undefined;
  smallerSrc?: string | undefined;
  previewBoxSrc: string;
  buttonEnablePanZoomText?: string;
  disabled?: boolean;
  enableControls?: boolean;
  enableZoomPreview?: boolean;
  isAndroid?: boolean;
  isPanZoomActive?: boolean | null;
  primaryColor: string;
  secondaryColor: string;
  tertiaryColor: string;
  limitXOffset?: number;
  zoomToPercent: number;
  children?: React.ReactElement | null;
  controls?: React.ReactElement | null;
  imgLoader?: React.ReactElement | string | undefined;
  zoomSupportLoader?: React.ReactElement | string | undefined;
  errorDisplay?: React.ReactElement | string | undefined;
  elementBlockPanAndZoom?: React.RefObject<HTMLElement>[];
  onImageLoad?: () => void;
  onPanStart?: () => void;
  onPanEnd?: () => void;
  onPanMove?: ({ x, y, width, height }: ImageZoomCallBackProps) => void;
  onCanvasClick?: ({ x, y, width, height }: ImageZoomCallBackProps) => void;
  onZoom?: () => void;
  onResize?: ({
    x,
    y,
    width,
    height,
    fromWindowEvent,
  }: ImageZoomCallBackProps) => void;
  onPanZoomActivate?: (val: boolean) => void;
  onZoomEnd?: ({
    x,
    y,
    width,
    height,
    zoomValue,
  }: ImageZoomCallBackProps & { zoomValue: number }) => void;
}

class ImagePanAndZoom extends React.Component<
  ImagePanAndZoomProps,
  ImageZoomStateProps
> {
  androidPrevWidth: number;

  largeImgFirstLoadTimeoutOuter: ReturnType<typeof setTimeout> | null;

  largeImgFirstLoadTimeoutInner: ReturnType<typeof setTimeout> | null;

  zoomTimeout: ReturnType<typeof setTimeout> | null;

  zoomBoxRect: DOMRect | undefined;

  zoomBoxWrapperRect: DOMRect | undefined;

  curPointZoomBox: Omit<CommentDotProps, "comment">;

  firstLoad: boolean;

  isZoomBoxPanning: boolean;

  hasUserZoomedToLoc: boolean;

  isPanning: boolean;

  isZooming: boolean;

  didUserPan: boolean;

  zoomPercent: number;

  initState: Omit<CommentDotProps, "comment">;

  curPoint: Omit<CommentDotProps, "comment">;

  prevPoint: Omit<CommentDotProps, "comment">;

  animState: { anim: unknown; raf: FrameRequestCallback | null };

  mainRefRect!: DOMRect;

  mainImgIntrinsicWidth: number;

  lowResImgIntrinsicWidth: number;

  velocityState: {
    initPoint: { x: number; y: number };
    lastPos: { x: number; y: number };
    velocityTime: number;
    velocityX: number;
    velocityY: number;
    velocity: number;
  };

  pinchState: {
    curX: number;
    curY: number;
    curZoomValue: number;
    newZoomValue: number;
    centerPointStartX: number;
    centerPointStartY: number;
    percentageOfPinchPointX: number;
    percentageOfPinchPointY: number;
    startDistanceBetweenFingers: number;
    newWidth: number;
    newHeight: number;
    curWidth: number;
    curHeight: number;
    initImgWidth: number;
    initImgHeight: number;
    zoomPercent: number;
  };

  zoomBoxState: {
    initWidth: number;
    initHeight: number;
  };

  imgSupportRef: React.RefObject<HTMLImageElement>;

  imgRefZoomBlur: React.RefObject<HTMLImageElement>;

  zoomBoxWrapperRef: React.RefObject<HTMLDivElement>;

  containRef: React.RefObject<HTMLDivElement>;

  mainRef: React.RefObject<HTMLDivElement>;

  wrapRef: React.RefObject<HTMLDivElement>;

  imgRef: React.RefObject<HTMLImageElement>;

  zoomBoxRef: React.RefObject<HTMLDivElement>;

  zoomBoxImgRef: React.RefObject<HTMLImageElement>;

  canvasClickRef: React.RefObject<HTMLDivElement>;

  zoomPercentRef: React.RefObject<HTMLSpanElement>;

  static defaultProps = {
    enableControls: true,
    enableZoomPreview: true,
    isAndroid: false,
    isPanZoomActive: null,
    limitXOffset: 0,
    buttonEnablePanZoomText: "Observe",
    imgLoader: (
      <span
        data-testid="imagePanAndZoomImgLoader"
        className="image-loading-text"
      >
        {LOADING_IMG_TEXT}
      </span>
    ),
    zoomSupportLoader: (
      <span
        data-testid="imagePanAndZoomSupportLoader"
        className="image-loading-text"
      >
        {LOADING_ZOOM_SUPPORT_TEXT}
      </span>
    ),
    errorDisplay: <span className="image-error-text">{ERROR_LOADING_IMG}</span>,
  };

  constructor(props: ImagePanAndZoomProps) {
    super(props);

    this.state = {
      panZoomActive: props.isPanZoomActive || null,
      mouseDown: false,
      touchStart: false,
      imgLoaded: false,
      imgError: false,
      mainRect: undefined,
      removeImgSupport: false,
      zoomSupportImgLoaded: false,
    };

    this.firstLoad = false;
    this.androidPrevWidth = 0;
    this.zoomBoxRect = undefined;
    this.zoomBoxWrapperRect = undefined;
    this.curPointZoomBox = { x: 0, y: 0 };
    this.hasUserZoomedToLoc = false;
    this.isZoomBoxPanning = false;
    this.largeImgFirstLoadTimeoutOuter = null;
    this.largeImgFirstLoadTimeoutInner = null;
    this.mainImgIntrinsicWidth = 0;
    this.lowResImgIntrinsicWidth = 0;
    this.zoomTimeout = null;
    this.isPanning = false;
    this.didUserPan = false;
    this.isZooming = false;
    this.zoomPercent = 0;
    this.initState = { x: 0, y: 0 };
    this.curPoint = { x: 0, y: 0 };
    this.prevPoint = { x: 0, y: 0 };
    this.animState = { anim: null, raf: null };
    this.velocityState = {
      initPoint: { x: 0, y: 0 },
      lastPos: { x: 0, y: 0 },
      velocityTime: 0,
      velocityX: 0,
      velocityY: 0,
      velocity: 0,
    };
    this.pinchState = {
      curX: 0,
      curY: 0,
      curZoomValue: 1,
      newZoomValue: 1,
      centerPointStartX: 0,
      centerPointStartY: 0,
      percentageOfPinchPointX: 0,
      percentageOfPinchPointY: 0,
      startDistanceBetweenFingers: 0,
      newWidth: 0,
      newHeight: 0,
      curWidth: 0,
      curHeight: 0,
      initImgWidth: 0,
      initImgHeight: 0,
      zoomPercent: 0,
    };
    this.zoomBoxState = {
      initWidth: 0,
      initHeight: 0,
    };

    this.imgSupportRef = React.createRef();
    this.imgRefZoomBlur = React.createRef();
    this.containRef = React.createRef();
    this.mainRef = React.createRef();
    this.wrapRef = React.createRef();
    this.imgRef = React.createRef();
    this.zoomBoxRef = React.createRef();
    this.zoomBoxImgRef = React.createRef();
    this.canvasClickRef = React.createRef();
    this.zoomPercentRef = React.createRef();
    this.zoomBoxWrapperRef = React.createRef();

    this.zoomBoxReset = this.zoomBoxReset.bind(this);
    this.zoomBoxMove = this.zoomBoxMove.bind(this);
    this.wheelResize = this.wheelResize.bind(this);
    this.calcVelocity = this.calcVelocity.bind(this);
    this.cancelAnim = this.cancelAnim.bind(this);
    this.setupAnim = this.setupAnim.bind(this);
    this.handleResize = this.handleResize.bind(this);
    this.handleImageLoad = this.handleImageLoad.bind(this);
    this.handleLowResImageLoad = this.handleLowResImageLoad.bind(this);
    this.handleImageError = this.handleImageError.bind(this);
    this.handleMouseDown = this.handleMouseDown.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleMouseUp = this.handleMouseUp.bind(this);
    this.handleWheel = this.handleWheel.bind(this);
    this.handleTouchStart = this.handleTouchStart.bind(this);
    this.handleTouchMove = this.handleTouchMove.bind(this);
    this.handleTouchEnd = this.handleTouchEnd.bind(this);
    this.handleTouchCancel = this.handleTouchCancel.bind(this);
    this.handleClickZoom = this.handleClickZoom.bind(this);
    this.handleReCenter = this.handleReCenter.bind(this);
    this.handleContextMenu = this.handleContextMenu.bind(this);
    this.handleZoomBoxMouseDown = this.handleZoomBoxMouseDown.bind(this);
    this.handleZoomBoxMouseMove = this.handleZoomBoxMouseMove.bind(this);
    this.handleZoomBoxMouseUp = this.handleZoomBoxMouseUp.bind(this);
    this.handleVisibilityChange = this.handleVisibilityChange.bind(this);
    this.zoomTimeoutAction = this.zoomTimeoutAction.bind(this);
  }

  componentDidMount(): void {
    window.addEventListener("resize", this.handleResize);
    window.addEventListener("orientationchange", this.handleResize);
    window.addEventListener("visibilitychange", this.handleVisibilityChange, {
      passive: false,
    });

    if (this.zoomBoxWrapperRef) {
      this.zoomBoxWrapperRef.current?.addEventListener(
        "touchstart",
        (e) => {
          e.preventDefault();
          e.stopPropagation();
        },
        { passive: false }
      );
    }

    if (this.mainRef.current) {
      this.mainRef.current.addEventListener("wheel", this.handleWheel, {
        passive: false,
      });

      // this.mainRef.current.addEventListener(
      //   "contextmenu",
      //   this.handleContextMenu
      // );
    }
  }

  componentDidUpdate(
    prevProps: Readonly<ImagePanAndZoomProps>,
    prevState: Readonly<ImageZoomStateProps>,
    snapshot?: any
  ): void {
    if (
      prevProps.src !== this.props.src ||
      (prevProps.smallerSrc !== this.props.smallerSrc &&
        typeof this.props.smallerSrc === "string" &&
        this.props.smallerSrc.length > 0)
    ) {
      this.firstLoad = false;

      this.setState({
        ...this.state,
        removeImgSupport: false,
        zoomSupportImgLoaded: false,
        imgLoaded: false,
      });
    }

    if (
      prevState.panZoomActive !== this.state.panZoomActive &&
      this.state.panZoomActive
    ) {
      if (this.mainRef.current) {
        this.handleResize();
      }

      if (this.props.onPanZoomActivate && this.imgRef.current)
        this.props.onPanZoomActivate(true);

      if (this.largeImgFirstLoadTimeoutOuter)
        clearTimeout(this.largeImgFirstLoadTimeoutOuter);
      if (this.largeImgFirstLoadTimeoutInner)
        clearTimeout(this.largeImgFirstLoadTimeoutInner);

      if (
        this.imgSupportRef.current &&
        this.mainImgIntrinsicWidth > LARGE_IMAGE_LIMIT &&
        !this.firstLoad
      ) {
        /**
         * If we are displaying images above 10000 pixels in width this block of code will trigger. This code will briefly load the image used for pan/zoom at its full dimensions to improve the zooming experience else Chrome will have a noticeable lag when you enter the pan/zoom experience.
         */
        this.largeImgFirstLoadTimeoutOuter = setTimeout(() => {
          if (this.imgSupportRef.current) {
            this.imgSupportRef.current.style.display = "block";

            if (this.largeImgFirstLoadTimeoutInner)
              clearTimeout(this.largeImgFirstLoadTimeoutInner);

            this.largeImgFirstLoadTimeoutInner = setTimeout(() => {
              this.firstLoad = true;

              this.setState({
                ...this.state,
                removeImgSupport: true,
                zoomSupportImgLoaded: true,
              });
            }, 1000);
          }
        }, 2000);
      } else if (
        this.imgSupportRef.current &&
        this.mainImgIntrinsicWidth < LARGE_IMAGE_LIMIT &&
        !this.firstLoad
      ) {
        this.firstLoad = true;

        this.setState({
          ...this.state,
          removeImgSupport: true,
          zoomSupportImgLoaded: true,
        });
      }
    } else if (
      prevState.panZoomActive !== this.state.panZoomActive &&
      this.state.panZoomActive === false
    ) {
      if (this.largeImgFirstLoadTimeoutOuter) {
        clearTimeout(
          this.largeImgFirstLoadTimeoutOuter as ReturnType<typeof setTimeout>
        );
        this.largeImgFirstLoadTimeoutOuter = null;
      }

      this.hasUserZoomedToLoc = false;
      this.androidPrevWidth = 0;
      this.handleResize();
      this.handleReCenter();
    }
  }

  componentWillUnmount(): void {
    if (this.zoomTimeout) {
      clearTimeout(this.zoomTimeout as ReturnType<typeof setTimeout>);
      this.zoomTimeout = null;
    }

    if (this.mainRef.current) {
      this.mainRef.current.removeEventListener("wheel", this.handleWheel);
      this.mainRef.current.removeEventListener(
        "contextmenu",
        this.handleContextMenu
      );
    }

    window.removeEventListener("resize", this.handleResize);
    window.removeEventListener("orientationchange", this.handleResize);
    window.removeEventListener("visibilitychange", this.handleVisibilityChange);
  }

  handleResize(e?: Event) {
    if (
      this.mainRef.current &&
      this.imgRef.current &&
      this.wrapRef.current &&
      this.canvasClickRef.current
    ) {
      // Hack for android to prevent resize event from firing when keyboard is opened
      if (
        this.props.isAndroid &&
        this.state.panZoomActive &&
        this.androidPrevWidth === window.innerWidth
      ) {
        return;
      }

      if (!this.state.panZoomActive) {
        this.mainRef.current.style.height = "auto";
        this.imgRef.current.style.height = "auto";
        this.imgRef.current.style.width = "100%";
        this.imgRef.current.style.transform = "none";
        this.mainRef.current.style.height = `${this.imgRef.current.clientHeight}px`;
      } else {
        const _mainRect = this.mainRef.current.getBoundingClientRect();
        let curHeight = _mainRect.height;
        this.imgRef.current.style.transform = "none";
        this.imgRef.current.style.height = `${curHeight}px`;
        this.imgRef.current.style.width = "auto";
        if (!this.state.panZoomActive)
          this.mainRef.current.style.height = "auto";

        while (this.imgRef.current.width > _mainRect.width && curHeight >= 0) {
          curHeight -= 1;
          this.imgRef.current.style.height = `${curHeight}px`;
        }

        this.androidPrevWidth = window.innerWidth;
      }

      this.mainRefRect = this.mainRef.current.getBoundingClientRect();

      if (this.state.panZoomActive) {
        this.mainRefRect.height = window.innerHeight;
        this.mainRefRect.width = window.innerWidth;
      }

      this.pinchState.initImgWidth = this.imgRef.current.width;
      this.pinchState.initImgHeight = this.imgRef.current.height;

      this.pinchState.curWidth = this.pinchState.initImgWidth;
      this.pinchState.curHeight = this.pinchState.initImgHeight;

      const heightToRef = this.state.panZoomActive
        ? window.innerHeight
        : this.mainRefRect.height;

      const curX =
        this.imgRef.current.width < this.mainRefRect.width
          ? (this.mainRefRect.width - this.imgRef.current.width) / 2
          : 0;
      const curY =
        this.imgRef.current.height < heightToRef
          ? (heightToRef - this.imgRef.current.height) / 2
          : 0;

      this.imgRef.current.style.transform = "scale(1)";
      this.wrapRef.current.style.transition = "none";
      this.wrapRef.current.style.transform = `translate3d(${curX}px, ${curY}px, 0)`;

      this.canvasClickRef.current.style.transform = `translate3d(${curX}px, ${curY}px, 0)`;
      this.canvasClickRef.current.style.width = `${this.imgRef.current.width}px`;
      this.canvasClickRef.current.style.height = `${this.imgRef.current.height}px`;

      this.curPoint.x = curX;
      this.curPoint.y = curY;

      this.pinchState.curX = curX;
      this.pinchState.curY = curY;
      this.pinchState.zoomPercent = 0;
      this.pinchState.curZoomValue = 1;

      this.initState.x = curX;
      this.initState.y = curY;

      this.hasUserZoomedToLoc = false;
      this.zoomPercent = 0;
      this.isZooming = false;

      if (this.imgRefZoomBlur.current) {
        this.imgRefZoomBlur.current.style.transform = "scale(1)";
        this.imgRefZoomBlur.current.style.width =
          this.imgRef.current.style.width;
        this.imgRefZoomBlur.current.style.height =
          this.imgRef.current.style.height;
        this.imgRefZoomBlur.current.style.opacity = "1";
        this.imgRef.current.style.opacity = "0";
      }

      if (this.props.onResize) {
        this.props.onResize({
          x: this.curPoint.x,
          y: this.curPoint.y,
          width: this.imgRef.current.width,
          height: this.imgRef.current.height,
          fromWindowEvent: e !== undefined,
        });
      }
    }

    this.zoomBoxReset();
  }

  handleImageLoad() {
    if (this.state.imgLoaded) return;

    if (
      this.imgRef.current &&
      this.wrapRef.current &&
      this.canvasClickRef.current &&
      this.mainRef.current
    ) {
      this.mainImgIntrinsicWidth = this.imgRef.current.naturalWidth;

      this.handleResize();

      if (this.props.onImageLoad) {
        this.props.onImageLoad();
      }
    }

    if (this.largeImgFirstLoadTimeoutOuter)
      clearTimeout(this.largeImgFirstLoadTimeoutOuter);
    if (this.largeImgFirstLoadTimeoutInner)
      clearTimeout(this.largeImgFirstLoadTimeoutInner);

    // This will trigger if we set props.isPanZoomActive to true on initial load
    if (
      this.state.panZoomActive &&
      this.imgSupportRef.current &&
      this.mainImgIntrinsicWidth > LARGE_IMAGE_LIMIT &&
      !this.firstLoad
    ) {
      this.largeImgFirstLoadTimeoutOuter = setTimeout(() => {
        if (this.imgSupportRef.current) {
          this.imgSupportRef.current.style.display = "block";

          if (this.largeImgFirstLoadTimeoutInner)
            clearTimeout(this.largeImgFirstLoadTimeoutInner);

          this.largeImgFirstLoadTimeoutInner = setTimeout(() => {
            this.firstLoad = true;

            this.setState({
              ...this.state,
              removeImgSupport: true,
              zoomSupportImgLoaded: true,
              imgLoaded: true,
              imgError: false,
            });
          }, 1000);
        }
      }, 2000);
    } else if (
      this.state.panZoomActive &&
      this.imgSupportRef.current &&
      this.mainImgIntrinsicWidth < LARGE_IMAGE_LIMIT &&
      !this.firstLoad
    ) {
      this.firstLoad = true;

      this.setState({
        ...this.state,
        removeImgSupport: true,
        zoomSupportImgLoaded: true,
        imgLoaded: true,
        imgError: false,
      });
    } else {
      this.setState({
        ...this.state,
        imgLoaded: true,
        imgError: false,
      });
    }
  }

  handleLowResImageLoad() {
    if (this.imgRefZoomBlur.current) {
      this.lowResImgIntrinsicWidth = this.imgRefZoomBlur.current.naturalWidth;
    }
  }

  handleImageError() {
    this.setState({
      ...this.state,
      imgLoaded: false,
      imgError: true,
    });
  }

  handleZoomBoxMouseDown(e: React.MouseEvent<HTMLDivElement>) {
    if (
      this.props.disabled ||
      (e.type.toLowerCase() === "mouseenter" && !this.isZoomBoxPanning) ||
      e.button !== 0 ||
      !this.state.panZoomActive
    )
      return;

    if (
      this.zoomBoxWrapperRef.current &&
      this.zoomBoxRef.current &&
      this.wrapRef.current &&
      this.imgRef.current
    ) {
      this.cancelAnim(true);
      this.isZoomBoxPanning = true;
      this.zoomBoxWrapperRect =
        this.zoomBoxWrapperRef.current.getBoundingClientRect();
      this.zoomBoxRect = this.zoomBoxRef.current.getBoundingClientRect();

      const limitXOffset = this.props.limitXOffset ?? 0;
      const { limitX: limitXMain, limitY: limitYMain } = getBounds(
        {
          width: this.pinchState.curWidth,
          height: this.pinchState.curHeight,
        },
        this.mainRefRect
      );
      const { limitX: limitXZoom, limitY: limitYZoom } = getBounds(
        {
          width: this.zoomBoxState.initWidth,
          height: this.zoomBoxState.initHeight,
        },
        this.zoomBoxRect
      );

      let curX =
        e.clientX - this.zoomBoxWrapperRect.left - this.zoomBoxRect.width / 2;
      let curY =
        e.clientY - this.zoomBoxWrapperRect.top - this.zoomBoxRect.height / 2;

      let mainLocX =
        -curX * (this.pinchState.curWidth / this.zoomBoxState.initWidth);
      let mainLocY =
        -curY * (this.pinchState.curHeight / this.zoomBoxState.initHeight);

      if (curX > Math.abs(limitXZoom)) curX = Math.abs(limitXZoom);
      if (curX < 0) curX = 0;

      if (curY > Math.abs(limitYZoom)) curY = Math.abs(limitYZoom);
      if (curY < 0) curY = 0;

      if (mainLocX > limitXOffset) mainLocX = limitXOffset;
      if (mainLocX < limitXMain) mainLocX = limitXMain;

      if (mainLocY < limitYMain) mainLocY = limitYMain;
      if (mainLocY > 0)
        mainLocY =
          this.pinchState.curHeight < this.mainRefRect.height
            ? (this.mainRefRect.height - this.pinchState.curHeight) / 2
            : 0;

      this.curPointZoomBox.x = curX;
      this.curPointZoomBox.y = curY;
      this.curPoint.x = mainLocX;
      this.curPoint.y = mainLocY;

      this.zoomBoxRef.current.style.transform = `translate3d(${curX}px, ${curY}px, 0)`;
      this.wrapRef.current.style.transition = "none";
      this.wrapRef.current.style.transform = `translate3d(${mainLocX}px, ${mainLocY}px, 0)`;

      this.setState({
        ...this.state,
        mouseDown: true,
        mainRect: this.mainRefRect,
      });

      document.addEventListener("mouseup", this.handleZoomBoxMouseUp);
      document.addEventListener("mousemove", this.handleZoomBoxMouseMove);

      if (this.props.onPanStart) this.props.onPanStart();
    }
  }

  handleZoomBoxMouseMove(e: MouseEvent) {
    if (!this.isZoomBoxPanning) return;

    if (
      this.zoomBoxRect &&
      this.zoomBoxWrapperRect &&
      this.zoomBoxRef.current &&
      this.wrapRef.current &&
      this.state.mainRect
    ) {
      const limitXOffset = this.props.limitXOffset ?? 0;
      const { limitX: limitXMain, limitY: limitYMain } = getBounds(
        {
          width: this.pinchState.curWidth,
          height: this.pinchState.curHeight,
        },
        this.state.mainRect
      );
      const { limitX: limitXZoom, limitY: limitYZoom } = getBounds(
        {
          width: this.zoomBoxState.initWidth,
          height: this.zoomBoxState.initHeight,
        },
        this.zoomBoxRect
      );

      let curX = this.curPointZoomBox.x + e.movementX;
      let curY = this.curPointZoomBox.y + e.movementY;

      if (
        curX !==
        e.clientX - this.zoomBoxWrapperRect.left - this.zoomBoxRect.width / 2
      ) {
        curX =
          e.clientX - this.zoomBoxWrapperRect.left - this.zoomBoxRect.width / 2;
      }

      if (
        curY !==
        e.clientY - this.zoomBoxWrapperRect.top - this.zoomBoxRect.height / 2
      ) {
        curY =
          e.clientY - this.zoomBoxWrapperRect.top - this.zoomBoxRect.height / 2;
      }

      let mainLocX =
        -curX * (this.pinchState.curWidth / this.zoomBoxState.initWidth);
      let mainLocY =
        -curY * (this.pinchState.curHeight / this.zoomBoxState.initHeight);

      if (curX > Math.abs(limitXZoom)) curX = Math.abs(limitXZoom);
      if (curX < 0) curX = 0;

      if (curY > Math.abs(limitYZoom)) curY = Math.abs(limitYZoom);
      if (curY < 0) curY = 0;

      if (mainLocX > limitXOffset) mainLocX = limitXOffset;
      if (mainLocX < limitXMain) mainLocX = limitXMain;

      if (mainLocY < limitYMain) mainLocY = limitYMain;
      if (mainLocY > 0)
        mainLocY =
          this.pinchState.curHeight < this.mainRefRect.height
            ? (this.mainRefRect.height - this.pinchState.curHeight) / 2
            : 0;

      this.curPointZoomBox.x = curX;
      this.curPointZoomBox.y = curY;
      this.curPoint.x = mainLocX;
      this.curPoint.y = mainLocY;

      this.zoomBoxRef.current.style.transform = `translate3d(${curX}px, ${curY}px, 0)`;
      this.wrapRef.current.style.transition = "none";
      this.wrapRef.current.style.transform = `translate3d(${mainLocX}px, ${mainLocY}px, 0)`;

      if (this.props.onPanMove)
        this.props.onPanMove({
          x: this.curPoint.x,
          y: this.curPoint.y,
          width: this.pinchState.curWidth,
          height: this.pinchState.curHeight,
        });
    }
  }

  handleZoomBoxMouseUp() {
    document.removeEventListener("mouseup", this.handleZoomBoxMouseUp);
    document.removeEventListener("mousemove", this.handleZoomBoxMouseMove);

    this.isZoomBoxPanning = false;

    this.setState({
      ...this.state,
      mouseDown: false,
    });

    if (this.props.onPanEnd) this.props.onPanEnd();
  }

  handleMouseDown(e: React.MouseEvent<HTMLDivElement>) {
    if (
      this.props.disabled ||
      e.button !== 0 ||
      this.isZooming ||
      this.state.touchStart ||
      !this.state.panZoomActive
    )
      return;

    if (
      Array.isArray(this.props.elementBlockPanAndZoom) &&
      this.props.elementBlockPanAndZoom.length > 0
    ) {
      // eslint-disable-next-line no-restricted-syntax
      for (const wheelEle of this.props.elementBlockPanAndZoom) {
        if (wheelEle.current?.contains?.(e.target as Node)) {
          return;
        }
      }
    }

    this.cancelAnim(true);

    if (this.zoomTimeout) {
      clearTimeout(this.zoomTimeout as ReturnType<typeof setTimeout>);
      this.zoomTimeoutAction(
        this.imgRef.current?.getBoundingClientRect()?.width
      );
    }

    if (
      this.wrapRef.current &&
      this.mainRef.current &&
      this.imgRef.current &&
      !this.state.touchStart
    ) {
      this.wrapRef.current.style.transition = "none";

      this.isPanning = true;
      this.didUserPan = false;
      this.isZooming = false;

      this.velocityState.initPoint = {
        x: this.prevPoint.x - this.curPoint.x,
        y: this.prevPoint.y - this.curPoint.y,
      };

      this.setState({
        ...this.state,
        mouseDown: true,
        mainRect: this.mainRefRect,
      });

      if (this.props.onPanStart) this.props.onPanStart();
    }
  }

  handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    e.preventDefault();

    if (
      this.props.disabled ||
      this.state.touchStart ||
      !this.state.panZoomActive
    )
      return;

    if (
      this.state.mainRect &&
      this.isPanning &&
      this.wrapRef.current &&
      this.mainRef.current &&
      this.canvasClickRef.current
    ) {
      this.mainRef.current.classList.add("is-panning");

      this.prevPoint.x = e.clientX;
      this.prevPoint.y = e.clientY;

      const limitXOffset = this.props.limitXOffset ?? 0;
      const limitYOffset = 0;
      const { limitX, limitY } = getBounds(
        {
          width: this.pinchState.curWidth,
          height: this.pinchState.curHeight,
        },
        this.state.mainRect
      );

      let curX = this.curPoint.x + e.movementX;
      let curY = this.curPoint.y + e.movementY;

      if (curX > limitXOffset) curX = limitXOffset;
      if (curX < limitX) curX = limitX;

      if (curY < limitY) curY = limitY;
      if (curY > limitYOffset)
        curY =
          this.pinchState.curHeight < this.mainRefRect.height
            ? (this.mainRefRect.height - this.pinchState.curHeight) / 2
            : limitYOffset;

      this.didUserPan = true;
      this.curPoint.x = curX;
      this.curPoint.y = curY;

      this.calcVelocity(curX, curY);

      this.wrapRef.current.style.transition = "none";
      this.wrapRef.current.style.transform = `translate3d(${curX}px, ${curY}px, 0)`;

      this.canvasClickRef.current.style.transform = `translate3d(${curX}px, ${curY}px, 0) scaleX(${
        this.pinchState.curWidth / this.pinchState.initImgWidth
      }) scaleY(${this.pinchState.curHeight / this.pinchState.initImgHeight})`;

      if (this.didUserPan) this.zoomBoxMove(curX, curY);

      if (this.didUserPan && this.props.onPanMove)
        this.props.onPanMove({
          x: this.curPoint.x,
          y: this.curPoint.y,
          width: this.pinchState.curWidth,
          height: this.pinchState.curHeight,
        });
    }
  }

  handleMouseUp(e: React.MouseEvent<HTMLDivElement>) {
    if (this.props.disabled || !this.state.panZoomActive) return;

    if (this.isPanning && this.mainRef.current && !this.state.touchStart) {
      this.mainRef.current.classList.remove("is-panning");

      this.animState.anim = null;
      this.animState.raf = null;

      if (this.didUserPan) {
        const moveAnimationTime = 400 * this.velocityState.velocity * 1;
        const finalAnimationTime = Math.max(moveAnimationTime, 500);
        const startTime = new Date().getTime();

        if (Math.abs(this.velocityState.velocity) > 0.05) {
          this.setupAnim(finalAnimationTime, () => {
            if (
              !this.mainRef.current ||
              !this.imgRef.current ||
              !this.wrapRef.current ||
              !this.canvasClickRef.current
            )
              return;

            const alignStep =
              1 - Math.min(1, (new Date().getTime() - startTime) / 500);
            const { limitX, limitY } = getBounds(
              {
                width: this.pinchState.curWidth,
                height: this.pinchState.curHeight,
              },
              this.mainRefRect
            );
            const limitXOffset = this.props.limitXOffset ?? 0;
            const limitYOffset = 0;

            let curX =
              this.curPoint.x + this.velocityState.velocityX * alignStep;
            let curY =
              this.curPoint.y + this.velocityState.velocityY * alignStep;

            if (curX > limitXOffset) curX = limitXOffset;
            if (curX < limitX) curX = limitX;

            if (curY < limitY) curY = limitY;
            if (curY > limitYOffset)
              curY =
                this.pinchState.curHeight < this.mainRefRect.height
                  ? (this.mainRefRect.height - this.pinchState.curHeight) / 2
                  : limitYOffset;

            this.wrapRef.current.style.transition = "none";
            this.wrapRef.current.style.transform = `translate3d(${curX}px, ${curY}px, 0)`;

            this.canvasClickRef.current.style.transform = `translate3d(${curX}px, ${curY}px, 0) scaleX(${
              this.pinchState.curWidth / this.pinchState.initImgWidth
            }) scaleY(${
              this.pinchState.curHeight / this.pinchState.initImgHeight
            })`;

            this.prevPoint.x = this.curPoint.x;
            this.prevPoint.y = this.curPoint.y;

            this.curPoint.x = curX;
            this.curPoint.y = curY;

            this.zoomBoxMove(curX, curY);

            if (this.props.onPanMove)
              this.props.onPanMove({
                x: this.curPoint.x,
                y: this.curPoint.y,
                width: this.pinchState.curWidth,
                height: this.pinchState.curHeight,
              });
          });
        } else if (this.props.onPanEnd && this.imgRef.current) {
          this.props.onPanEnd();
        }
      } else if (
        this.mainRef.current &&
        this.imgRef.current &&
        this.props.onCanvasClick &&
        e.target === this.canvasClickRef.current
      ) {
        const _imgRect = this.imgRef.current?.getBoundingClientRect();
        let limitXOffset = this.props.limitXOffset || 0;
        const limitYOffset = 0;

        if (_imgRect.width + limitXOffset * 2 < this.mainRefRect.width)
          limitXOffset = 0;
        const curX =
          this.mainRefRect.width < _imgRect.width || limitXOffset !== 0
            ? (Math.abs(_imgRect.x - limitXOffset) + e.clientX - limitXOffset) /
              _imgRect.width
            : (Math.abs(_imgRect.x - limitXOffset) +
                e.clientX -
                limitXOffset -
                (this.mainRefRect.width - _imgRect.width)) /
              _imgRect.width;
        const curY =
          this.mainRefRect.height < _imgRect.height
            ? (Math.abs(_imgRect.y - limitYOffset) + e.clientY - limitYOffset) /
              _imgRect.height
            : (Math.abs(_imgRect.y - limitYOffset) +
                e.clientY -
                limitYOffset -
                (this.mainRefRect.height - _imgRect.height)) /
              _imgRect.height;

        this.props.onCanvasClick({
          x: curX,
          y: curY,
          width: _imgRect.width,
          height: _imgRect.height,
        });
      }
    }

    this.isPanning = false;
    this.didUserPan = false;
    this.isZooming = false;

    this.setState({
      ...this.state,
      mouseDown: false,
      touchStart: false,
    });
  }

  handleWheel(e: WheelEvent) {
    if (
      Array.isArray(this.props.elementBlockPanAndZoom) &&
      this.props.elementBlockPanAndZoom.length > 0
    ) {
      // eslint-disable-next-line no-restricted-syntax
      for (const wheelEle of this.props.elementBlockPanAndZoom) {
        if (wheelEle.current?.contains?.(e.target as Node)) {
          return;
        }
      }
    }

    if (
      !e.target ||
      this.isPanning ||
      !this.imgRef.current ||
      !this.wrapRef.current ||
      !this.state.panZoomActive ||
      this.props.disabled ||
      (this.state.panZoomActive &&
        !this.state.zoomSupportImgLoaded &&
        !this.firstLoad)
    )
      return;

    e.preventDefault();

    this.cancelAnim(true);

    // @ts-ignore
    const isTrackPadScroll = e.wheelDeltaY === e.deltaY * -3;
    const delta = e.deltaY < 0 ? -1 : 1;
    const scaleAmount =
      isTrackPadScroll || e.ctrlKey ? 1.0 - delta / 40 : 1.0 - delta / 15;
    const currentSize = Math.round(this.pinchState.curWidth);
    const initImgWidth = Math.round(this.pinchState.initImgWidth);
    const _wrapperRect = this.wrapRef.current.getBoundingClientRect();
    const relResizePosX =
      (e.clientX - _wrapperRect.left) / this.pinchState.curWidth;
    const relResizePosY =
      (e.clientY - _wrapperRect.top) / this.pinchState.curHeight;

    if (
      (currentSize < this.mainImgIntrinsicWidth &&
        scaleAmount > 1 &&
        this.pinchState.zoomPercent < 100) ||
      (scaleAmount < 1 && currentSize > initImgWidth)
    ) {
      this.wheelResize(scaleAmount, relResizePosX, relResizePosY);
    }
  }

  handleTouchStart(e: React.TouchEvent<HTMLDivElement>) {
    if (
      this.props.disabled ||
      this.state.mouseDown ||
      !this.state.panZoomActive
    )
      return;

    if (
      Array.isArray(this.props.elementBlockPanAndZoom) &&
      this.props.elementBlockPanAndZoom.length > 0
    ) {
      // eslint-disable-next-line no-restricted-syntax
      for (const wheelEle of this.props.elementBlockPanAndZoom) {
        if (wheelEle.current?.contains?.(e.target as Node)) {
          return;
        }
      }
    }

    if (this.zoomTimeout) {
      clearTimeout(this.zoomTimeout as ReturnType<typeof setTimeout>);
      this.zoomTimeoutAction(
        this.imgRef.current?.getBoundingClientRect()?.width
      );
    }

    this.cancelAnim(true);

    if (
      this.wrapRef.current &&
      this.mainRef.current &&
      this.imgRef.current &&
      !this.state.mouseDown
    ) {
      this.wrapRef.current.style.transition = "none";

      this.didUserPan = false;

      this.velocityState.initPoint = {
        x: this.prevPoint.x - this.curPoint.x,
        y: this.prevPoint.y - this.curPoint.y,
      };

      if (e.touches.length === 1) {
        this.isPanning = true;

        this.prevPoint.x = e.touches[0].clientX;
        this.prevPoint.y = e.touches[0].clientY;

        this.isZooming = false;

        this.setState({
          ...this.state,
          mainRect: this.mainRefRect,
          touchStart: true,
        });

        if (this.props.onPanStart) this.props.onPanStart();
      } else if (e.touches.length === 2) {
        this.isPanning = false;

        const x0 = e.touches[0].clientX;
        const y0 = e.touches[0].clientY;
        const x1 = e.touches[1].clientX;
        const y1 = e.touches[1].clientY;

        this.pinchState.centerPointStartX = (x0 + x1) / 2.0;
        this.pinchState.centerPointStartY = (y0 + y1) / 2.0;

        this.pinchState.percentageOfPinchPointX =
          (this.pinchState.centerPointStartX - this.curPoint.x) /
          this.pinchState.curWidth;
        this.pinchState.percentageOfPinchPointY =
          (this.pinchState.centerPointStartY - this.curPoint.y) /
          this.pinchState.curHeight;

        this.pinchState.startDistanceBetweenFingers = Math.sqrt(
          (x1 - x0) ** 2 + (y1 - y0) ** 2
        );

        this.isZooming = true;

        this.setState({
          ...this.state,
          mainRect: this.mainRefRect,
          touchStart: true,
        });
      }
    }
  }

  handleTouchMove(e: React.TouchEvent<HTMLDivElement>) {
    if (
      this.props.disabled ||
      this.state.mouseDown ||
      !this.state.panZoomActive
    )
      return;

    if (
      this.isPanning &&
      this.state.mainRect &&
      this.wrapRef.current &&
      this.mainRef.current &&
      this.canvasClickRef.current
    ) {
      this.mainRef.current.classList.add("is-panning");

      const { clientX } = e.touches[0];
      const { clientY } = e.touches[0];
      const { limitX, limitY } = getBounds(
        {
          width: this.pinchState.curWidth,
          height: this.pinchState.curHeight,
        },
        this.state.mainRect
      );

      let curX = this.curPoint.x + (clientX - this.prevPoint.x);
      let curY = this.curPoint.y + (clientY - this.prevPoint.y);
      const limitXOffset = this.props.limitXOffset ?? 0;
      const limitYOffset = 0;

      if (curX > limitXOffset) curX = limitXOffset;
      if (curX < limitX) curX = limitX;

      if (curY < limitY) curY = limitY;
      if (curY > limitYOffset)
        curY =
          this.pinchState.curHeight < this.mainRefRect.height
            ? (this.mainRefRect.height - this.pinchState.curHeight) / 2
            : limitYOffset;

      this.prevPoint.x = clientX;
      this.prevPoint.y = clientY;

      this.didUserPan = true;
      this.curPoint.x = curX;
      this.curPoint.y = curY;

      this.calcVelocity(curX, curY);

      this.wrapRef.current.style.transition = "none";
      this.wrapRef.current.style.transform = `translate3d(${curX}px, ${curY}px, 0)`;

      this.canvasClickRef.current.style.transform = `translate3d(${curX}px, ${curY}px, 0) scaleX(${
        this.pinchState.curWidth / this.pinchState.initImgWidth
      }) scaleY(${this.pinchState.curHeight / this.pinchState.initImgHeight})`;

      if (this.didUserPan) this.zoomBoxMove(curX, curY);

      if (this.didUserPan && this.props.onPanMove)
        this.props.onPanMove({
          x: this.curPoint.x,
          y: this.curPoint.y,
          width: this.pinchState.curWidth,
          height: this.pinchState.curHeight,
        });
    } else if (
      this.isZooming &&
      this.wrapRef.current &&
      this.imgRef.current &&
      this.mainRef.current &&
      this.canvasClickRef.current
    ) {
      const x0 = e.touches[0].clientX;
      const y0 = e.touches[0].clientY;
      const x1 = e.touches[1].clientX;
      const y1 = e.touches[1].clientY;
      const newZoomValue =
        (Math.sqrt((x1 - x0) ** 2 + (y1 - y0) ** 2) /
          this.pinchState.startDistanceBetweenFingers) *
        this.pinchState.curZoomValue;
      const _zoomPercent =
        ((this.pinchState.initImgWidth * newZoomValue -
          this.pinchState.initImgWidth) *
          100) /
        (this.mainImgIntrinsicWidth - this.pinchState.initImgWidth);

      this.pinchState.newZoomValue =
        _zoomPercent >= 100
          ? this.mainImgIntrinsicWidth / this.pinchState.initImgWidth
          : _zoomPercent <= 0
          ? 1
          : newZoomValue;
      this.pinchState.newWidth =
        this.pinchState.initImgWidth * this.pinchState.newZoomValue;
      this.pinchState.newHeight =
        this.pinchState.initImgHeight * this.pinchState.newZoomValue;

      this.pinchState.curX =
        this.curPoint.x +
        (this.pinchState.curWidth - this.pinchState.newWidth) *
          this.pinchState.percentageOfPinchPointX +
        ((x0 + x1) / 2.0 - this.pinchState.centerPointStartX);
      this.pinchState.curY =
        this.curPoint.y +
        (this.pinchState.curHeight - this.pinchState.newHeight) *
          this.pinchState.percentageOfPinchPointY +
        ((y0 + y1) / 2.0 - this.pinchState.centerPointStartY);

      if (this.imgRefZoomBlur.current) {
        this.imgRef.current.style.opacity = "0";
        this.imgRefZoomBlur.current.style.transform = `scale(${
          this.pinchState.newWidth / this.pinchState.initImgWidth
        })`;
        this.imgRefZoomBlur.current.style.opacity = "1";
      }

      this.imgRef.current.style.transform = `scale(${
        this.pinchState.newWidth / this.pinchState.initImgWidth
      })`;

      const _imgRect = this.imgRef.current.getBoundingClientRect();
      const { limitX, limitY } = getBounds(_imgRect, this.mainRefRect);
      const limitXOffset = this.props.limitXOffset ?? 0;
      const limitYOffset = 0;

      if (this.pinchState.curX > limitXOffset)
        this.pinchState.curX = limitXOffset;
      if (this.pinchState.curX < limitX) this.pinchState.curX = limitX;

      if (this.pinchState.curY < limitY) this.pinchState.curY = limitY;
      if (this.pinchState.curY > limitYOffset)
        this.pinchState.curY =
          _imgRect.height < this.mainRefRect.height
            ? (this.mainRefRect.height - _imgRect.height) / 2
            : limitYOffset;

      this.wrapRef.current.style.transition = "none";
      this.wrapRef.current.style.transform = `translate3d(${this.pinchState.curX}px, ${this.pinchState.curY}px, 0) rotate(0deg)`;
      this.canvasClickRef.current.style.display = "none";

      const finalZoomPercent =
        _zoomPercent >= 100 ? 100 : _zoomPercent <= 0 ? 0 : _zoomPercent;

      this.pinchState.zoomPercent = finalZoomPercent;

      this.zoomPercent = finalZoomPercent;

      if (this.zoomPercentRef.current) {
        this.zoomPercentRef.current.style.opacity = "1";
        this.zoomPercentRef.current.innerText = `Zoom: ${this.zoomPercent.toFixed(
          2
        )}%`;
      }

      this.zoomBoxMove(this.pinchState.curX, this.pinchState.curY, _imgRect);

      if (this.props.onZoom) this.props.onZoom();
    }
  }

  handleTouchEnd(e: React.TouchEvent<HTMLDivElement>) {
    if (
      this.props.disabled ||
      this.state.mouseDown ||
      !this.state.panZoomActive
    )
      return;

    if (this.isPanning && this.mainRef.current) {
      this.mainRef.current.classList.remove("is-panning");

      this.animState.anim = null;
      this.animState.raf = null;

      if (this.didUserPan) {
        const moveAnimationTime = 400 * this.velocityState.velocity * 1;
        const finalAnimationTime = Math.max(moveAnimationTime, 500);
        const startTime = new Date().getTime();

        if (Math.abs(this.velocityState.velocity) > 0.05) {
          this.setupAnim(finalAnimationTime, () => {
            if (
              !this.mainRef.current ||
              !this.imgRef.current ||
              !this.wrapRef.current ||
              !this.canvasClickRef.current
            )
              return;

            const alignStep =
              1 - Math.min(1, (new Date().getTime() - startTime) / 500);
            const limitX =
              this.mainRefRect.width < this.pinchState.curWidth
                ? this.mainRefRect.width - this.pinchState.curWidth
                : (this.mainRefRect.width - this.pinchState.curWidth) / 2;
            const limitY = this.mainRefRect.height - this.pinchState.curHeight;
            const limitXOffset = this.props.limitXOffset ?? 0;
            const limitYOffset = 0;

            let curX =
              this.curPoint.x + this.velocityState.velocityX * alignStep;
            let curY =
              this.curPoint.y + this.velocityState.velocityY * alignStep;

            if (curX > limitXOffset) curX = limitXOffset;
            if (curX < limitX) curX = limitX;

            if (curY < limitY) curY = limitY;
            if (curY > limitYOffset)
              curY =
                this.pinchState.curHeight < this.mainRefRect.height
                  ? (this.mainRefRect.height - this.pinchState.curHeight) / 2
                  : limitYOffset;

            this.wrapRef.current.style.transition = "none";
            this.wrapRef.current.style.transform = `translate3d(${curX}px, ${curY}px, 0)`;

            this.canvasClickRef.current.style.transform = `translate3d(${curX}px, ${curY}px, 0) scaleX(${
              this.pinchState.curWidth / this.pinchState.initImgWidth
            }) scaleY(${
              this.pinchState.curHeight / this.pinchState.initImgHeight
            })`;

            this.prevPoint.x = this.curPoint.x;
            this.prevPoint.y = this.curPoint.y;

            this.curPoint.x = curX;
            this.curPoint.y = curY;

            this.zoomBoxMove(curX, curY);

            if (this.props.onPanMove)
              this.props.onPanMove({
                x: this.curPoint.x,
                y: this.curPoint.y,
                width: this.pinchState.curWidth,
                height: this.pinchState.curHeight,
              });
          });
        } else if (this.props.onPanEnd) {
          this.props.onPanEnd();
        }
      } else if (
        !this.isZooming &&
        this.mainRef.current &&
        this.imgRef.current &&
        this.props.onCanvasClick &&
        e.target === this.canvasClickRef.current
      ) {
        const _imgRect = this.imgRef.current?.getBoundingClientRect();
        let limitXOffset = this.props.limitXOffset || 0;
        const limitYOffset = 0;

        if (_imgRect.width + limitXOffset * 2 < this.mainRefRect.width)
          limitXOffset = 0;

        const curX =
          this.mainRefRect.width < _imgRect.width || limitXOffset !== 0
            ? (Math.abs(_imgRect.x - limitXOffset) +
                e.changedTouches[0].clientX -
                limitXOffset) /
              _imgRect.width
            : (Math.abs(_imgRect.x - limitXOffset) +
                e.changedTouches[0].clientX -
                limitXOffset -
                (this.mainRefRect.width - _imgRect.width)) /
              _imgRect.width;
        const curY =
          this.mainRefRect.height < _imgRect.height
            ? (Math.abs(_imgRect.y - limitYOffset) +
                e.changedTouches[0].clientY -
                limitYOffset) /
              _imgRect.height
            : (Math.abs(_imgRect.y - limitYOffset) +
                e.changedTouches[0].clientY -
                limitYOffset -
                (this.mainRefRect.height - _imgRect.height)) /
              _imgRect.height;

        this.props.onCanvasClick({
          x: curX,
          y: curY,
          width: _imgRect.width,
          height: _imgRect.height,
        });
      }
    } else if (
      this.isZooming &&
      this.mainRef.current &&
      this.wrapRef.current &&
      this.imgRef.current &&
      this.canvasClickRef.current
    ) {
      const _imgRect = (this.imgRefZoomBlur.current ||
        this.imgRef.current)!.getBoundingClientRect();
      const { limitX, limitY } = getBounds(_imgRect, this.mainRefRect);
      const limitXOffset = this.props.limitXOffset ?? 0;
      const limitYOffset = 0;

      if (this.pinchState.curX > limitXOffset)
        this.pinchState.curX = limitXOffset;
      if (this.pinchState.curX < limitX) this.pinchState.curX = limitX;

      if (this.pinchState.curY < limitY) this.pinchState.curY = limitY;
      if (this.pinchState.curY > limitYOffset)
        this.pinchState.curY =
          _imgRect.height < this.mainRefRect.height
            ? (this.mainRefRect.height - _imgRect.height) / 2
            : limitYOffset;

      this.wrapRef.current.style.transition = "none";
      this.wrapRef.current.style.transform = `translate3d(${this.pinchState.curX}px, ${this.pinchState.curY}px, 0) rotate(0deg)`;

      this.canvasClickRef.current.style.display = "block";
      this.canvasClickRef.current.style.transform = `translate3d(${
        this.pinchState.curX
      }px, ${this.pinchState.curY}px, 0) scaleX(${
        _imgRect.width / this.pinchState.initImgWidth
      }) scaleY(${_imgRect.height / this.pinchState.initImgHeight})`;

      this.pinchState.curWidth = this.pinchState.newWidth;
      this.pinchState.curHeight = this.pinchState.newHeight;
      this.pinchState.curZoomValue = this.pinchState.newZoomValue;

      this.curPoint.x = this.pinchState.curX;
      this.curPoint.y = this.pinchState.curY;

      if (this.zoomPercentRef.current)
        this.zoomPercentRef.current.style.opacity = "0";

      if (this.imgRefZoomBlur.current) {
        this.imgRef.current.style.transform =
          this.imgRefZoomBlur.current.style.transform;
        if (_imgRect.width > this.lowResImgIntrinsicWidth) {
          this.imgRef.current.style.opacity = "1";
          this.imgRefZoomBlur.current.style.opacity = "0";
        }
      }

      if (this.props.onPanMove)
        this.props.onPanMove({
          x: this.curPoint.x,
          y: this.curPoint.y,
          width: this.pinchState.curWidth,
          height: this.pinchState.curHeight,
        });

      if (this.props.onZoomEnd) {
        this.props.onZoomEnd({
          x: this.pinchState.curX,
          y: this.pinchState.curY,
          width: this.pinchState.curWidth,
          height: this.pinchState.curHeight,
          zoomValue: this.pinchState.curZoomValue,
        });
      }
    }

    this.isPanning = false;
    this.didUserPan = false;
    this.isZooming = false;
  }

  handleTouchCancel() {
    this.isPanning = false;
    this.didUserPan = false;
    this.isZooming = false;
    this.setState({
      ...this.state,
      mouseDown: false,
      touchStart: false,
    });
  }

  handleClickZoom(zoomIn = false) {
    return (e?: React.MouseEvent<HTMLButtonElement>) => {
      if (this.props.disabled) return;

      e?.stopPropagation();

      if (this.imgRef.current && this.mainRef.current && this.wrapRef.current) {
        this.cancelAnim(true);

        const scaleAmount = zoomIn ? 1.1 : 0.9;
        const currentSize = this.pinchState.curWidth;
        const _wrapperRect = this.wrapRef.current.getBoundingClientRect();
        const relResizePosX =
          (this.mainRefRect.width / 2 - _wrapperRect.left) /
          this.pinchState.curWidth;
        const relResizePosY =
          (this.mainRefRect.height / 2 - _wrapperRect.top) /
          this.pinchState.curHeight;

        if (
          (currentSize < this.mainImgIntrinsicWidth && scaleAmount > 1) ||
          (scaleAmount < 1 && currentSize > this.pinchState.initImgWidth)
        ) {
          this.wheelResize(scaleAmount, relResizePosX, relResizePosY);
        }
      }
    };
  }

  handleReCenter() {
    if (
      !this.props.disabled &&
      this.wrapRef.current &&
      this.imgRef.current &&
      this.canvasClickRef.current &&
      this.mainRef.current
    ) {
      if (this.pinchState.zoomPercent !== 0) {
        this.cancelAnim();

        this.pinchState.curWidth = this.pinchState.initImgWidth;
        this.pinchState.curHeight = this.pinchState.initImgHeight;

        this.pinchState.zoomPercent = 0;
        this.pinchState.curZoomValue = 1;

        this.imgRef.current.style.height = `${this.pinchState.curHeight}px`;
        this.imgRef.current.style.width = "auto";
        this.imgRef.current.style.transform = "none";

        if (this.imgRefZoomBlur.current) {
          this.imgRefZoomBlur.current.style.transform = "none";
          this.imgRefZoomBlur.current.style.height =
            this.imgRef.current.style.height;
          this.imgRefZoomBlur.current.style.width =
            this.imgRef.current.style.width;
          this.imgRefZoomBlur.current.style.opacity = "1";
          this.imgRef.current.style.opacity = "0";
        }

        this.curPoint.x = this.pinchState.curX = this.initState.x;
        this.curPoint.y = this.pinchState.curY = this.initState.y;

        this.wrapRef.current.style.transition = "none";
        this.wrapRef.current.style.transform = `translate3d(${this.curPoint.x}px, ${this.curPoint.y}px, 0)`;

        this.canvasClickRef.current.style.width = `${this.imgRef.current.width}px`;
        this.canvasClickRef.current.style.height = `${this.imgRef.current.height}px`;
        this.canvasClickRef.current.style.transform =
          this.wrapRef.current.style.transform;

        this.zoomPercent = 0;
        this.isZooming = false;

        if (this.zoomTimeout) {
          clearTimeout(this.zoomTimeout as ReturnType<typeof setTimeout>);
          this.zoomTimeout = null;
        }

        this.zoomBoxReset();

        if (this.props.onZoomEnd) {
          this.props.onZoomEnd({
            x: this.pinchState.curX,
            y: this.pinchState.curY,
            width: this.pinchState.curWidth,
            height: this.pinchState.curHeight,
            zoomValue: 0,
          });
        }
      }
    }
  }

  handleVisibilityChange() {
    if (this.firstLoad) {
      if (document.hidden) {
        this.setState(
          {
            ...this.state,
            removeImgSupport: false,
          },
          () => {
            if (this.imgSupportRef.current) {
              this.imgSupportRef.current.style.display = "block";
            }
          }
        );
      } else {
        setTimeout(() => {
          this.setState({
            ...this.state,
            removeImgSupport: true,
          });
        }, 100);
      }
    }
  }

  handleContextMenu(e: MouseEvent) {
    e.preventDefault();
  }

  setupAnim(finalAnimTime: number, callback: () => void) {
    const startTime = new Date().getTime();

    this.cancelAnim();

    this.animState.raf = () => {
      const frameTime = new Date().getTime() - startTime;

      if (
        frameTime >= finalAnimTime ||
        this.isPanning ||
        (this.prevPoint.x === this.curPoint.x &&
          this.prevPoint.y === this.curPoint.y)
      ) {
        callback.bind(this)();

        this.animState.raf = null;
        this.animState.anim = null;

        if (this.props.onPanEnd && this.imgRef.current) {
          this.props.onPanEnd();
        }
      } else if (this.animState.raf) {
        callback.bind(this)();

        this.animState.anim = requestAnimationFrame(this.animState.raf);
      }
    };

    this.animState.anim = requestAnimationFrame(this.animState.raf);
  }

  cancelAnim(resetVelocity = false) {
    if (typeof this.animState.anim === "number") {
      cancelAnimationFrame(this.animState.anim);
      this.animState.anim = null;
      this.animState.raf = null;
    }

    if (resetVelocity) {
      this.velocityState.initPoint = { x: 0, y: 0 };
      this.velocityState.lastPos = { x: 0, y: 0 };
      this.velocityState.velocityTime = 0;
      this.velocityState.velocityX = 0;
      this.velocityState.velocityY = 0;
      this.velocityState.velocity = 0;
    }
  }

  calcVelocity(x: number, y: number) {
    const now = Date.now();
    const velState = this.velocityState;

    if (
      velState.lastPos.x &&
      velState.lastPos.y &&
      velState.velocityTime &&
      this.imgRef.current &&
      this.mainRef.current
    ) {
      const sizeMultiplier = 1;

      const distanceX = x - velState.lastPos.x;
      const distanceY = y - velState.lastPos.y;

      const velocityX = distanceX / sizeMultiplier;
      const velocityY = distanceY / sizeMultiplier;

      const interval = now - velState.velocityTime;
      const speed = distanceX * distanceX + distanceY * distanceY;
      const velocity = Math.sqrt(speed) / interval;

      velState.velocityX = velocityX;
      velState.velocityY = velocityY;
      velState.velocity = velocity;
    }

    velState.lastPos = { x, y };
    velState.velocityTime = now;
  }

  wheelResize(
    scaleAmount: number,
    relResizePosX: number,
    relResizePosY: number
  ) {
    if (
      this.props.disabled ||
      !this.imgRef.current ||
      !this.wrapRef.current ||
      !this.mainRef.current ||
      !this.canvasClickRef.current
    )
      return;

    if (this.zoomTimeout) {
      clearTimeout(this.zoomTimeout as ReturnType<typeof setTimeout>);
      this.zoomTimeout = null;
    }

    const oldWidth = this.pinchState.curWidth;

    const oldHeight = this.pinchState.curHeight;
    let newWidth = scaleAmount * oldWidth;

    if (newWidth > this.mainImgIntrinsicWidth)
      newWidth = this.mainImgIntrinsicWidth;

    if (newWidth < this.pinchState.initImgWidth)
      newWidth = this.pinchState.initImgWidth;

    if (this.imgRefZoomBlur.current) {
      this.imgRef.current.style.opacity = "0";
      this.imgRefZoomBlur.current.style.transform = `scale(${
        newWidth / this.pinchState.initImgWidth
      })`;
      this.imgRefZoomBlur.current.style.opacity = "1";
    } else {
      this.imgRef.current.style.transform = `scale(${
        newWidth / this.pinchState.initImgWidth
      })`;
    }

    let _imgRect = this.imgRefZoomBlur.current
      ? this.imgRefZoomBlur.current.getBoundingClientRect()
      : this.imgRef.current.getBoundingClientRect();
    const _wrapperRect = this.wrapRef.current.getBoundingClientRect();
    const resizeFract = (newWidth - oldWidth) / oldWidth;

    let curX =
      -oldWidth * resizeFract * relResizePosX +
      (_wrapperRect.left - this.mainRefRect.left);
    let curY =
      -oldHeight * resizeFract * relResizePosY +
      (_wrapperRect.top - this.mainRefRect.top);

    const { limitX, limitY } = getBounds(
      {
        width: newWidth,
        height: _imgRect.height,
      },
      this.mainRefRect
    );

    const limitXOffset = this.props.limitXOffset ?? 0;
    const limitYOffset = 0;

    if (curX > limitXOffset) curX = limitXOffset;
    if (curX < limitX) curX = limitX;

    if (curY < limitY) curY = limitY;
    if (curY > limitYOffset)
      curY =
        _imgRect.height < this.mainRefRect.height
          ? (this.mainRefRect.height - _imgRect.height) / 2
          : limitYOffset;

    this.curPoint.x = curX;
    this.curPoint.y = curY;

    this.pinchState.curX = curX;
    this.pinchState.curY = curY;
    this.pinchState.curWidth = newWidth;
    this.pinchState.curHeight = _imgRect.height;

    this.pinchState.curZoomValue =
      this.pinchState.curWidth / this.pinchState.initImgWidth;

    this.wrapRef.current.style.transition = "none";
    this.wrapRef.current.style.transform = `translate3d(${curX}px, ${curY}px, 0) rotate(0deg)`;

    this.canvasClickRef.current.style.transform = `translate3d(${curX}px, ${curY}px, 0) scale(${
      this.pinchState.curWidth / this.pinchState.initImgWidth
    },
      ${this.pinchState.curHeight / this.pinchState.initImgHeight})`;

    const curZoomPercent =
      ((newWidth - this.pinchState.initImgWidth) * 100) /
      (this.mainImgIntrinsicWidth - this.pinchState.initImgWidth);

    this.pinchState.zoomPercent = curZoomPercent;
    this.zoomPercent = curZoomPercent;
    this.isZooming = true;

    if (this.zoomPercentRef.current) {
      this.zoomPercentRef.current.style.opacity = "1";
      this.zoomPercentRef.current.innerText = `Zoom: ${this.zoomPercent.toFixed(
        2
      )}%`;
    }

    this.zoomBoxMove(curX, curY);

    this.zoomTimeout = setTimeout(
      () => this.zoomTimeoutAction(this.pinchState.curWidth),
      400
    );

    if (this.props.onZoom) this.props.onZoom();
  }

  zoomTimeoutAction(width: number | null = null) {
    this.zoomTimeout = null;
    this.isZooming = false;

    if (this.zoomPercentRef.current)
      this.zoomPercentRef.current.style.opacity = "0";

    if (this.imgRef.current && this.imgRefZoomBlur.current) {
      this.imgRef.current.style.transform =
        this.imgRefZoomBlur.current.style.transform;
      if (width === null || width > this.lowResImgIntrinsicWidth) {
        this.imgRef.current.style.opacity = "1";
        this.imgRefZoomBlur.current.style.opacity = "0";
      }
    }

    if (this.props.onZoomEnd) {
      this.props.onZoomEnd({
        x: this.pinchState.curX,
        y: this.pinchState.curY,
        width: this.pinchState.curWidth,
        height: this.pinchState.curHeight,
        zoomValue: this.pinchState.curZoomValue,
      });
    }
  }

  resetZoomLocation() {
    if (this.wrapRef.current && this.canvasClickRef.current) {
      const locX =
        this.curPoint.x > 0
          ? this.pinchState.curWidth < this.mainRefRect.width
            ? (this.mainRefRect.width - this.pinchState.curWidth) / 2
            : 0
          : this.curPoint.x;
      const locY =
        this.curPoint.y > 0
          ? this.pinchState.curHeight < this.mainRefRect.height
            ? (this.mainRefRect.height - this.pinchState.curHeight) / 2
            : 0
          : this.curPoint.y;

      this.curPoint.x = locX;
      this.curPoint.y = locY;
      this.pinchState.curX = locX;
      this.pinchState.curY = locY;

      this.wrapRef.current.style.transition = "none";
      this.wrapRef.current.style.transform = `translate3d(${locX}px, ${locY}px, 0)`;
      this.canvasClickRef.current.style.transform = `translate3d(${locX}px, ${locY}px, 0) scaleX(${
        this.pinchState.curWidth / this.pinchState.initImgWidth
      }) scaleY(${this.pinchState.curHeight / this.pinchState.initImgHeight})`;

      this.zoomBoxMove(locX, locY);

      return { x: locX, y: locY };
    }

    return null;
  }

  zoomToLocation({ x, y, xOffset, yOffset = 0, xValMin = 0 }: ZoomToLocProps) {
    if (
      this.imgRef.current &&
      this.mainRef.current &&
      this.wrapRef.current &&
      this.containRef.current &&
      this.canvasClickRef.current
    ) {
      const limitXOffset = this.props.limitXOffset ?? 0;
      const limitYOffset = 0;
      const zoomMaxWidth = this.mainImgIntrinsicWidth;

      let forceScale = false;
      let newImgWidth = this.pinchState.curWidth;
      if (
        !this.hasUserZoomedToLoc ||
        this.pinchState.zoomPercent === 0 ||
        this.imgRef.current.getBoundingClientRect().height <
          this.mainRefRect.height
      ) {
        newImgWidth = zoomMaxWidth * (this.props.zoomToPercent / 100);

        this.containRef.current.style.opacity = "1";

        this.imgRef.current.style.transform = `scale(${
          newImgWidth / this.pinchState.initImgWidth
        })`;

        if (this.imgRefZoomBlur.current)
          this.imgRefZoomBlur.current.style.transform =
            this.imgRef.current.style.transform;

        forceScale = true;
      }

      const _imgRect = this.imgRef.current.getBoundingClientRect();
      let xVal =
        -x * newImgWidth -
        xOffset / 2 +
        this.mainRefRect.width -
        this.mainRefRect.width / 2;
      let yVal =
        -y * _imgRect.height +
        this.mainRefRect.height -
        this.mainRefRect.height / 2 +
        yOffset;

      const { limitX, limitY } = getBounds(
        {
          width: newImgWidth,
          height: _imgRect.height,
        },
        this.mainRefRect
      );

      if (xVal > limitXOffset) xVal = xValMin;
      if (xVal < limitX) xVal = limitX;

      if (yVal < limitY) yVal = limitY;
      if (yVal > limitYOffset)
        yVal =
          _imgRect.height < this.mainRefRect.height
            ? (this.mainRefRect.height - _imgRect.height) / 2
            : 0;

      let shouldAnimate = xVal !== this.curPoint.x || yVal !== this.curPoint.y;

      if (
        (xVal === this.curPoint.x &&
          _imgRect.height < this.mainRefRect.height) ||
        forceScale ||
        !(
          Math.abs(xVal - this.curPoint.x) > 10 ||
          Math.abs(yVal - this.curPoint.y) > 10
        )
      )
        shouldAnimate = false;

      this.curPoint.x = xVal;
      this.curPoint.y = yVal;

      this.pinchState.curX = xVal;
      this.pinchState.curY = yVal;
      this.pinchState.curWidth = newImgWidth;
      this.pinchState.curHeight = _imgRect.height;
      this.pinchState.curZoomValue =
        this.pinchState.curWidth / this.pinchState.initImgWidth;

      this.pinchState.zoomPercent =
        !this.hasUserZoomedToLoc || forceScale
          ? ((newImgWidth - this.pinchState.initImgWidth) * 100) /
            (zoomMaxWidth - this.pinchState.initImgWidth)
          : this.pinchState.zoomPercent;

      this.zoomPercent = this.pinchState.zoomPercent;

      this.wrapRef.current.style.transition = shouldAnimate
        ? "transform 1000ms"
        : "none";
      this.wrapRef.current.style.transform = `translate3d(${
        xVal ?? this.curPoint.x
      }px, ${yVal ?? this.curPoint.y}px, 0)`;

      this.canvasClickRef.current.style.transform = `translate3d(${
        xVal ?? this.curPoint.x
      }px, ${yVal ?? this.curPoint.y}px, 0) scaleX(${
        newImgWidth / this.pinchState.initImgWidth
      }) scaleY(${_imgRect.height / this.pinchState.initImgHeight})`;

      this.zoomBoxMove(xVal ?? this.curPoint.x, yVal ?? this.curPoint.y);

      this.hasUserZoomedToLoc = true;

      return {
        x: xVal,
        y: yVal,
        width: newImgWidth,
        height: _imgRect.height,
        animate: shouldAnimate,
      };
    }

    return {
      x: 0,
      y: 0,
      width: 0,
      height: 0,
      animate: false,
    };
  }

  zoomBoxMove(curX: number, curY: number, imgRect?: DOMRect) {
    if (
      this.zoomBoxRef.current &&
      this.mainRef.current &&
      this.imgRef.current
    ) {
      const curWidth = imgRect?.width ?? this.pinchState.curWidth;
      const curHeight = imgRect?.height ?? this.pinchState.curHeight;
      const widthDiff =
        this.mainRefRect.width < curWidth
          ? this.mainRefRect.width / curWidth
          : 1;
      const heightDiff =
        this.mainRefRect.height < curHeight
          ? this.mainRefRect.height / curHeight
          : 1;

      let zoomLocX = -curX * (this.zoomBoxState.initWidth / curWidth);
      let zoomLocY = -curY * (this.zoomBoxState.initHeight / curHeight);
      if (zoomLocX < 0) zoomLocX = 0;
      if (zoomLocY < 0) zoomLocY = 0;

      this.curPointZoomBox.x = zoomLocX;
      this.curPointZoomBox.y = zoomLocY;

      this.zoomBoxRef.current.style.transform = `translate3d(${zoomLocX}px, ${zoomLocY}px, 0)`;
      this.zoomBoxRef.current.style.width = `${
        this.zoomBoxState.initWidth * widthDiff
      }px`;

      this.zoomBoxRef.current.style.height = `${
        this.zoomBoxState.initHeight * heightDiff
      }px`;
    }
  }

  zoomBoxReset() {
    if (this.zoomBoxImgRef.current && this.zoomBoxRef.current) {
      this.zoomBoxRef.current.style.transform = "none";
      this.zoomBoxRef.current.style.width = `${this.zoomBoxState.initWidth}px`;
      this.zoomBoxRef.current.style.height = `${this.zoomBoxState.initHeight}px`;
    }
  }

  render() {
    const {
      src,
      smallerSrc,
      previewBoxSrc,
      enableControls,
      enableZoomPreview,
      children,
      controls,
      disabled,
      imgLoader,
      zoomSupportLoader,
      errorDisplay,
      buttonEnablePanZoomText,
      primaryColor,
      secondaryColor,
      tertiaryColor,
    } = this.props;
    const {
      panZoomActive,
      imgLoaded,
      imgError,
      removeImgSupport,
      zoomSupportImgLoaded,
    } = this.state;

    const mainContainerClassName = clsx({
      "image-pan-and-zoom": true,
      "is-fullscreen": panZoomActive,
      enable: imgLoaded,
    });
    const wrapperClassName = clsx({
      wrapper: true,
      "pan-and-zoom": panZoomActive,
    });
    const canvasClickClassName = clsx({
      "click-canvas": true,
      "pan-and-zoom": panZoomActive,
    });
    const imgClassName = clsx({
      "pan-and-zoom": panZoomActive,
    });
    const zoomSupportImgClassName = clsx({
      "zoom-support-image": true,
      "pan-and-zoom": panZoomActive,
    });
    const panZoomBtnClassName = clsx({
      "button--activate-pan-zoom": true,
      hide: panZoomActive,
    });
    const imgPreviewContainrClassName = clsx({
      "container--img-preview": true,
      show: panZoomActive,
      loaded: imgLoaded,
    });

    const displayControlContainer = controls || enableControls;
    const isDisabled =
      disabled || (!this.firstLoad && !zoomSupportImgLoaded && !!panZoomActive);

    return (
      <StyledMainContainer
        ref={this.containRef}
        className={mainContainerClassName}
        primaryColor={primaryColor}
        secondaryColor={secondaryColor}
        tertiaryColor={tertiaryColor}
        data-testid="imagePanAndZoom"
      >
        {!removeImgSupport ? (
          <img
            ref={this.imgSupportRef}
            className="zoom-support-scaled"
            draggable="false"
            src={src}
            alt="support zooming"
          />
        ) : null}
        <div
          data-testid="imagePanAndZoomWrapper"
          className={wrapperClassName}
          ref={this.mainRef}
          style={{
            cursor: disabled
              ? "default"
              : panZoomActive || !imgLoaded
              ? "default"
              : "zoom-in",
            height: panZoomActive
              ? "100vh"
              : !imgLoaded
              ? `${(Math.min(window.innerWidth, 1040) / 16) * 9 - 25}px`
              : "auto",
          }}
          onClick={
            panZoomActive || isDisabled || !imgLoaded
              ? undefined
              : () => {
                  this.setState((prevState) => ({
                    ...prevState,
                    panZoomActive: true,
                  }));
                }
          }
          onMouseDown={this.handleMouseDown}
          onMouseMove={this.handleMouseMove}
          onMouseUp={this.handleMouseUp}
          onMouseOut={this.handleMouseUp}
          onTouchStart={this.handleTouchStart}
          onTouchMove={this.handleTouchMove}
          onTouchEnd={this.handleTouchEnd}
          onTouchCancel={this.handleTouchCancel}
        >
          {((!imgLoaded && !imgError) ||
            (panZoomActive && !zoomSupportImgLoaded && !this.firstLoad)) && (
            <div className="container--loading">
              {panZoomActive && !zoomSupportImgLoaded && !this.firstLoad
                ? zoomSupportLoader
                : imgLoader}
            </div>
          )}
          {imgError && <div className="container--loading">{errorDisplay}</div>}
          <div ref={this.wrapRef} className="container--image">
            {src !== null && (
              <img
                ref={this.imgRef}
                className={imgClassName}
                data-testid="mainImgElement"
                draggable="false"
                src={src}
                alt="main display for pan and zoom"
                onLoad={this.handleImageLoad}
                onError={this.handleImageError}
                style={{ opacity: smallerSrc ? 0 : 1 }}
              />
            )}
            {src !== null && smallerSrc && (
              <img
                ref={this.imgRefZoomBlur}
                className={zoomSupportImgClassName}
                draggable="false"
                src={smallerSrc}
                alt="displayed during zoom"
                onLoad={this.handleLowResImageLoad}
              />
            )}
          </div>
          <div className={canvasClickClassName} ref={this.canvasClickRef}>
            {!panZoomActive && imgLoaded && (
              <Button
                disabled={isDisabled}
                dataTestId="imagePanAndZoomEnableButton"
                ariaLabel="activate pan and zoom"
                className={panZoomBtnClassName}
                primaryColor={primaryColor}
                secondaryColor={secondaryColor}
                tertiaryColor={tertiaryColor}
              >
                {buttonEnablePanZoomText ||
                  ImagePanAndZoom.defaultProps.buttonEnablePanZoomText}
              </Button>
            )}
          </div>
          <div
            style={{
              display: zoomSupportImgLoaded && panZoomActive ? "block" : "none",
            }}
          >
            {children}
          </div>
        </div>
        {!enableZoomPreview ? null : panZoomActive && (
          <div className={imgPreviewContainrClassName}>
            <div
              className="wrapper--img-preview"
              ref={this.zoomBoxWrapperRef}
              onMouseDown={this.handleZoomBoxMouseDown}
            >
              <div className="zoom-box" ref={this.zoomBoxRef} />
              <img
                draggable="false"
                src={previewBoxSrc}
                alt="preview pan location display"
                ref={this.zoomBoxImgRef}
                onLoad={(e) => {
                  if (this.zoomBoxImgRef.current && this.zoomBoxRef.current) {
                    this.zoomBoxState.initWidth =  this.zoomBoxImgRef.current.clientWidth;
                    this.zoomBoxState.initHeight = this.zoomBoxImgRef.current.clientHeight;
                    this.zoomBoxRef.current.style.width = `${this.zoomBoxState.initWidth}px`;
                    this.zoomBoxRef.current.style.height = `${this.zoomBoxState.initHeight}px`;
                  }
                }}
              />
            </div>
          </div>
        )}
        {panZoomActive && (
          <Button
            disabled={isDisabled}
            dataTestId="imagePanAndZoomCloseButton"
            ariaLabel="close pan and zoom"
            className="button--close-pan-zoom"
            primaryColor={primaryColor}
            secondaryColor={secondaryColor}
            tertiaryColor={tertiaryColor}
            onClick={() => {
              if (this.zoomTimeout) {
                clearTimeout(this.zoomTimeout as ReturnType<typeof setTimeout>);
                this.zoomTimeout = null;
              }

              this.zoomPercent = 0;
              this.isZooming = false;

              this.pinchState.curWidth = this.pinchState.initImgWidth;
              this.pinchState.curHeight = this.pinchState.initImgHeight;

              this.pinchState.zoomPercent = 0;
              this.pinchState.curZoomValue = 1;

              if (this.imgRefZoomBlur.current && this.imgRef.current) {
                this.imgRef.current.style.opacity = "0";
                this.imgRefZoomBlur.current.style.opacity = "1";
              }

              this.setState({
                ...this.state,
                panZoomActive: false,
              });

              if (this.props.onPanZoomActivate && this.imgRef.current)
                this.props.onPanZoomActivate(false);
            }}
          >
            <X />
          </Button>
        )}
        {panZoomActive && displayControlContainer && (
          <div className="container--cta-pan-and-zoom">
            {enableControls ? (
              <Button
                className="button--zoom-in"
                dataTestId="imagePanAndZoomInButton"
                disabled={isDisabled}
                ariaLabel="zoom in"
                primaryColor={primaryColor}
                secondaryColor={secondaryColor}
                tertiaryColor={tertiaryColor}
                onClick={this.handleClickZoom(true)}
              >
                <Plus />
              </Button>
            ) : null}
            {enableControls ? (
              <Button
                className="button--zoom-out"
                dataTestId="imagePanAndZoomOutButton"
                disabled={isDisabled}
                ariaLabel="zoom out"
                primaryColor={primaryColor}
                secondaryColor={secondaryColor}
                tertiaryColor={tertiaryColor}
                onClick={this.handleClickZoom(false)}
              >
                <Minus />
              </Button>
            ) : null}
            {enableControls ? (
              <Button
                className="button--re-center"
                dataTestId="imagePanAndZoomResetButton"
                disabled={isDisabled}
                ariaLabel="re-center"
                primaryColor={primaryColor}
                secondaryColor={secondaryColor}
                tertiaryColor={tertiaryColor}
                onClick={this.handleReCenter}
              >
                <Minimize />
              </Button>
            ) : null}
            {!(!this.firstLoad && !zoomSupportImgLoaded && !!panZoomActive) &&
              controls}
          </div>
        )}
        {panZoomActive && (
          <span className="zoom-percent" ref={this.zoomPercentRef} />
        )}
      </StyledMainContainer>
    );
  }
}

export default ImagePanAndZoom;
