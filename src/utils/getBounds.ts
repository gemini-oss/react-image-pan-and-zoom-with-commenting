export const getBounds = (
  imgRect: { width: number; height: number },
  mainRect: { width: number; height: number }
) => {
  const limitX =
    mainRect.width < imgRect.width
      ? mainRect.width - imgRect.width
      : (mainRect.width - imgRect.width) / 2;

  const limitY = mainRect.height - imgRect.height;

  return {
    limitX,
    limitY,
  };
};
